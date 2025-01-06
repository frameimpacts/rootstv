import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const session = await getServerSession(authOptions);
    const token = request.headers.get('authorization')?.split(' ')[1];
    let userId;

    if (session?.user?.id) {
      userId = session.user.id;
    } else if (token) {
      const decoded = await verifyToken(token);
      userId = decoded?.userId;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    connection = await pool.getConnection();
    
    const [contentDetails] = await connection.query(`
      SELECT 
        c.id,
        c.title,
        AVG(r.rating) as avg_rating,
        COUNT(DISTINCT r.id) as total_ratings,
        MAX(ur.rating) as user_rating,
        MAX(p.status = 'active') as is_rented,
        MAX(
          TIMESTAMPDIFF(
            SECOND,
            NOW(),
            DATE_ADD(p.purchase_date, INTERVAL COALESCE(p.rental_duration, c.rental_duration) DAY)
          ) / 86400.0
        ) as days_left
      FROM content c
      LEFT JOIN reviews r ON c.id = r.content_id
      LEFT JOIN reviews ur ON c.id = ur.content_id AND ur.user_id = ?
      LEFT JOIN purchases p ON c.id = p.content_id AND p.user_id = ? AND p.status = 'active'
      WHERE c.id = ?
      GROUP BY c.id, c.title
    `, [userId, userId, params.id]);

    if (!contentDetails || !contentDetails.length) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const result = {
      isRented: Boolean(contentDetails[0].is_rented),
      daysLeft: contentDetails[0].days_left || 0,
      rating: parseFloat(contentDetails[0].avg_rating) || 0,
      userRating: parseInt(contentDetails[0].user_rating) || 0,
      totalRatings: parseInt(contentDetails[0].total_ratings) || 0
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching content status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content status', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (err) {
        console.error('Error releasing connection:', err);
      }
    }
  }
} 