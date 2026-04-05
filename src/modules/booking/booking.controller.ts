import { Request, Response } from "express";
import { sendBookingEvent } from "../../kafka/producer";
// import { v4 as uuidv4 } from "uuid";

export const book = async (req: Request, res: Response) => {
  try {
    const { userId, scheduleId } = req.body;

     const idempotencyKey = `${userId}_${scheduleId}`;

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