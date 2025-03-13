import client, {
  Connection,
  Channel,
  ConsumeMessage,
  ChannelModel,
} from "amqplib";

import { rmqUser, rmqPass, rmqhost } from "./config";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

import { dummyPoster } from "./dummyPoster";

class RabbitMQConnection {
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel) return;
    else this.connected = true;

    try {
      console.log(`⌛️ Connecting to Rabbit-MQ Server`);
      let channelModel: ChannelModel = await client.connect(
        `amqp://${rmqUser}:${rmqPass}@${rmqhost}:5672`
      );

      this.connection = channelModel.connection;

      console.log(`✅ Rabbit MQ Connection is ready`);

      this.channel = await channelModel.createChannel();

      console.log(`🛸 Created RabbitMQ Channel successfully`);
    } catch (error) {
      console.error(error);
      console.error(`Not connected to MQ Server`);
    }
  }
  async consume(queue: string) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      if (this.channel) {
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.prefetch(1);
        await this.channel.consume(queue, async (msg) => {
          if (!msg) return;
          let strMsg = msg.content.toString();
          let parsedMsg = JSON.parse(strMsg);
          console.log(strMsg);
          const { eventName, url, payload } = parsedMsg;
          let attempt = 0;
          let success = false;

          while (!success && attempt < 5) {
            let res = await dummyPoster(url, payload);
            if (res) {
              success = true;
              this.channel.ack(msg);
              console.log(`Sent successfully to ${url}`)
            } else {
              attempt++;
              const backoff = Math.pow(2, attempt) * 1000;
              console.log(`Retrying ${url} in ${backoff}ms`);
              await delay(backoff);
            }
          }

          if (!success){
            console.log("Message failed after 5 attempts, sending to DLQ");
            this.channel?.nack(msg, false, false);
          }
        });
      } else {
        console.log("Channel not available");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

const mqConnection = new RabbitMQConnection();

export default mqConnection;
