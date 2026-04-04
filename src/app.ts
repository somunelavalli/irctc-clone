import express from "express";
import routes from "./routes";
import { connectProducer } from "./kafka/producer";
import { startConsumer } from "./kafka/consumer";

const app = express();

app.use(express.json());
app.use("/api", routes);

const start = async () => {
  await connectProducer();
  await startConsumer();

  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
};

start();