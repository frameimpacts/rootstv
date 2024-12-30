import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const orderId = params.orderId;
    const connection = await pool.getConnection();

    try {
      // First check local database
      const [orders] = await connection.query(
        'SELECT status, payment_session_id FROM orders WHERE order_id = ?',
        [orderId]
      );

      if (orders.length === 0) {
        return NextResponse.json({ status: 'not_found' });
      }

      // If status is still pending, verify with Cashfree
      if (orders[0].status === 'pending') {
        const cashfreeResponse = await fetch(`https://api.cashfree.com/pg/orders/${orderId}`, {
          headers: {
            'x-client-id': process.env.CASHFREE_APP_ID,
            'x-client-secret': process.env.CASHFREE_SECRET_KEY,
            'x-api-version': '2022-09-01'
          }
        });

        if (cashfreeResponse.ok) {
          const cashfreeData = await cashfreeResponse.json();
          const newStatus = cashfreeData.order_status.toLowerCase();

          // Update local database with Cashfree status
          await connection.query(
            'UPDATE orders SET status = ? WHERE order_id = ?',
            [newStatus, orderId]
          );

          // If payment successful, create purchase record
          if (newStatus === 'paid' || newStatus === 'success') {
            const [orderDetails] = await connection.query(
              'SELECT user_id, content_id, amount FROM orders WHERE order_id = ?',
              [orderId]
            );
          
            if (orderDetails.length > 0) {
              await connection.query(
                'INSERT INTO purchases (user_id, content_id, amount) VALUES (?, ?, ?)',
                [orderDetails[0].user_id, orderDetails[0].content_id, orderDetails[0].amount]
              );
            }
          }

          return NextResponse.json({ status: newStatus });
        }
      }

      return NextResponse.json({ status: orders[0].status });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
} 