import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!token || !decoded?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contentId, amount, currency } = await request.json();
    
    // Debug logs
    console.log('Request data:', { contentId, amount, currency });
    console.log('User from decoded token:', decoded);

    const connection = await pool.getConnection();
    
    try {
      // Get content details
      const [contents] = await connection.query(
        'SELECT * FROM content WHERE id = ?',
        [contentId]
      );

      if (contents.length === 0) {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 });
      }

      const content = contents[0];

      // Verify amount matches content price
      if (parseFloat(amount) !== parseFloat(content.price)) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }

      // Generate unique order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create order in database
      await connection.query(
        'INSERT INTO orders (user_id, content_id, amount, status, order_id, rental_duration) VALUES (?, ?, ?, ?, ?, ?)',
        [decoded.userId, contentId, amount, 'pending', orderId, content.rental_duration]
      );

      // Initialize Cashfree payment
      const cashfreeResponse = await fetch('https://api.cashfree.com/pg/orders', {
        method: 'POST',
        headers: {
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: parseFloat(amount),
          order_currency: currency,
          customer_details: {
            customer_id: decoded.userId.toString(),
            customer_email: decoded.email || '',
            customer_phone: decoded.phone || '0000000000',
            customer_name: decoded.name || 'Customer'
          },
          order_meta: {
            content_id: contentId,
            rental_duration: content.rental_duration,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/status/${orderId}`
          }
        })
      });

      const cashfreeData = await cashfreeResponse.json();

      if (!cashfreeResponse.ok) {
        console.error('Cashfree error:', cashfreeData);
        throw new Error(cashfreeData.message || 'Failed to create payment');
      }

      // Store both payment session ID and order token in the database
      await connection.query(
        'UPDATE orders SET payment_session_id = ?, order_token = ? WHERE order_id = ?',
        [cashfreeData.payment_session_id, cashfreeData.order_token, orderId]
      );

      // Return both in the response
      return NextResponse.json({
        order_id: orderId,
        orderToken: cashfreeData.order_token,
        paymentSessionId: cashfreeData.payment_session_id,
        order_status: cashfreeData.order_status
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
} 