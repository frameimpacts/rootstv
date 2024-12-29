import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Get single content
export async function GET(request, { params }) {
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
    const [rows] = await connection.query(
      'SELECT * FROM content WHERE id = ?',
      [params.id]
    );
    connection.release();

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// Update content
export async function PUT(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const content = await request.json();
    const connection = await pool.getConnection();

    await connection.query(
      `UPDATE content 
       SET title = ?, description = ?, type = ?, price = ?, 
           thumbnail_url = ?, content_url = ?, genre = ?, 
           release_year = ?, duration = ?, trailer_url = ?
       WHERE id = ?`,
      [
        content.title,
        content.description,
        content.type,
        content.price,
        content.thumbnail_url,
        content.content_url,
        content.genre,
        content.release_year,
        content.duration,
        content.trailer_url,
        params.id
      ]
    );

    connection.release();

    return NextResponse.json({ message: 'Content updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
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