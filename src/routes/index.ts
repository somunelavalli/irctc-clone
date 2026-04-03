import express from "express";
import * as trainController from "../modules/train/train.controller";
import * as bookingController from "../modules/booking/booking.controller";

const router = express.Router();

router.get("/trains", trainController.search);
router.get("/availability", trainController.availability);
router.post("/book", bookingController.book);

export default router;