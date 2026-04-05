import { pool } from "../../config/db";
import { redis } from "../../config/redis";

export const bookSeat = async (
  userId: string,
  scheduleId: string,
  idempotencyKey: string
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if already processed
    const existing = await client.query(
      `SELECT * FROM bookings WHERE idempotency_key = $1`,
      [idempotencyKey]
    );

    if (existing.rows.length > 0) {
      await client.query("COMMIT");
      return existing.rows[0];
    }

    // Normal booking logic (Redis + DB)

    const seatRes = await client.query(
      `SELECT * FROM seats 
       WHERE schedule_id = $1 AND status = 'AVAILABLE'
       LIMIT 5`,
      [scheduleId]
    );

    if (seatRes.rows.length === 0) {
      throw new Error("No seats available");
    }

    const seat = seatRes.rows[0];

    await client.query(
      `UPDATE seats SET status = 'BOOKED' WHERE id = $1`,
      [seat.id]
    );

    const booking = await client.query(
      `INSERT INTO bookings 
       (user_id, schedule_id, seat_id, status, idempotency_key)
       VALUES ($1, $2, $3, 'CONFIRMED', $4)
       RETURNING *`,
      [userId, scheduleId, seat.id, idempotencyKey]
    );

    await client.query("COMMIT");

    return booking.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};