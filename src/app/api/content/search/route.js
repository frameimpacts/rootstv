import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json([]);
    }

    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      'SELECT * FROM content WHERE title LIKE ? OR description LIKE ?',
      [`%${query}%`, `%${query}%`]
    );

    connection.release();
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}