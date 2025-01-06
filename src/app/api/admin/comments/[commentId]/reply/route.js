import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request, { params }) {
  let connection;
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { comment } = await request.json();
    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    connection = await pool.getConnection();

    // Get the content_id from the parent comment
    const [parentComment] = await connection.query(
      'SELECT content_id FROM comments WHERE id = ?',
      [params.commentId]
    );

    if (!parentComment.length) {
      return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
    }

    // Insert admin reply
    const [result] = await connection.query(
      'INSERT INTO comments (user_id, content_id, parent_comment_id, comment) VALUES (?, ?, ?, ?)',
      [decoded.userId, parentComment[0].content_id, params.commentId, comment.trim()]
    );

    // Fetch the inserted reply with user details
    const [newReply] = await connection.query(`
      SELECT 
        c.*,
        u.name,
        u.role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    return NextResponse.json({ 
      message: 'Reply submitted successfully',
      reply: newReply[0]
    });
  } catch (error) {
    console.error('Reply submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit reply' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
} 