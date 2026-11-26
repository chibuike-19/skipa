// GET /health/live and /health/ready (contract: Health schema; NF-01, ER-09).
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { AppError } from '../../platform/errors.ts';

export const healthSchema = z
  .object({
    status: z.enum(['ok', 'degraded', 'down']),
    checks: z.record(z.string(), z.string()).optional(),
    release: z.string().optional(),
  })
  .strict();

export interface HealthDeps {
  release: string;
  pingDatabase: () => Promise<void>;
}

export const healthRoutes: FastifyPluginAsyncZod<HealthDeps> = (app, deps) => {
  app.get('/health/live', { schema: { response: { 200: healthSchema } } }, () =>
    Promise.resolve({ status: 'ok' as const, release: deps.release }),
  );

  app.get('/health/ready', { schema: { response: { 200: healthSchema } } }, async () => {
    try {
      await deps.pingDatabase();
    } catch (cause) {
      throw new AppError('SYS-001', { message: 'database not reachable', cause });
    }
    return {
      status: 'ok' as const,
      release: deps.release,
      // Queue (pg-boss, M1) and Paystack breaker (M2) are reported once they exist.
      checks: { database: 'ok', queue: 'not_installed', paystack: 'not_configured' },
    };
  });
  return Promise.resolve();
};
