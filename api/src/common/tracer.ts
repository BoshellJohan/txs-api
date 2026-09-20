import { trace } from '@opentelemetry/api';

export const tracer = trace.getTracer('txs_app', '1.0.0');