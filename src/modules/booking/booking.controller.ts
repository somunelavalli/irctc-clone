import { Request, Response } from "express";
import { sendBookingEvent } from "../../kafka/producer";
import { pool } from "../../config/db";
// import { v4 as uuidv4 } from "uuid";

export const book = async (req: Request, res: Response) => {
  try {
    const { userId, scheduleId } = req.body;

     const idempotencyKey = `${userId}_${scheduleId}`;

     // Insert PENDING booking
    await pool.query(
      `INSERT INTO bookings (user_id, schedule_id, status, idempotency_key)
      VALUES ($1, $2, 'PENDING', $3)
      ON CONFLICT (idempotency_key) DO NOTHING`,
      [userId, scheduleId, idempotencyKey]
    );

    // Send to Kafka instead of DB
    await sendBookingEvent({ userId, scheduleId, idempotencyKey });

    res.json({
      message: "Booking request queued",
      idempotencyKey
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  const { idempotencyKey } = req.query;

  const result = await pool.query(
    `SELECT * FROM bookings WHERE idempotency_key = $1`,
    [idempotencyKey]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json(result.rows[0]);
};