import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || 10;
    const random = searchParams.get('random') === 'true';

    connection = await pool.getConnection();
    
    let query = 'SELECT * FROM content WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (random) {
      query += ' ORDER BY RAND()';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    query += ' LIMIT ?';
    params.push(parseInt(limit));

    const [contents] = await connection.query(query, params);

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
    console.error('Failed to fetch content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}