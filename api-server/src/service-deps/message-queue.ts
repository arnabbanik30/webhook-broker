import amqp from 'amqplib';

import { connectAndConfigureMQ } from "../configs/message-queue";

export async function runWorker(
    worker: (channel: amqp.Channel) => void | Promise<void>
) {
    let connection: amqp.ChannelModel, channel: amqp.Channel;
    try {
        [connection, channel] = await connectAndConfigureMQ();
        const result = worker(channel);
        if (result instanceof Promise) {
            await result;
        }
    } finally {
        connection.close();
    }
}