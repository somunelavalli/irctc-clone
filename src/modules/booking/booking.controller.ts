import { Request, Response } from "express";
import { sendBookingEvent } from "../../kafka/producer";

export const book = async (req: Request, res: Response) => {
  try {
    const { userId, scheduleId } = req.body;

    // Send to Kafka instead of DB
    await sendBookingEvent({ userId, scheduleId });

    res.json({
      message: "Booking request queued",
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};