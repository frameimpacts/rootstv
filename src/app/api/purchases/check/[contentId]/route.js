import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    // Try both auth methods
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
      console.log('No valid session or token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Checking purchase for user:', userId, 'content:', params.contentId);

    const connection = await pool.getConnection();
    
    // First, let's check purchases table
    const [purchases] = await connection.query(
      'SELECT * FROM purchases WHERE user_id = ? AND content_id = ?',
      [userId, params.contentId]
    );

    console.log('Found purchases:', purchases);

    // Then check orders table
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE user_id = ? AND content_id = ? AND status IN (?, ?)',
      [userId, params.contentId, 'paid', 'success']
    );

    console.log('Found orders:', orders);

    const hasAccess = purchases.length > 0 || orders.length > 0;

    connection.release();
    
    return NextResponse.json({
      purchased: hasAccess,
      debug: {
        userId: userId,
        contentId: params.contentId,
        hasPurchases: purchases.length > 0,
        hasOrders: orders.length > 0
      }
    });
  } catch (error) {
    console.error('Purchase check error:', error);
    return NextResponse.json(
      { error: 'Failed to check purchase status' },
      { status: 500 }
    );
  }
}