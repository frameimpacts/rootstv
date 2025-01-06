import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  let connection;
  try {
    // Debug token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      console.error('No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Debug token verification
    const decoded = await verifyToken(token);
    if (decoded.role !== 'admin') {
      console.error('User is not admin:', decoded);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    connection = await pool.getConnection();
    
    const [rows] = await connection.query(`
      SELECT 
        o.id,
        o.order_id,
        o.amount,
        o.created_at,
        o.rental_duration,
        u.name as user_name,
        c.title as content_title,
        c.type as content_type
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN content c ON o.content_id = c.id
      WHERE o.status = 'paid'
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    // Debug results
    console.log('Fetched sales data:', rows);

    if (!rows || rows.length === 0) {
      console.log('No sales data found');
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error in recent-sales API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent sales', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
} 