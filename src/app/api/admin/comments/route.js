import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  let connection;
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    connection = await pool.getConnection();
    
    // Fetch all comments with content info and replies
    const [comments] = await connection.query(`
      SELECT 
        c.id, c.user_id, c.content_id, c.parent_comment_id, 
        c.comment, c.created_at, c.updated_at,
        co.title as content_title, co.thumbnail_url as content_thumbnail,
        u.name as user_name
      FROM comments c
      JOIN content co ON c.content_id = co.id
      JOIN users u ON c.user_id = u.id
      WHERE c.parent_comment_id IS NULL
      ORDER BY c.created_at DESC
    `);

    // Fetch replies for each comment
    for (let comment of comments) {
      const [replies] = await connection.query(`
        SELECT r.*, u.name as user_name
        FROM comments r
        JOIN users u ON r.user_id = u.id
        WHERE r.parent_comment_id = ?
        ORDER BY r.created_at ASC
      `, [comment.id]);
      
      comment.replies = replies;
    }

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
} 