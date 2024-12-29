import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PUT(request, { params }) {
  let connection;
  try {
    // Verify admin authorization
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { status } = await request.json();
    if (!['normal', 'featured', 'trending'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status value' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE content SET status = ? WHERE id = ?',
      [status, params.id]
    );
    
    return NextResponse.json({ 
      message: 'Content status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating content status:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update content status' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
} 