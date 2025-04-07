import { runOnChannel } from '../utils/message-queue';
import Webhook, { IWebhook } from '../schemas/webhook';
import { WebhookValidationError, WebhookAlreadyExistsError, WebhookNotFoundError, WebhookTaskDispatchError } from '../schemas/error';
import logger from 'configs/logger';

export async function validateWebhookData(webhookData: any): Promise<IWebhook> {
    logger.info(`Validating webhook data ${JSON.stringify(webhookData)}`);

    // Validate the webhook URL and event name
    const webhook = new Webhook(webhookData);
    try {
        await webhook.validate();
    } catch (error) {
        logger.error(`Validation error: ${error}`);
        throw new WebhookValidationError(`Invalid webhook data: ${error.message}`);
    }

    return webhook;
}

export async function validateIfEventNameExists(eventName?: any): Promise<void> {
    logger.info(`Validating event name ${eventName}`);
        
    // Validate type of event name
    if (!eventName || typeof eventName !== 'string') {
        throw new WebhookValidationError('Invalid event name');
    }

    // Check if the event name exists in the database
    const existingEvent = await Webhook.findOne({ eventName });
    if (!existingEvent) {
        throw new WebhookNotFoundError(`Event name ${eventName} does not exist`);
    }
}

export async function registerWebhook(webhookData: IWebhook): Promise<IWebhook> {

    logger.info(`Registering webhook ${JSON.stringify(webhookData)}`);

    const { eventName, webhookUrl } = webhookData;
    const existingWebhook = await Webhook.findOne({ eventName, webhookUrl });
    if (existingWebhook) {
        logger.info(`Webhook already exists for event: ${eventName} with URL: ${webhookUrl}`);
        throw new WebhookAlreadyExistsError(`Webhook already registered for event: ${eventName}`);
    }
    
    // Save the new webhook to the database
    const webhook = new Webhook(webhookData);
    logger.info(`Saving new webhook for event: ${eventName} with URL: ${webhookUrl}`);
    await webhook.save();

    return webhook;
};

export async function getAllWebhooks(): Promise<IWebhook[]> {
    logger.info(`Fetching all webhooks`);

    // Fetch all webhooks from the database
    const webhooks = await Webhook.find();

    return webhooks;
};

export async function getEventWebhooks(eventName: string): Promise<IWebhook[]> {
    logger.info(`Fetching webhooks for event: ${eventName}`);

    // Fetch webhooks for the given event name
    const webhooks = await Webhook.find({ eventName });
    if (!webhooks || webhooks.length === 0) {
        throw new WebhookNotFoundError("Event not found in webhook registry");
    }

    return webhooks;
};

export async function dispatchWebhookTasks(eventName: string, payload: any): Promise<void> {
    logger.info(`Dispatching webhook tasks for event: ${eventName} with payload: ${JSON.stringify(payload)}`);

    // Fetch webhooks for the given event name
    const webhooks = await getEventWebhooks(eventName);

    try {
        const results = await runOnChannel(async (channel) => {
            return webhooks.map((wh) => channel.sendToQueue(
                process.env.RABBITMQ_QUEUE,
                Buffer.from(JSON.stringify({ eventName, webhookUrl: wh.webhookUrl, payload })),
                { persistent: true }
            ));
        });
        if (!results.every((x) => x)) {
            throw new WebhookTaskDispatchError('Failed to dispatch some webhook tasks');
        }
    
    } catch (error) {
        logger.error(`Error dispatching webhook tasks: ${error}`);
        throw new WebhookTaskDispatchError(`Failed to dispatch webhook tasks: ${error.message}`);
    }
};