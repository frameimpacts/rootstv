import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function DELETE(request, { params }) {
  let connection;
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    connection = await pool.getConnection();

    // Delete the comment and all its replies in a transaction
    await connection.beginTransaction();
    
    try {
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
    } catch (error) {
      await connection.rollback();
      throw error;
    }

    return NextResponse.json({ message: 'Comment and replies deleted successfully' });
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