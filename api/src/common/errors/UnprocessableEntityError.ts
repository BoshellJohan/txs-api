import { AppError } from "./AppError.js";

export class UnprocessableEntityError extends AppError {
    constructor(message = 'Unprocessable Entity'){
        super(422, message, 'UNPROCESSABLE_ENTITY');
    }
}