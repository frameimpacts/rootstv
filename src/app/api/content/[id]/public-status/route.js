import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  let connection;
  try {
    const { id } = params;
    connection = await pool.getConnection();
    
    const [result] = await connection.query(`
      SELECT 
        COALESCE(AVG(rating), 0) as rating,
        COUNT(*) as total_ratings
      FROM reviews
      WHERE content_id = ?
    `, [id]);
    
    return NextResponse.json({
      rating: Number(result[0]?.rating || 0),
      totalRatings: Number(result[0]?.total_ratings || 0)
    });
  } catch (error) {
    console.error('Error fetching public status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public status' }, 
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
} 