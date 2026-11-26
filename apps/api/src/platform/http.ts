// CORS allow-list (the four app origins, with credentials) and API security headers (AD §6.2).
// Written by hand rather than adding @fastify/cors: the rules are small and fully tested.
import type { FastifyInstance } from 'fastify';

export const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'Idempotency-Key',
  'X-Request-Id',
  'X-Skipa-Client',
  'X-Skipa-Device',
  'X-Skipa-Access-Grant',
  'Last-Event-ID',
];
export const EXPOSED_HEADERS = ['X-Request-Id', 'Idempotent-Replayed', 'Retry-After', 'ETag'];
const ALLOWED_METHODS = 'GET, POST, PUT, PATCH, DELETE';

export function registerHttpPolicy(app: FastifyInstance, origins: readonly string[]) {
  // Configured origin → itself. The response echoes the configured string, never request input.
  const allowed = new Map(origins.map((o) => [new URL(o).origin, new URL(o).origin]));

  app.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin;
    const allowedOrigin = origin === undefined ? undefined : allowed.get(origin);
    if (allowedOrigin !== undefined) {
      // Value comes from the configured allow-list (APP_ORIGINS), and unknown origins get no CORS
      // headers (test/int/platform/app.int.test.ts). The rule flags any non-literal value.
      // nosemgrep: javascript.express.security.cors-misconfiguration.cors-misconfiguration
      reply.header('Access-Control-Allow-Origin', allowedOrigin);
      reply.header('Access-Control-Allow-Credentials', 'true');
      reply.header('Access-Control-Expose-Headers', EXPOSED_HEADERS.join(', '));
    }
    reply.header('Vary', 'Origin');
    if (
      request.method === 'OPTIONS' &&
      request.headers['access-control-request-method'] !== undefined
    ) {
      if (allowedOrigin !== undefined) {
        reply.header('Access-Control-Allow-Methods', ALLOWED_METHODS);
        reply.header('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '));
        reply.header('Access-Control-Max-Age', '600');
      }
      // Unknown origins get no CORS headers, so the browser blocks the real request.
      return reply.code(204).send();
    }
  });

  app.addHook('onSend', async (_request, reply, payload) => {
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('Referrer-Policy', 'no-referrer');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('Cross-Origin-Resource-Policy', 'same-site');
    if (!reply.hasHeader('Cache-Control')) reply.header('Cache-Control', 'no-store');
    return payload;
  });
}
