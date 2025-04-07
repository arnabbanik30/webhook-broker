import axios from 'axios';
import amqp from 'amqplib';

import { runOnChannel } from '../utils/message-queue';
import logger from 'configs/logger';

export async function startDeliveryWorker() {
    logger.info(`Starting webhook delivery worker...`);
    runOnChannel(async (channel: amqp.Channel) => {
        console.log('Webhook delivery worker started, waiting for messages...');
        channel.consume(process.env.RABBITMQ_QUEUE, async (msg: amqp.ConsumeMessage | null) => {
            if (msg) {
                const { eventName, webhookUrl, payload } = JSON.parse(msg.content.toString());
                try {
                    await axios.post(webhookUrl, payload);
                    channel.ack(msg);
                    console.log(`Webhook successfully delivered to ${webhookUrl}`);
                } catch (error) {
                    console.error(`Failed to deliver webhook to ${webhookUrl} on event ${eventName}:`, error);
                    setTimeout(() => channel.nack(msg, false, true), 5000);
                }
            }
        }, { noAck: false });
    });
}
