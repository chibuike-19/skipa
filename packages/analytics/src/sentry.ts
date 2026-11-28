// Only the parts of the Sentry SDK we use, as named imports, so the lazily loaded chunk stays
// small (a namespace import keeps the whole SDK, ~155 KB gz with replay). No tracing, no session
// replay (AN-07): errors and breadcrumbs only.
export {
  addBreadcrumb,
  breadcrumbsIntegration,
  browserApiErrorsIntegration,
  captureException,
  captureMessage,
  dedupeIntegration,
  functionToStringIntegration,
  globalHandlersIntegration,
  httpContextIntegration,
  init,
  linkedErrorsIntegration,
} from '@sentry/react';
