// Builds the Fastify app from its dependencies. server.ts wires real ones; tests pass their own.
import { ERRORS, type ErrorCode } from '@skipa/contracts/errors';
import Fastify, {
  LogController,
  type FastifyBaseLogger,
  type FastifyError,
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import type pg from 'pg';

import { healthRoutes } from './modules/monitoring/routes.ts';
import { runWithContext } from './platform/context.ts';
import { AppError, envelope } from './platform/errors.ts';
import { registerHttpPolicy } from './platform/http.ts';
import idempotency from './platform/idempotency.ts';
import { acceptRequestId, uuidv7 } from './platform/ids.ts';
import type { Logger } from './platform/logger.ts';
import { registerRateLimit } from './platform/rate-limit.ts';
import { captureError } from './platform/sentry.ts';

export interface AppDeps {
  logger: Logger;
  release: string;
  appOrigins: readonly string[];
  /** Pool for platform tables (idempotency keys, rate-limit counters): skipa_platform. */
  platformPool: pg.Pool;
  pingDatabase: () => Promise<void>;
  /** HMAC key for rate-limit keys (so no IPs or phone numbers are stored). */
  rateLimitSecret: Buffer;
  /** Extra routes registered after the platform plugins (modules, or test routes). */
  routes?: (app: FastifyInstance) => Promise<void>;
}

declare module 'fastify' {
  interface FastifyRequest {
    errorCode?: string;
  }
}

/** Map an error to a catalogue code without leaking internals. */
function classify(error: FastifyError | Error): {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
} {
  if (error instanceof AppError)
    return {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    };
  if (hasZodFastifySchemaValidationErrors(error)) {
    const issues = error.validation.map((v) => ({
      path: `${error.validationContext ?? 'request'}${v.instancePath || ''}`,
      message: v.message ?? 'invalid',
    }));
    return {
      code: 'SYS-400',
      message: issues.map((i) => `${i.path}: ${i.message}`).join('; '),
      details: { issues },
    };
  }
  if (isResponseSerializationError(error))
    return { code: 'SYS-500', message: 'response did not match its schema' };
  const status =
    'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;
  if (status === 404) return { code: 'SYS-404', message: 'not found' };
  if (status === 429) return { code: 'SYS-429', message: 'rate limited' };
  if (status >= 400 && status < 500) return { code: 'SYS-400', message: error.message };
  return { code: 'SYS-500', message: 'unexpected' };
}

export async function buildApp(deps: AppDeps): Promise<FastifyInstance> {
  // Upcast: Fastify's instance types are generic over the logger; the base type keeps plugins compatible.
  const loggerInstance: FastifyBaseLogger = deps.logger;
  const app = Fastify({
    loggerInstance,
    // One log line per request comes from our onResponse hook (AD §10.2 format).
    logController: new LogController({ disableRequestLogging: true }),
    // request_id comes from the async context on every line (logger.ts), so Fastify's own
    // per-request binding would only duplicate it.
    childLoggerFactory: (logger, _bindings, options) => logger.child({}, options),
    genReqId: (req) => acceptRequestId(req.headers['x-request-id']) ?? uuidv7(),
    requestIdHeader: false,
    trustProxy: 'loopback, uniquelocal',
    bodyLimit: 1_048_576,
    return503OnClosing: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Request context for logs, jobs and errors (AD §10.2), and X-Request-Id on every response.
  app.addHook('onRequest', (request, reply, done) => {
    reply.header('X-Request-Id', request.id);
    runWithContext(
      {
        requestId: request.id,
        route: `${request.method} ${request.routeOptions.url ?? '(unmatched)'}`,
      },
      done,
    );
  });

  app.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const status = reply.statusCode;
    const line = {
      event: 'http.request',
      route: `${request.method} ${request.routeOptions.url ?? '(unmatched)'}`,
      status,
      duration_ms: Math.round(reply.elapsedTime),
      code: request.errorCode ?? null,
    };
    if (status >= 500) request.log.error(line, 'request failed');
    else request.log.info(line, 'request');
  });

  app.setErrorHandler((error: FastifyError | Error, request, reply) => {
    const { code, message, details } = classify(error);
    const definition = ERRORS[code];
    const status = error instanceof AppError ? error.status : (definition.http ?? 500);
    request.errorCode = code;
    const params = error instanceof AppError ? error.params : {};
    if (status >= 500 || definition.severity === 'critical' || definition.severity === 'high') {
      request.log.error({ err: error, code, event: 'http.error' }, message);
      if (status >= 500) captureError(error, { code });
    } else {
      request.log.warn({ code, event: 'http.error' }, message);
    }
    return reply.code(status).send(envelope(code, request.id, message, params, details));
  });

  app.setNotFoundHandler((request, reply) => {
    request.errorCode = 'SYS-404';
    return reply
      .code(404)
      .send(
        envelope(
          'SYS-404',
          request.id,
          `no route for ${request.method} ${request.url.split('?')[0] ?? ''}`,
        ),
      );
  });

  registerHttpPolicy(app, deps.appOrigins);
  await registerRateLimit(app, deps.platformPool, deps.rateLimitSecret);
  await app.register(idempotency, { pool: deps.platformPool });

  await app.register(healthRoutes, { release: deps.release, pingDatabase: deps.pingDatabase });
  if (deps.routes) await deps.routes(app);

  return app;
}
