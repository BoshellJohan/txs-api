import { AppError } from "./AppError.js";

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden resource'){
        super(403, message, 'FORBIDDEN');
    }
}