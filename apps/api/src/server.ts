// API process entry point: `node --env-file-if-exists=.env src/server.ts`.
import { buildApp } from './app.ts';
import { ConfigError, loadConfig } from './platform/config.ts';
import { Database } from './platform/db.ts';
import { createLogger } from './platform/logger.ts';
import { RealtimeHub } from './platform/realtime.ts';
import { flushSentry, initSentry } from './platform/sentry.ts';

let config;
try {
  config = loadConfig();
} catch (error) {
  // Names and problems only; loadConfig never includes values.
  process.stderr.write(`${error instanceof ConfigError ? error.message : String(error)}\n`);
  process.exit(1);
}

const logger = createLogger(config, 'api');
initSentry(config, 'api');

const db = new Database({
  appUrl: config.DATABASE_URL,
  platformUrl: config.DATABASE_PLATFORM_URL,
  poolMax: config.PG_POOL_MAX,
});
const hub = new RealtimeHub(config.DATABASE_PLATFORM_URL, logger);
await hub.start();

const app = await buildApp({
  logger,
  release: config.RELEASE,
  appOrigins: config.APP_ORIGINS,
  platformPool: db.platform,
  pingDatabase: () => db.ping(),
  rateLimitSecret: Buffer.from(config.PII_HMAC_KEY, 'base64'),
});

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ event: 'process.shutdown', signal }, 'shutting down');
  await app.close();
  await hub.stop();
  await db.close();
  await flushSentry();
  process.exit(0);
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

await app.listen({ host: '0.0.0.0', port: config.PORT });
logger.info({ event: 'process.started', port: config.PORT }, 'api listening');
