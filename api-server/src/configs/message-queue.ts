import amqp from 'amqplib';

export async function connectMq(): Promise<amqp.Channel> {
    const connection = await amqp.connect(process.env.RABBITMQ_URI);
    const channel = await connection.createChannel();
    await channel.assertQueue(process.env.RABBITMQ_QUEUE, { durable: true });
    await channel.prefetch(1);
    return channel;
}
