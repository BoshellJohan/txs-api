import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

/* 
    Limitador para registro
    POST /users/register
    Permite 3 intentos por hora por IP
*/

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many registration attempts. Please try again later.',
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return req.user?.role === 'admin';
    },
    keyGenerator: (req) => {
        return ipKeyGenerator(req.ip || req.socket.remoteAddress || 'unknown');
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            code: 429,
            message: 'Too many registration attempts. Please try again in 1 hour.',
        });
    },
});

/*
    Limitador para login
    POST /auth/login
    Permite 5 intentos por 15 minutos por IP
*/

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return req.user?.role === 'admin';
    },
    keyGenerator: (req) => {
        return ipKeyGenerator(req.ip || req.socket.remoteAddress || 'unknown');
    },
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            code: 429,
            message: 'Too many login attempts. Please try again in 15 minutes.'
        });
    },
});

/*
    Limitador para recuperación de contraseña
    POST /password/forgot-password
    Permite 3 intentos por 30 minutos por IP
*/

export const forgotPasswordLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 3,
    message: 'Too many password recovery attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return req.user?.role === 'admin';
    },
    keyGenerator: (req) => {
        return ipKeyGenerator(req.ip || req.socket.remoteAddress || 'unknown');
    },
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            code: 429,
            message: 'Too many password recovery attempts. Please try again in 30 minutes.'
        });
    },
});