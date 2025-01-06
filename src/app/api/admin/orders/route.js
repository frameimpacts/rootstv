import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  let connection;
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    connection = await pool.getConnection();
    
    const [rows] = await connection.query(`
      SELECT 
        o.id,
        o.order_id,
        o.amount,
        o.created_at,
        o.status,
        o.rental_duration,
        u.name as user_name,
        u.email as user_email,
        c.title as content_title,
        c.type as content_type
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN content c ON o.content_id = c.id
      ORDER BY o.created_at DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error in orders API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
} 