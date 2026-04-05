import express from "express";
import * as trainController from "../modules/train/train.controller";
import * as bookingController from "../modules/booking/booking.controller";
import { userRedisLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

router.get("/trains", trainController.search);
router.get("/availability", trainController.availability);
router.post("/book", userRedisLimiter, bookingController.book);
router.get("/booking-status", bookingController.getStatus);

export default router;