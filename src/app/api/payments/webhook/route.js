import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Verify webhook signature
    const webhookSignature = request.headers.get('x-webhook-signature');
    // TODO: Add signature verification using Cashfree's documentation
    
    const orderId = data.order.order_id;
    const status = data.order.order_status.toLowerCase();
    const paymentId = data.order.payment_id;

    const connection = await pool.getConnection();

    // Update order status
    await connection.query(
      'UPDATE orders SET status = ?, payment_id = ? WHERE order_id = ?',
      [status, paymentId, orderId]
    );

    // If payment is successful, create a purchase record
    if (status === 'success') {
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

    connection.release();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 