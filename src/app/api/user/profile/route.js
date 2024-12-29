import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

export async function PUT(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    try {
      const verified = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );
      
      const data = await request.json();
      const connection = await pool.getConnection();

      try {
        if (data.currentPassword && data.newPassword) {
          // Password change flow
          const [users] = await connection.query(
            'SELECT password FROM users WHERE id = ?',
            [verified.payload.userId]
          );

          if (users.length === 0) {
            return NextResponse.json(
              { error: 'User not found' },
              { status: 404 }
            );
          }

          const isValidPassword = await bcrypt.compare(data.currentPassword, users[0].password);
          
          if (!isValidPassword) {
            return NextResponse.json(
              { error: 'Current password is incorrect' },
              { status: 400 }
            );
          }

          const hashedPassword = await bcrypt.hash(data.newPassword, 10);
          
          await connection.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, verified.payload.userId]
          );

          return NextResponse.json({ message: 'Password updated successfully' });
        } else {
          // Profile details update flow
          await connection.query(
            'UPDATE users SET name = ?, phone = ? WHERE id = ?',
            [data.name, data.phone, verified.payload.userId]
          );
          return NextResponse.json({ message: 'Profile details updated successfully' });
        }
      } finally {
        connection.release();
      }
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 