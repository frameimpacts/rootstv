import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [contents] = await connection.query(
      `SELECT * FROM content 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       ORDER BY created_at DESC 
       LIMIT 10`
    );

    // For each content, fetch directors and cast
    const contentsWithRelations = await Promise.all(contents.map(async (content) => {
      const [directors] = await connection.query(
        `SELECT p.id, p.name FROM people p 
         JOIN content_directors cd ON p.id = cd.person_id 
         WHERE cd.content_id = ?`,
        [content.id]
      );

      const [cast] = await connection.query(
        `SELECT p.id, p.name, cc.character_name FROM people p 
         JOIN content_cast cc ON p.id = cc.person_id 
         WHERE cc.content_id = ?`,
        [content.id]
      );

      return {
        ...content,
        directors,
        cast
      };
    }));

    return NextResponse.json(contentsWithRelations);
  } catch (error) {
    console.error('Failed to fetch new releases:', error);
    return NextResponse.json({ error: 'Failed to fetch new releases' }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
} 