import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export const validateMiddleware = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validated = schema.parse(req.body)
        
        req.body = validated;
        next();
    }
}