
const config = {
    PORT: process.env.PORT || 3000,
    RABBITMQ_URI: process.env.RABBITMQ_URI || 'amqp://rabbitmq',
    RABBITMQ_QUEUE: process.env.RABBITMQ_QUEUE || 'webhook-queue',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/webhook-api',
} as const;

export default config;
