import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await pool.getConnection();
    
    const [rentals] = await connection.query(`
      SELECT 
        p.id,
        p.purchase_date,
        p.amount,
        c.id as content_id,
        c.title,
        c.type,
        c.thumbnail_url,
        c.rental_duration,
        CASE 
          WHEN p.purchase_date >= DATE_SUB(NOW(), INTERVAL c.rental_duration DAY) THEN 'active'
          ELSE 'expired'
        END as status,
        CASE
          WHEN wh.progress IS NULL THEN 0
          ELSE wh.progress
        END as progress,
        wh.last_watched
      FROM purchases p
      JOIN content c ON p.content_id = c.id
      LEFT JOIN watch_history wh ON p.content_id = wh.content_id 
        AND p.user_id = wh.user_id
      WHERE p.user_id = ?
      ORDER BY p.purchase_date DESC
    `, [params.userId]);

    // Calculate remaining time for active rentals
    const rentalsWithTimeLeft = rentals.map(rental => {
      if (rental.status === 'active') {
        const purchaseDate = new Date(rental.purchase_date);
        const expiryDate = new Date(purchaseDate);
        expiryDate.setDate(expiryDate.getDate() + rental.rental_duration);
        
        const now = new Date();
        const timeLeft = expiryDate - now;
        const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
        
        return {
          ...rental,
          days_left: daysLeft
        };
      }
      return rental;
    });

    connection.release();
    return NextResponse.json(rentalsWithTimeLeft);
  } catch (error) {
    console.error('Error fetching user rentals:', error);
    return NextResponse.json(
      { message: 'Failed to fetch rentals' },
      { status: 500 }
    );
  }
} 