import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isJWTPayload } from '../utils/jwt.js';
import { UnauthorizedError } from '../common/errors/UnauthorizedError.js';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) throw new UnauthorizedError('Invalid token');

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_ACCESS as string);
    } catch (err) {
        throw new UnauthorizedError('Invalid or expired token');
    }

    if(!isJWTPayload(decoded)) throw new UnauthorizedError('Invalid or expired token');

    req.user = decoded;
    next();
}