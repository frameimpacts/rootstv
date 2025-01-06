import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  let connection;
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    // Insert content
    const [result] = await connection.query(
      `INSERT INTO content (
        title, description, type, price, thumbnail_url, 
        content_url, trailer_url, genre, release_year, 
        duration, rental_duration, status, subscription_type, 
        featured_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title, data.description, data.type, data.price, data.thumbnail_url,
        data.content_url, data.trailer_url, data.genre, data.release_year,
        data.duration, data.rental_duration, data.status, data.subscription_type,
        data.featured_order
      ]
    );

    const contentId = result.insertId;

    // Insert directors
    if (data.directors?.length) {
      const directorValues = data.directors.map(directorId => [contentId, directorId]);
      await connection.query(
        'INSERT INTO content_directors (content_id, person_id) VALUES ?',
        [directorValues]
      );
    }

    // Insert cast members
    if (data.cast?.length) {
      const castValues = data.cast
        .filter(cast => cast.personId && cast.characterName)
        .map(cast => [contentId, cast.personId, cast.characterName]);
      
      if (castValues.length) {
        await connection.query(
          'INSERT INTO content_cast (content_id, person_id, character_name) VALUES ?',
          [castValues]
        );
      }
    }

    // Commit transaction
    await connection.commit();

    return NextResponse.json({
      message: 'Content added successfully',
      contentId
    });

  } catch (error) {
    // Rollback on error
    if (connection) {
      await connection.rollback();
    }
    console.error('Failed to add content:', error);
    return NextResponse.json(
      { error: 'Failed to add content' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Get all content
export async function GET(request) {
  let connection;
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    connection = await pool.getConnection();
    
    const [rows] = await connection.query(`
      SELECT 
        c.*,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.id) as total_ratings
      FROM content c
      LEFT JOIN reviews r ON c.id = r.content_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
} 