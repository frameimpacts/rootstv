export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    await connection.query(`
      UPDATE purchases p
      JOIN content c ON p.content_id = c.id
      SET p.status = 'expired'
      WHERE p.status = 'active'
      AND p.purchase_date < DATE_SUB(NOW(), INTERVAL COALESCE(p.rental_duration, c.rental_duration) DAY)
    `);

    return NextResponse.json({ message: 'Rental statuses updated' });
  } catch (error) {
    console.error('Failed to update rental statuses:', error);
    return NextResponse.json(
      { error: 'Failed to update rental statuses' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
} 