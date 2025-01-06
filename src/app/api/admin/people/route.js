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
    const [people] = await connection.query('SELECT * FROM people ORDER BY name');
    connection.release();

    return NextResponse.json(people);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch people' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO people (name, role_type, profile_image, bio, birth_date) 
       VALUES (?, ?, ?, ?, ?)`,
      [data.name, data.role_type, data.profile_image, data.bio, data.birth_date]
    );

    connection.release();

    return NextResponse.json({
      message: 'Person added successfully',
      personId: result.insertId
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add person' },
      { status: 500 }
    );
  }
} 