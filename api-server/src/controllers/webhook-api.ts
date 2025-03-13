import { Router, Request, Response } from 'express'
import { registerWebhook, getAllWebhooks, getEventWebhooks, dispatchWebhookTasks } from '../service-deps/webhook-api';
import { NotFoundError, TaskDispatchError } from '../schemas/error';

const router = Router();

// Wrapper to catch async errors and return a 500 error
function catchAsync(fn: (req: Request<any, any, any, any>, res: Response) => Promise<any>) {
    return async (req: Request<any, any, any, any>, res: Response) => {
        try {
            await fn(req, res);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

// Register Webhook
router.post('/webhooks', catchAsync(async (req: Request<{}, {}, { eventName: string, webhookUrl: string }>, res: Response) => {
    const { eventName, webhookUrl } = req.body;
    if (!eventName || !webhookUrl) {
        res.status(400).json({ error: 'Invalid input' });
        return;
    }

    await registerWebhook(eventName, webhookUrl);

    res.json({ message: 'Webhook registered' });
}));

// Get all webhooks
router.get('/webhooks', catchAsync(async (_req: Request, res: Response) => {
    const webhooks = await getAllWebhooks();
    res.json(webhooks);
}));

// Get specific event webhooks
router.get('/webhooks/:eventName', catchAsync(async (req: Request<{ eventName: string }>, res: Response) => {
    const { eventName } = req.params;
    const eventWebhooks = await getEventWebhooks(eventName);
    res.json({ eventName, webhookUrls: eventWebhooks.map((wh) => wh.webhookUrl) });
}));

// Trigger Event
router.post('/trigger-event/:eventName', catchAsync(async (req: Request<{ eventName: string }>, res: Response) => {
    const { eventName } = req.params;
    const payload = req.body;

    try {
        const ok = await dispatchWebhookTasks(eventName, payload);
        if (!ok) {
            throw new TaskDispatchError("Failed to dispatch webhook tasks");
        }
    } catch (e) {
        if (e instanceof NotFoundError) {
            res.status(404).json({ message: "Event not found in webhook registry " });
        } else if (e instanceof TaskDispatchError) {
            res.status(400).json({ message: 'Failed to queue all urls for delivery' });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
        return;
    }

    res.json({ message: 'Event queued for delivery' });
}));

export default router;
