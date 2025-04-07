import amqp from 'amqplib';

import { connectMq } from "../configs/message-queue";
import logger from 'configs/logger';

export async function runOnChannel<T>(
    fn: (ch: amqp.Channel) => Promise<T>
): Promise<T> {
    let channel: undefined | amqp.Channel = undefined;
    try {
        logger.info(`Connecting to RabbitMQ...`);
        channel = await connectMq();
        logger.info(`Channel successfully connected.`);
        return await fn(channel);
    } catch (error) {
        logger.error(`Error in \`runOnChannel\`: ${error}`);
        throw error;
    } finally {
        if (channel) {
            await channel.close();
        }
    }
}