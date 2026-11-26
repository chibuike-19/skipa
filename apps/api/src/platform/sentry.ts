// Errors to self-hosted GlitchTip through the Sentry SDK (AD §10.1). No auto-instrumentation:
// only errors we capture, each scrubbed and tagged with the request ID.
import * as Sentry from '@sentry/node';

import type { Config } from './config.ts';
import { currentContext } from './context.ts';
import { scrub } from './redact.ts';

let enabled = false;

export function initSentry(
  config: Pick<Config, 'SENTRY_DSN' | 'SENTRY_ENVIRONMENT' | 'RELEASE'>,
  app: 'api' | 'worker',
) {
  if (config.SENTRY_DSN === undefined) return false;
  Sentry.initWithoutDefaultIntegrations({
    dsn: config.SENTRY_DSN,
    environment: config.SENTRY_ENVIRONMENT,
    release: config.RELEASE,
    tracesSampleRate: 0,
    initialScope: { tags: { app } },
    beforeSend: (event) => scrub(event) as typeof event,
    beforeBreadcrumb: (crumb) => scrub(crumb) as typeof crumb,
  });
  enabled = true;
  return true;
}

export function captureError(
  error: unknown,
  extra: Record<string, string | number | undefined> = {},
) {
  if (!enabled) return;
  const ctx = currentContext();
  Sentry.withScope((scope) => {
    if (ctx) {
      scope.setTag('request_id', ctx.requestId);
      if (ctx.route) scope.setTag('route', ctx.route);
      if (ctx.organisationId) scope.setTag('org_id', ctx.organisationId);
      if (ctx.branchId) scope.setTag('branch_id', ctx.branchId);
      if (ctx.role) scope.setTag('role', ctx.role);
    }
    for (const [key, value] of Object.entries(extra))
      if (value !== undefined) scope.setTag(key, String(value));
    Sentry.captureException(error);
  });
}

export async function flushSentry(timeoutMs = 2_000) {
  if (enabled) await Sentry.flush(timeoutMs);
}
