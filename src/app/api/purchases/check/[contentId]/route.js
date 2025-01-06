import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  let connection;
  try {
    const session = await getServerSession(authOptions);
    const token = request.headers.get('authorization')?.split(' ')[1];
    let userId;

    if (session?.user?.id) {
      userId = session.user.id;
    } else if (token) {
      const decoded = await verifyToken(token);
      userId = decoded?.userId;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    connection = await pool.getConnection();
    
    // Check purchases with status and expiry in a single query
    const [result] = await connection.query(`
      SELECT 
        p.*,
        c.rental_duration,
        EXISTS (
          SELECT 1 FROM orders o 
          WHERE o.user_id = ? AND o.content_id = ? AND o.status = 'paid'
        ) as has_pending_order,
        CASE 
          WHEN p.purchase_date >= DATE_SUB(NOW(), INTERVAL COALESCE(p.rental_duration, c.rental_duration) DAY) 
          AND p.status = 'active' THEN true
          ELSE false
        END as is_active
      FROM purchases p
      JOIN content c ON p.content_id = c.id
      WHERE p.user_id = ? AND p.content_id = ?
      ORDER BY p.purchase_date DESC
      LIMIT 1
    `, [userId, params.contentId, userId, params.contentId]);

    // Update expired status if needed
    if (result.length > 0 && !result[0].is_active) {
      await connection.query(
        'UPDATE purchases SET status = ? WHERE id = ?',
        ['expired', result[0].id]
      );
    }

    const hasActiveAccess = result.some(p => p.is_active);

    return NextResponse.json({
      purchased: hasActiveAccess,
      status: {
        hasActivePurchase: result.some(p => p.is_active),
        hasPendingOrder: result.some(p => p.has_pending_order),
        isExpired: result.length > 0 && !result.some(p => p.is_active)
      }
    });
  } catch (error) {
    console.error('Purchase check error:', error);
    return NextResponse.json(
      { error: 'Failed to check purchase status', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (err) {
        console.error('Error releasing connection:', err);
      }
    }
  }
}