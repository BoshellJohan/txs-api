import 'dotenv/config';
import { logger } from './common/logger.js';
import { connect } from './common/redis.js';

const PORT = process.env.PORT ?? 3000;

await connect(); //Redis

// app.js se importa dinamicamente: sus middlewares de rate limit crean el RedisStore al evaluarse, y necesitan el cliente ya conectado.
const { default: app } = await import('./app.js');

app.listen(PORT, () => {
    logger.info({ port: PORT }, 'server started');
});
