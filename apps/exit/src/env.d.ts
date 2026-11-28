/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_USE_MOCKS?: string;
  readonly VITE_MOCK_LIVE_TAGS?: string;
  readonly VITE_RELEASE?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_CANVAS_URL?: string;
}
