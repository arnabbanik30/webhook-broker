import mqConnection from "./rabbitmq";
import { WEBHOOK_EVENTES_QUEUE } from "./config";

const listen = async () => {
  await mqConnection.connect();
  await mqConnection.consume(WEBHOOK_EVENTES_QUEUE);
};

listen();