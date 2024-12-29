import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
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

    const content = await request.json();
    console.log('Received content:', content); // Debug log

    const connection = await pool.getConnection();

    // Insert content with all fields
    const [result] = await connection.query(
      `INSERT INTO content 
       (title, description, type, price, thumbnail_url, content_url, trailer_url, genre, release_year, duration) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        content.title,
        content.description,
        content.type,
        content.price,
        content.thumbnail_url,
        content.content_url,
        content.trailer_url,
        content.genre || null,
        content.release_year || null,
        content.duration || null
      ]
    );

    connection.release();

    console.log('Content added successfully:', result); // Debug log

    return NextResponse.json({
      message: 'Content added successfully',
      contentId: result.insertId
    });
  } catch (error) {
    console.error('Failed to add content:', error);
    return NextResponse.json(
      { error: 'Failed to add content: ' + error.message },
      { status: 500 }
    );
  }
}

// Get all content
export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM content ORDER BY created_at DESC');
    connection.release();
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
} 