import { Request, Response } from "express";
import * as bookingService from "./booking.service";

export const book = async (req: Request, res: Response) => {
  try {
    const { userId, scheduleId } = req.body;

    const result = await bookingService.bookSeat(
      userId,
      scheduleId
    );

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};