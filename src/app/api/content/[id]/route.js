import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = params;

    // Single query to get all needed data
    const [result] = await connection.query(`
      SELECT 
        c.*,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as total_ratings
      FROM content c
      LEFT JOIN reviews r ON c.id = r.content_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);

    if (!result.length) {
      return Response.json({ error: 'Content not found' }, { status: 404 });
    }

    return Response.json({
      ...result[0],
      rating: Number(result[0].avg_rating) || 0,
      totalRatings: Number(result[0].total_ratings) || 0
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
} 