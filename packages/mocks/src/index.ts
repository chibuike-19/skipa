// All mock handlers. Operations without a mock answer 501 MOCK-501 (never invented data); tags
// switched to the live API in config.ts pass through to VITE_API_URL.
import type { AnyHandler } from 'msw';

import type { MockConfig } from './config.ts';
import { OPERATIONS } from './generated/operations.ts';
import { exitMocks } from './handlers/exit.ts';
import { platformMocks } from './handlers/platform.ts';
import { createStreamHandler } from './handlers/realtime.ts';
import { shoppingMocks } from './handlers/shopping.ts';
import { fallbackHandlers, type MockDefinition } from './http.ts';

export const MOCKS: readonly MockDefinition[] = [...platformMocks, ...shoppingMocks, ...exitMocks];

/** Operation IDs served by a mock (the stream included). */
export const MOCKED_OPERATIONS = new Set<string>([...MOCKS.map((m) => m.operationId), 'stream']);

export function handlersFor(config: Pick<MockConfig, 'liveTags'>): AnyHandler[] {
  const mocked = MOCKS.filter((m) => !config.liveTags.has(OPERATIONS[m.operationId].tag)).map(
    (m) => m.handler,
  );
  // Without a global EventSource (plain Node) the stream is left to the 501 fallback.
  const stream =
    config.liveTags.has(OPERATIONS.stream.tag) || typeof globalThis.EventSource === 'undefined'
      ? []
      : [createStreamHandler()];
  return [...mocked, ...stream, ...fallbackHandlers(config.liveTags)];
}

export { readMockConfig, LIVE_TAGS, type MockConfig, type MockEnv } from './config.ts';
export { SCENARIOS, getScenario, setScenario, isScenario, type Scenario } from './scenarios.ts';
export { resetState } from './state.ts';
export { OTP } from './handlers/platform.ts';
export { BRANCHES, STAFF, SHOPPER } from './seed.ts';
