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

    // Get basic stats
    const [contentStats] = await connection.query(`
      SELECT 
        COUNT(*) as totalContent,
        SUM(CASE WHEN type = 'movie' THEN 1 ELSE 0 END) as totalMovies,
        SUM(CASE WHEN type = 'show' THEN 1 ELSE 0 END) as totalShows
      FROM content
    `);

    // Get user stats
    const [userStats] = await connection.query(
      'SELECT COUNT(*) as totalUsers FROM users'
    );

    // Get revenue stats
    const [revenueStats] = await connection.query(`
      SELECT 
        SUM(amount) as totalRevenue,
        COUNT(*) as totalPurchases
      FROM purchases
    `);

    // Get daily revenue for the last 30 days
    const [dailyRevenue] = await connection.query(`
      SELECT 
        DATE(purchase_date) as date,
        SUM(amount) as amount
      FROM purchases
      WHERE purchase_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
      GROUP BY DATE(purchase_date)
      ORDER BY date DESC
    `);

    connection.release();

    return NextResponse.json({
      totalContent: contentStats[0].totalContent,
      totalMovies: contentStats[0].totalMovies,
      totalShows: contentStats[0].totalShows,
      totalUsers: userStats[0].totalUsers,
      totalRevenue: revenueStats[0].totalRevenue || 0,
      totalPurchases: revenueStats[0].totalPurchases || 0,
      dailyRevenue: dailyRevenue
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
} 