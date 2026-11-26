// Structured JSON logs to stdout (AD §10.2) → Alloy → Loki. Every line passes through scrub().
import { pino, type Logger } from 'pino';

import type { Config } from './config.ts';
import { currentContext } from './context.ts';
import { scrub, scrubText } from './redact.ts';

export type { Logger };

export function createLogger(
  config: Pick<Config, 'LOG_LEVEL' | 'RELEASE' | 'APP_ENV'>,
  service: 'api' | 'worker' | 'script',
  destination?: pino.DestinationStream,
): Logger {
  return pino(
    {
      level: config.LOG_LEVEL,
      base: { service, release: config.RELEASE, env: config.APP_ENV },
      timestamp: pino.stdTimeFunctions.isoTime,
      messageKey: 'msg',
      formatters: {
        level: (label) => ({ level: label }),
        // Request context first, so request_id is on every line logged during a request or job.
        log: (object) => {
          const ctx = currentContext();
          const withContext = ctx
            ? {
                request_id: ctx.requestId,
                ...(ctx.organisationId && { org_id: ctx.organisationId }),
                ...(ctx.branchId && { branch_id: ctx.branchId }),
                ...(ctx.role && { role: ctx.role }),
                ...object,
              }
            : object;
          return scrub(withContext) as Record<string, unknown>;
        },
      },
      hooks: {
        // Scrub the message string too (formatters.log only sees the object).
        logMethod(args, method) {
          const scrubbed = args.map((a) => (typeof a === 'string' ? scrubText(a) : a));
          method.apply(this, scrubbed as Parameters<typeof method>);
        },
      },
      serializers: { err: pino.stdSerializers.err },
    },
    destination,
  );
}
