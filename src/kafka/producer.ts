import { kafka } from "../config/kafka";

const producer = kafka.producer();

export const connectProducer = async () => {
  await producer.connect();
};

export const sendBookingEvent = async (data: any) => {
  await producer.send({
    topic: "booking_requests",
    messages: [
      {
        value: JSON.stringify(data),
      },
    ],
  });
};