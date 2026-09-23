import { getLogger, logger } from './common/logger.js';
import { client, connect } from './common/redis.js';
import { prisma } from './infrastructure/database/prisma/prisma.client.js';
import { sdk } from './instrumentation.js';
import { env } from './config/env.js';

const PORT = env.PORT ?? 3000;

await connect(); //Redis

// app.js se importa dinamicamente: sus middlewares de rate limit crean el RedisStore al evaluarse, y necesitan el cliente ya conectado.
const { default: app } = await import('./app.js');

const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, 'server started');
});

let closing = false;
const gracefulShutdown = (signal: string) => {
    getLogger().info(`Signal: ${signal}`);

    if(closing) {
        return;
    }
    
    closing = true;
    getLogger().info('Closing server');
    server.close(async () => {
        const closures = [
            { name: 'Redis', promise: client.close()},
            { name: 'Prisma', promise: prisma.$disconnect()},
        ];

        const results = await Promise.allSettled(closures.map(c => c.promise));
      
        let hasFailures = false;

        try {
            await sdk.shutdown();
        } catch (err){
            hasFailures = true;
            getLogger().error({err}, 'failed to close OpenTelemetry SDK');
        }

        results.forEach((result, i) => {
            if(result.status === 'rejected'){
                hasFailures = true;
                getLogger().error({err: result.reason}, `failed to close ${closures[i].name}`)
            }            
        })
        
        process.exit(hasFailures ? 1 : 0);
    });

    setTimeout(() => {
        getLogger().error('The shutdown took too long and was forced to cut off.');
        process.exit(1);
    }, 9000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));