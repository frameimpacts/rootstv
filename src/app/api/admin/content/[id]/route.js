import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  let connection;
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    connection = await pool.getConnection();
    
    // Fetch content details
    const [contents] = await connection.query(
      'SELECT * FROM content WHERE id = ?',
      [params.id]
    );

    if (!contents.length) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Fetch associated directors
    const [directors] = await connection.query(
      `SELECT p.id FROM people p 
       JOIN content_directors cd ON p.id = cd.person_id 
       WHERE cd.content_id = ?`,
      [params.id]
    );

    // Fetch associated cast members
    const [cast] = await connection.query(
      `SELECT p.id as personId, cc.character_name as characterName 
       FROM people p 
       JOIN content_cast cc ON p.id = cc.person_id 
       WHERE cc.content_id = ?`,
      [params.id]
    );

    const content = {
      ...contents[0],
      directors: directors.map(d => d.id),
      cast: cast
    };

    return NextResponse.json(content);
  } catch (error) {
    console.error('Failed to fetch content:', error);
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

// Update content
export async function PUT(request, { params }) {
  let connection;
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const content = await request.json();
    connection = await pool.getConnection();
    
    // Start transaction
    await connection.beginTransaction();

    // Update content
    await connection.query(
      `UPDATE content SET 
        title = ?, description = ?, type = ?, price = ?, 
        thumbnail_url = ?, content_url = ?, genre = ?, 
        release_year = ?, duration = ?, trailer_url = ?,
        rental_duration = ?, status = ?, subscription_type = ?,
        featured_order = ?
       WHERE id = ?`,
      [
        content.title, content.description, content.type, content.price,
        content.thumbnail_url, content.content_url, content.genre,
        content.release_year, content.duration, content.trailer_url,
        content.rental_duration || 7, content.status || 'active',
        content.subscription_type || 'basic', 
        content.featured_order || 0,
        params.id
      ]
    );

    // Update directors
    await connection.query('DELETE FROM content_directors WHERE content_id = ?', [params.id]);
    if (content.directors?.length) {
      const directorValues = content.directors.map(directorId => [params.id, directorId]);
      await connection.query(
        'INSERT INTO content_directors (content_id, person_id) VALUES ?',
        [directorValues]
      );
    }

    // Update cast members
    await connection.query('DELETE FROM content_cast WHERE content_id = ?', [params.id]);
    if (content.cast?.length) {
      const castValues = content.cast
        .filter(cast => cast.personId && cast.characterName)
        .map(cast => [params.id, cast.personId, cast.characterName]);
      
      if (castValues.length) {
        await connection.query(
          'INSERT INTO content_cast (content_id, person_id, character_name) VALUES ?',
          [castValues]
        );
      }
    }

    // Commit transaction
    await connection.commit();
    
    return NextResponse.json({ message: 'Content updated successfully' });
  } catch (error) {
    // Rollback on error
    if (connection) {
      await connection.rollback();
    }
    console.error('Failed to update content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Delete content
export async function DELETE(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const connection = await pool.getConnection();
    await connection.query('DELETE FROM content WHERE id = ?', [params.id]);
    connection.release();

    return NextResponse.json({ message: 'Content deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
} 