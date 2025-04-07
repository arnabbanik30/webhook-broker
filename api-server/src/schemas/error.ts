export class ClientError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ClientError';
    }
}
export class ServerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ServerError';
    }
}

export class ValidationError extends ClientError {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class DatabaseError extends ServerError {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseError';
    }
}

export class NotFoundError extends ClientError {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class WebhookValidationError extends ValidationError {
    constructor(message: string) {
        super(message);
        this.name = 'WebhookValidationError';
    }
}

export class WebhookAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WebhookAlreadyExistsError';
    }
}

export class WebhookNotFoundError extends NotFoundError {
    constructor(message: string) {
        super(message);
        this.name = 'WebhookNotFoundError';
    }
}

export class WebhookTaskDispatchError extends ServerError {
    constructor(message: string) {
        super(message);
        this.name = 'WebhookTaskDispatchError';
    }
}
