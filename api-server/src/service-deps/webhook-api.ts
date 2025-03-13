import amqp from 'amqplib';

import config from '../configs/configvars';
import { runWorker } from './message-queue';
import Webhook, { IWebhook } from '../schemas/webhook';
import { NotFoundError } from '../schemas/error';

export async function registerWebhook(eventName: string, webhookUrl: string) {
    const webhook = new Webhook({ eventName, webhookUrl });
    await webhook.save();
    return webhook;
};

export async function getAllWebhooks(): Promise<IWebhook[]> {
    return await Webhook.find();
};

export async function getEventWebhooks(eventName: string): Promise<IWebhook[]> {
    return await Webhook.find({ eventName });
};

export async function dispatchWebhookTasks(eventName: string, payload: any): Promise<boolean> {
    const webhooks = await Webhook.find({ eventName });
    if (webhooks === null) {
        throw new NotFoundError("Event not found in webhook registry");
    }

    let results: boolean[] = [];

    await runWorker((channel: amqp.Channel) => {
        results = webhooks.map((wh) => channel.sendToQueue(
            config.RABBITMQ_QUEUE,
            Buffer.from(JSON.stringify({ webhookUrl: wh.webhookUrl, payload })),
            { persistent: true }
        ));
    });

    return results.every((x) => x);
};