import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function DELETE(request, { params }) {
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

    connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Verify the comment belongs to the user
      const [comment] = await connection.query(
        'SELECT user_id FROM comments WHERE id = ?',
        [params.commentId]
      );

      if (comment.length === 0) {
        await connection.rollback();
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }

      if (comment[0].user_id !== decoded.userId) {
        await connection.rollback();
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Delete all replies first
      await connection.query(
        'DELETE FROM comments WHERE parent_comment_id = ?',
        [params.commentId]
      );

      // Then delete the main comment
      await connection.query(
        'DELETE FROM comments WHERE id = ?',
        [params.commentId]
      );

      await connection.commit();
      return NextResponse.json({ message: 'Comment and replies deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Comment deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
} 