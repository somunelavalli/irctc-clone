import { kafka } from "../config/kafka";
import { bookSeat } from "../modules/booking/booking.service";

const consumer = kafka.consumer({ groupId: "booking-group" });

export const startConsumer = async () => {
  await consumer.connect();

  await consumer.subscribe({
    topic: "booking_requests",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
        console.log("message :::", message);
        
      const data = JSON.parse(message.value!.toString());

      console.log("Processing booking:", data);

      try {
        await bookSeat(data.userId, data.scheduleId);
        console.log("Booking success");
      } catch (err) {
        console.error("Booking failed:", err);
      }
    },
  });
};