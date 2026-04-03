import { Request, Response } from "express";
import * as trainService from "./train.service";

export const search = async (req: Request, res: Response) => {
  const { source, destination } = req.query;

  const trains = await trainService.searchTrains(
    source as string,
    destination as string
  );

  res.json(trains);
};

export const availability = async (req: Request, res: Response) => {
  const { scheduleId } = req.query;

  const seats = await trainService.getAvailability(
    scheduleId as string
  );

  res.json({ availableSeats: seats });
};