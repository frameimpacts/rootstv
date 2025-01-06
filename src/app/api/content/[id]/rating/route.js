import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request, { params }) {
  let connection;
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating } = await request.json();
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    connection = await pool.getConnection();

    // Check if user has already rated this content
    const [existingReview] = await connection.query(
      'SELECT id FROM reviews WHERE user_id = ? AND content_id = ?',
      [decoded.userId, params.id]
    );

    if (existingReview.length > 0) {
      // Update existing rating
      await connection.query(
        'UPDATE reviews SET rating = ?, updated_at = NOW() WHERE user_id = ? AND content_id = ?',
        [rating, decoded.userId, params.id]
      );
    } else {
      // Insert new rating
      await connection.query(
        'INSERT INTO reviews (user_id, content_id, rating, created_at) VALUES (?, ?, ?, NOW())',
        [decoded.userId, params.id, rating]
      );
    }

    // Get updated rating stats
    const [updatedStats] = await connection.query(`
      SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_ratings
      FROM reviews 
      WHERE content_id = ?
    `, [params.id]);

    return NextResponse.json({
      message: 'Rating submitted successfully',
      avgRating: Number(updatedStats[0].avg_rating || 0),
      totalRatings: Number(updatedStats[0].total_ratings || 0)
    });
  } catch (error) {
    console.error('Rating submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
} 