import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const connection = await pool.getConnection();

    const [movies] = await connection.query(
      'SELECT COUNT(*) as count FROM content WHERE type = "movie"'
    );
    const [shows] = await connection.query(
      'SELECT COUNT(*) as count FROM content WHERE type = "show"'
    );
    const [users] = await connection.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "user"'
    );
    const [revenue] = await connection.query(
      'SELECT SUM(amount) as total FROM purchases'
    );

    connection.release();

    return NextResponse.json({
      totalMovies: movies[0].count,
      totalShows: shows[0].count,
      totalUsers: users[0].count,
      totalRevenue: revenue[0].total || 0
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}