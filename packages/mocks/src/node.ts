// MSW in Node (Vitest, mocks:validate).
import { setupServer } from 'msw/node';

import { handlersFor } from './index.ts';

export function createMockServer(liveTags: ReadonlySet<string> = new Set()) {
  return setupServer(...handlersFor({ liveTags: liveTags as never }));
}
