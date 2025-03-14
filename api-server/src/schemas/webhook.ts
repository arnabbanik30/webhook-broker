import { Schema, model } from 'mongoose';

export interface IWebhook {
    eventName: string;
    webhookUrl: string;
}

const webhookSchema = new Schema<IWebhook>({
    eventName: { type: String, required: true },
    webhookUrl: { type: String, required: true },
});

const Webhook = model<IWebhook>('Webhook', webhookSchema);

export default Webhook;
