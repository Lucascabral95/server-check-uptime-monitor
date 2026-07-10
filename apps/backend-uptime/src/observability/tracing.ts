import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
if (process.env.OTEL_ENABLED === 'true') {
  const sdk = new NodeSDK({ instrumentations: [getNodeAutoInstrumentations()] });
  sdk.start();
  process.once('SIGTERM', () => void sdk.shutdown());
}
