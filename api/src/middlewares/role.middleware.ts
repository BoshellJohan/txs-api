import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../common/errors/ForbiddenError.js';
import { UnauthorizedError } from '../common/errors/UnauthorizedError.js';

export const roleMiddleware = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if(!req.user){
            throw new UnauthorizedError();
        }

        if(!allowedRoles.includes(req.user.role)){
            throw new ForbiddenError('User does not have enough permissions');
        }

        next();
    }
}