import { AsyncLocalStorage } from 'node:async_hooks';
import { trace } from '@opentelemetry/api';
import pino, { Logger } from 'pino';

// Se evalua en cada llamada al logger, no al crearlo, asi que toma el span que
// este activo en ese momento y no el que hubiera al abrir la peticion.
function traceContext() {
    const span = trace.getActiveSpan();
    if(!span) return {};

    const { traceId, spanId } = span.spanContext();
    return { trace_id: traceId, span_id: spanId };
}

export const logger = pino({
    level: process.env.LOG_LEVEL ?? 'info', // silent, trace, debug, info, warn, error, fatal
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level(label){
            return { level: label };
        },
    },
    mixin: traceContext,
});

const asyncLocalStorage = new AsyncLocalStorage<Logger>();

// Devuelve el logger de la peticion en curso, con su request.id ya asociado.
// Fuera de una peticion cae al logger base.
export function getLogger(): Logger {
    return asyncLocalStorage.getStore() ?? logger;
}

// Ejecuta callback con un logger hijo que arrastra bindings. Los contextos
// anidados heredan del padre, de modo que los bindings se acumulan.
export function withLogContext<T>(bindings: Record<string, unknown>, callback: () => T): T {
    return asyncLocalStorage.run(getLogger().child(bindings), callback);
}
