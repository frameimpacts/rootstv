import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    // Verify admin authorization
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const connection = await pool.getConnection();
    
    // Get recent content, ordered by creation date
    const [rows] = await connection.query(
      'SELECT * FROM content ORDER BY created_at DESC LIMIT 10'
    );
    
    connection.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch recent content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent content' },
      { status: 500 }
    );
  }
} 