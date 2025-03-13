import amqp from 'amqplib';

import { connectAndConfigureMQ } from "../configs/message-queue";

export async function runWorker(
    worker: (channel: amqp.Channel) => void | Promise<void>
) {
    let connection: amqp.ChannelModel | null = null, channel: amqp.Channel | null = null;
    try {
        const conf = await connectAndConfigureMQ();
        connection = conf.connection;
        channel = conf.channel;
        const result = worker(channel);
        if (result instanceof Promise) {
            await result;
        }
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}