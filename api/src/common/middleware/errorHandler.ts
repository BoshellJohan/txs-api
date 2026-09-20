import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { getLogger } from "../logger.js";
import z from "zod";

export function errorHandler(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if(error instanceof AppError){
        return res.status(error.statusCode).json({
            success: false,
            code: error.code,
            message: error.message
        });
    }

    if(error instanceof z.ZodError){
        return res.status(422).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            details: error.issues.map(i => ({
                field: i.path.join('.') || '(root)',
                code: i.code,
                message: i.message
            })),
        })
    }   

    getLogger().error({ err: error }, 'unhandled error');

    return res.status(500).json({
        success: false,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error'
    });
}