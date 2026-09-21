import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.url(),
    REDIS_URL: z.url(),
    EMAIL_USER: z.email(),
    EMAIL_PASSWORD: z.string().min(16),
    ACCESS_TOKEN_EXPIRATION: z.string()
        .regex(/^[1-9][0-9]*[smhd]$/, 'Must be a valid expiration time')
        .default('10m'),
    REFRESH_TOKEN_EXPIRATION: z.string()
        .regex(/^[1-9][0-9]*[smhd]$/, 'Must be a valid expiration time')
        .default('8h'),
    JWT_ACCESS: z.string().min(32),
    JWT_REFRESH: z.string().min(32),
    LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']).default('info'),
    OTEL_SERVICE_NAME: z.string().min(1).default('txs-api'),
    OTEL_SERVICE_VERSION: z.string().min(1).default('1.0.0'),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.url(),
    OTEL_TRACES_EXPORTER: z.string().min(1).default('otlp'),
    PORT: z.coerce.number().int().positive().default(3000),
    FRONT_URL: z.url(),
});

const result = envSchema.safeParse(process.env);

if(!result.success){
    console.error('Invalid environment configuration');
    for(const issue of result.error.issues){
        console.error(` ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
}

export const env = result.data;