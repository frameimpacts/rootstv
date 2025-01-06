import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { progress } = await request.json();
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: 'Invalid progress value' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    // Check if watch history exists
    const [existingHistory] = await connection.query(
      'SELECT id FROM watch_history WHERE user_id = ? AND content_id = ?',
      [session.user.id, params.id]
    );

    if (existingHistory.length > 0) {
      // Update existing watch history
      await connection.query(
        'UPDATE watch_history SET progress = ?, last_watched = NOW() WHERE user_id = ? AND content_id = ?',
        [progress, session.user.id, params.id]
      );
    } else {
      // Insert new watch history
      await connection.query(
        'INSERT INTO watch_history (user_id, content_id, progress, last_watched) VALUES (?, ?, ?, NOW())',
        [session.user.id, params.id, progress]
      );
    }

    // Increment views count if progress is being set for the first time or reset to 0
    if (progress === 0 || !existingHistory.length) {
      await connection.query(
        'UPDATE content SET views = views + 1 WHERE id = ?',
        [params.id]
      );
    }

    connection.release();

    return NextResponse.json({ message: 'Watch history updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update watch history' },
      { status: 500 }
    );
  }
} 