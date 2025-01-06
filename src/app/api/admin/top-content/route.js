import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(`
      SELECT 
        c.id,
        c.title,
        c.type,
        COUNT(p.id) as purchase_count,
        SUM(p.amount) as total_revenue
      FROM content c
      LEFT JOIN purchases p ON c.id = p.content_id
      GROUP BY c.id
      ORDER BY purchase_count DESC
      LIMIT 5
    `);

    connection.release();
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch top content' },
      { status: 500 }
    );
  }
} 