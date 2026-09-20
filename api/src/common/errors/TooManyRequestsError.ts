import { AppError } from "./AppError.js";

export class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests'){
        super(429, message, 'TOO_MANY_REQUESTS');
    }
}