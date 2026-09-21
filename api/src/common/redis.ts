import { createClient } from 'redis';
import { getLogger } from './logger.js';
import { env } from '../config/env.js';

export const client = createClient({
    url: env.REDIS_URL
});

client.on('error', (err) => getLogger().error({err}, 'Error connecting Redis')
);

export async function connect() {
    await client.connect();
    getLogger().info('Redis connected');
}