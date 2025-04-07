import { ErrorRequestHandler, Router, Request, Response, NextFunction } from 'express'

import {
    NotFoundError,
    ServerError,
    ClientError,
} from '../schemas/error';

import {
    registerWebhook,
    getAllWebhooks,
    getEventWebhooks,
    dispatchWebhookTasks,
    validateWebhookData,
    validateIfEventNameExists,
} from '../deps/api-server';
import { IWebhook } from 'schemas/webhook';


// Error handler
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof NotFoundError) {
        res.status(404).json({ message: err.message });
    } else if (err instanceof ClientError) {
        res.status(400).json({ message: err.message });
    } else if (err instanceof ServerError) {
        res.status(500).json({ message: err.message });
    } else {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Validation middleware
const validators = {
    validateWebhook: async (req: Request, res: Response, next: NextFunction) => {
        await validateWebhookData(req.body);
        next();
    },
    validateIfEventNameExists: async (req: Request, res: Response, next: NextFunction) => {
        const { eventName } = req.params;
        await validateIfEventNameExists(eventName);
        next();
    },
} as const;

// Service controller functions
const controllers = {
    registerWebhook: async (req: Request<{}, {}, IWebhook>, res: Response) => {
        await registerWebhook(req.body);
        res.json({ message: 'Webhook registered' });
    },
    getAllWebhooks: async (_req: Request, res: Response) => {
        const webhooks = await getAllWebhooks();
        res.json(webhooks);
    },
    getEventWebhooks: async (req: Request<{ eventName: string }>, res: Response) => {
        const { eventName } = req.params;
        const eventWebhooks = await getEventWebhooks(eventName);
        res.json({ eventName, webhookUrls: eventWebhooks.map((wh) => wh.webhookUrl) });
    },
    dispatchWebhookTasks: async (req: Request<{ eventName: string }>, res: Response) => {
        const { eventName } = req.params;
        const payload = req.body;

        await dispatchWebhookTasks(eventName, payload);

        res.json({ message: 'Event queued for delivery' });
    },
} as const;

// API Router
export const apiRouter = Router();
apiRouter.post('/webhooks', 
    validators.validateWebhook,
    controllers.registerWebhook,
);
apiRouter.get('/webhooks', 
    controllers.getAllWebhooks,
);
apiRouter.get('/webhooks/:eventName', 
    validators.validateIfEventNameExists,
    controllers.getEventWebhooks,
);
apiRouter.post('/webhooks/:eventName', 
    validators.validateIfEventNameExists,
    controllers.dispatchWebhookTasks,
);
apiRouter.use(errorHandler);
