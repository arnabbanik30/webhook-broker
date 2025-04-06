import mqConnection from "./rabbitmq";
import { WEBHOOK_EVENTS_QUEUE } from "./config";

const listen = async () => {
  await mqConnection.connect();
  await mqConnection.consume(WEBHOOK_EVENTS_QUEUE);
};

listen();