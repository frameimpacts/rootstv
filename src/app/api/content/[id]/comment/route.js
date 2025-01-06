import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  let connection;
  try {
    connection = await pool.getConnection();

    // First fetch main comments
    const [mainComments] = await connection.query(`
      SELECT 
        c.*,
        u.name,
        c.user_id
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.content_id = ? AND c.parent_comment_id IS NULL
      ORDER BY c.created_at DESC
    `, [params.id]);

    // Then fetch all replies for these comments
    const [replies] = await connection.query(`
      SELECT 
        c.*,
        u.name,
        c.user_id
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.content_id = ? AND c.parent_comment_id IS NOT NULL
      ORDER BY c.created_at ASC
    `, [params.id]);

    // Attach replies to their parent comments
    const commentsWithReplies = mainComments.map(comment => ({
      ...comment,
      replies: replies.filter(reply => reply.parent_comment_id === comment.id)
    }));

    return NextResponse.json(commentsWithReplies);
  } catch (error) {
    console.error('Error fetching comments:', error);
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

    const { comment, parentCommentId = null } = await request.json();
    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    connection = await pool.getConnection();

    // Insert new comment
    const [result] = await connection.query(
      'INSERT INTO comments (user_id, content_id, parent_comment_id, comment) VALUES (?, ?, ?, ?)',
      [decoded.userId, params.id, parentCommentId, comment.trim()]
    );

    // Fetch the inserted comment with user details
    const [newComment] = await connection.query(`
      SELECT 
        c.*,
        u.name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    return NextResponse.json({ 
      message: 'Comment submitted successfully',
      comment: newComment[0]
    });
  } catch (error) {
    console.error('Comment submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit comment' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
} 