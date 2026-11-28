// MSW in the browser. Apps call this only when VITE_USE_MOCKS=true, behind a dynamic import, so
// none of it reaches a production bundle.
import { setupWorker } from 'msw/browser';

import { readMockConfig, type MockEnv } from './config.ts';
import { handlersFor } from './index.ts';
import { getScenario, initScenarioFromBrowser } from './scenarios.ts';

export async function startBrowserMocks(
  env: MockEnv,
  workerUrl = '/mockServiceWorker.js',
): Promise<void> {
  const config = readMockConfig(env);
  if (!config.enabled) return;
  initScenarioFromBrowser();
  const worker = setupWorker(...handlersFor(config));
  await worker.start({
    serviceWorker: { url: workerUrl },
    onUnhandledFrame: 'bypass',
    quiet: true,
  });
  // eslint-disable-next-line no-console -- dev-only notice that mocks are on
  console.info(
    `[mocks] on · scenario ${getScenario()} · live tags: ${[...config.liveTags].join(', ') || 'none'}`,
  );
}
