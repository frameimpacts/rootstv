import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    console.log('Login attempt for:', email); // Debug log

    const connection = await pool.getConnection();
    
    // Find user
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    console.log('Users found:', users.length); // Debug log

    if (users.length === 0) {
      connection.release();
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    console.log('Password valid:', validPassword); // Debug log

    if (!validPassword) {
      connection.release();
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token with all necessary user data
    const token = jwt.sign(
      { 
        userId: user.id,
        role: user.role,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        phone: user.phone || ''
      },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '24h' }
    );

    // Update last_login
    await connection.query(
      'UPDATE users SET last_login = NOW() WHERE email = ?',
      [email]
    );

    connection.release();
    
    console.log('Login successful for:', email); // Debug log

    // Create the response
    const response = NextResponse.json({ 
      token, 
      role: user.role,
      userId: user.id,
      phone: user.phone || '',
      message: 'Login successful' 
    });

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error); // Debug log
    return NextResponse.json(
      { error: 'Login failed: ' + error.message },
      { status: 500 }
    );
  }
}