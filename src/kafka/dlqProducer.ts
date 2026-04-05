import { kafka } from "../config/kafka";

const producer = kafka.producer();

export const sendToDLQ = async (data: any) => {
  await producer.connect();

  await producer.send({
    topic: "booking_dlq",
    messages: [
      {
        value: JSON.stringify(data),
      },
    ],
  });
};