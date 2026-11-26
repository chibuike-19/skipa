// Builds the real app against the test database, with a log sink the test can read.
import { randomBytes } from 'node:crypto';
import { Writable } from 'node:stream';

import type { FastifyInstance } from 'fastify';
import { afterAll, inject } from 'vitest';

import { buildApp } from '../../../src/app.ts';
import { Database } from '../../../src/platform/db.ts';
import { createLogger } from '../../../src/platform/logger.ts';

export const ORIGIN = 'http://localhost:5173';

export interface Harness {
  app: FastifyInstance;
  db: Database;
  logs: Record<string, unknown>[];
}

export async function harness(
  routes?: (app: FastifyInstance) => Promise<void>,
  options: { pingDatabase?: () => Promise<void> } = {},
): Promise<Harness> {
  const urls = inject('db');
  const db = new Database({ appUrl: urls.appUrl, platformUrl: urls.platformUrl, poolMax: 5 });
  const logs: Record<string, unknown>[] = [];
  const sink = new Writable({
    write(chunk: Buffer, _enc, done) {
      for (const line of chunk.toString().split('\n'))
        if (line) logs.push(JSON.parse(line) as Record<string, unknown>);
      done();
    },
  });
  const logger = createLogger(
    { LOG_LEVEL: 'info', RELEASE: 'api@0.0.0+test', APP_ENV: 'test' },
    'api',
    sink,
  );
  const app = await buildApp({
    logger,
    release: 'api@0.0.0+test',
    appOrigins: [ORIGIN],
    platformPool: db.platform,
    pingDatabase: options.pingDatabase ?? (() => db.ping()),
    rateLimitSecret: randomBytes(32),
    ...(routes && { routes }),
  });
  await app.ready();
  afterAll(async () => {
    await app.close();
    await db.close();
  });
  return { app, db, logs };
}
