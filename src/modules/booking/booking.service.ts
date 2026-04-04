import { pool } from "../../config/db";
import { redis } from "../../config/redis";

export const bookSeat = async (
  userId: string,
  scheduleId: string
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Get available seats
    const seatRes = await client.query(
      `SELECT * FROM seats 
       WHERE schedule_id = $1 AND status = 'AVAILABLE'
       LIMIT 5`, // fetch multiple
      [scheduleId]
    );

    if (seatRes.rows.length === 0) {
      throw new Error("No seats available");
    }

    let selectedSeat = null;

    // 2️⃣ Try locking seats in Redis
    for (const seat of seatRes.rows) {
      const lockKey = `lock:seat:${seat.id}`;

      const isLocked = await redis.set(
        lockKey,
        userId,
        "EX",
        30,
        "NX"
      );
      console.log(`Trying to lock seat ${seat.id} for user ${userId}: ${isLocked ? "Success" : "Failed"}`);

      if (isLocked) {
        selectedSeat = seat;
        break;
      }
    }

    if (!selectedSeat) {
      throw new Error("Seats are being booked, try again");
    }

    // 3️⃣ DB update (final consistency)
    await client.query(
      `UPDATE seats SET status = 'BOOKED' WHERE id = $1`,
      [selectedSeat.id]
    );

    await client.query(
      `INSERT INTO bookings (user_id, schedule_id, seat_id, status)
       VALUES ($1, $2, $3, 'CONFIRMED')`,
      [userId, scheduleId, selectedSeat.id]
    );

    await client.query("COMMIT");

    // 4️⃣ Clear cache
    await redis.del(`availability:${scheduleId}`);

    return {
      success: true,
      seatId: selectedSeat.id,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};