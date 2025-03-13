import axios from 'axios';
import amqp from 'amqplib';

import config from '../configs/configvars';
import { runWorker } from './message-queue';

export async function startDeliveryWorker() {
    runWorker(async (channel: amqp.Channel) => {
        console.log('Webhook delivery worker started, waiting for messages...');
        channel.consume(config.RABBITMQ_QUEUE, async (msg: amqp.ConsumeMessage | null) => {
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
