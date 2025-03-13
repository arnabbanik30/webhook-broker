import amqp from 'amqplib';
import config from './configvars';

export async function connectAndConfigureMQ(): Promise<{ connection: amqp.ChannelModel, channel: amqp.Channel }> {
    const connection = await amqp.connect(config.RABBITMQ_URI);
    const channel = await connection.createChannel();
    await channel.assertQueue(config.RABBITMQ_QUEUE, { durable: true });
    await channel.prefetch(1);
    return { connection, channel };
}
