import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await pool.getConnection();
    
    const [users] = await connection.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.created_at, 
        u.phone,
        u.last_login,
        u.status,
        COUNT(DISTINCT p.content_id) as rented_movies,
        COUNT(DISTINCT w.content_id) as watchlist_count,
        COUNT(DISTINCT r.content_id) as reviewed_count
      FROM users u
      LEFT JOIN purchases p ON u.id = p.user_id
      LEFT JOIN watchlist w ON u.id = w.user_id
      LEFT JOIN reviews r ON u.id = r.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    connection.release();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, status } = await request.json();

    if (!userId || !status) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    // Update user status
    await connection.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, userId]
    );

    // Get updated user data
    const [[updatedUser]] = await connection.query(`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        created_at, 
        phone,
        last_login,
        status
      FROM users 
      WHERE id = ?
    `, [userId]);

    connection.release();

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    // Delete user's related data first
    await connection.query('DELETE FROM purchases WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM watchlist WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM watch_history WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM reviews WHERE user_id = ?', [userId]);
    
    // Finally delete the user
    await connection.query('DELETE FROM users WHERE id = ?', [userId]);

    connection.release();
    return NextResponse.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 