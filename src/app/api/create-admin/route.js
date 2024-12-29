import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function GET() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const connection = await pool.getConnection();
    
    // Check if admin already exists
    const [existingAdmin] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['admin@example.com']
    );

    if (existingAdmin.length > 0) {
      connection.release();
      return NextResponse.json({ message: 'Admin already exists' });
    }

    // Create admin user
    await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@example.com', hashedPassword, 'admin']
    );

    connection.release();
    
    return NextResponse.json({ 
      message: 'Admin user created successfully',
      credentials: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 