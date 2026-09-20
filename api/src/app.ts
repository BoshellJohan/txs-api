import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import authRouter from './modules/auth/auth.routes.js';
import usersRouter from './modules/users/users.routes.js'
import passwordRouter from './modules/password/password.routes.js'
import healthRouter from './modules/health/health.routes.js'

import { authMiddleware } from './middlewares/auth.middleware.js';
import { errorHandler } from './common/middleware/errorHandler.js';
import { randomUUID } from 'node:crypto';
import { getLogger, withLogContext } from './common/logger.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));

app.use(express.json());

app.set('trust proxy', 1);

app.use((req, res, next) => {
    const start = performance.now();
    const requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
    res.setHeader('x-request-id', requestId);

    const { method, url, ip, headers } = req;

    withLogContext({ 'request.id': requestId }, () => {
        const log = getLogger();

        log.info({
            'http.request.method': method,
            'url.path': url,
            'client.address': ip,
            'user_agent.original': headers['user-agent'],
        }, `incoming ${method} request to ${url}`);

        res.on('finish', () => {
            const { statusCode } = res;
            const logData = {
                duration_ms: performance.now() - start,
                status_code: statusCode,
            };

            if(statusCode >= 500){
                log.error(logData, 'server error');
            } else if(statusCode >= 400){
                log.warn(logData, 'client error');
            } else {
                log.info(logData, 'request completed');
            }
        });

        next();
    });
});

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/password', passwordRouter);
app.use('/health', healthRouter);

app.get('/dashboard', authMiddleware, (req, res) => {
    res.json({message: 'Protected route', user: req.user})
});

app.use(errorHandler);

export default app;


