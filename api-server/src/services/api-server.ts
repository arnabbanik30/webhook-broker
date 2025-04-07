import express, { json } from 'express'

import { connectMq } from '../configs/message-queue';
import { connectDb } from '../configs/database';
import { apiRouter } from '../routes/api-server';
import logger from '../configs/logger';

async function runApiServer() {
    logger.info(`Connecting to MongoDB: ${process.env.MONGO_URI}`);
    await connectDb();

    logger.info(`Connecting to RabbitMQ: ${process.env.RABBITMQ_URI}`);
    await connectMq();
    
    logger.info(`Starting API server on port: ${process.env.PORT}`);
    const app = express();
    app.use(json());
    app.use('/api/v0', apiRouter);
    app.listen(process.env.PORT, () => logger.info(`Server running on port ${process.env.PORT}`));
}

runApiServer()
    .then(() => logger.info('API server started'))
    .catch((err) => {
        logger.error('Error starting API server:', err);
        process.exit(1);
    });