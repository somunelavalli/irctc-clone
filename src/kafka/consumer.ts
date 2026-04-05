import { kafka } from "../config/kafka";
import { bookSeat } from "../modules/booking/booking.service";
import { sendToDLQ } from "./dlqProducer";

const consumer = kafka.consumer({ groupId: "booking-group" });

export const startConsumer = async () => {
  await consumer.connect();

  await consumer.subscribe({
    topic: "booking_requests",
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value!.toString());

      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          await bookSeat(
            data.userId,
            data.scheduleId,
            data.idempotencyKey
          );

          console.log("Booking success");
          return;
        } catch (err) {
          retries++;
          console.error(`Retry ${retries}`, err);
        }
      }

      // After retries fail → send to DLQ
      await sendToDLQ(data);
    },
  });
};