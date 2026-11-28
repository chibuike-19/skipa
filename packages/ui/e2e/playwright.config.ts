import { defineConfig, devices } from '@playwright/test';

// Gallery screenshots in three brand modes + axe (brief §7 F0, §13, §16).
// Baselines are made on Linux in the Playwright image so they match CI: `pnpm --filter @skipa/ui
// test:visual:docker -- --update-snapshots`. See packages/ui/README.md.
export default defineConfig({
  testDir: '.',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: '../dist/playwright-report' }]]
    : 'list',
  outputDir: '../dist/test-results',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled', caret: 'hide' } },
  use: {
    baseURL: 'http://localhost:5180',
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'pnpm gallery:build && pnpm exec vite preview --config gallery/vite.config.ts',
    cwd: '..',
    url: 'http://localhost:5180',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
