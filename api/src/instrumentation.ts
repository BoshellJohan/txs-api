import { env } from './config/env.js';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

const traceExporter = new OTLPTraceExporter({
  url: `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
});

export const sdk = new NodeSDK({
  serviceName: env.OTEL_SERVICE_NAME,
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
