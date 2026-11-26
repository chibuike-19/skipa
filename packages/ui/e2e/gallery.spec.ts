import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const BRANDS = ['skipa', 'adunni', 'harbour'] as const;
const SECTIONS = [
  'buttons',
  'status-chips',
  'fields',
  'controls',
  'loading',
  'headers',
  'brand-input',
  'overlays',
  'feedback',
  'states',
  'dashboard',
  'table',
  'brand',
];
const OVERLAYS: [string, string][] = [
  ['Not included', 'sheet-not-included'],
  ['Not found', 'sheet-not-found'],
  ['Price changed', 'sheet-price-changed'],
  ['Remove item', 'sheet-remove'],
  ['Switch off', 'dialog-switch-off'],
  ['Receipt panel', 'panel-receipt'],
];

async function open(page: Page, brand: string) {
  await page.goto(`/?brand=${brand}`);
  await page.evaluate(() => document.fonts.ready);
}

async function expectNoSeriousA11yIssues(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  // Report the first few nodes with axe's own message (it includes the measured colours).
  expect(
    serious.map(
      (v) =>
        `${v.id}: ${v.nodes
          .slice(0, 3)
          .map((n) => `${n.target.join(' ')} → ${n.any[0]?.message ?? n.failureSummary ?? ''}`)
          .join(' | ')}${v.nodes.length > 3 ? ` (+${String(v.nodes.length - 3)} more)` : ''}`,
    ),
  ).toEqual([]);
}

for (const brand of BRANDS) {
  test.describe(`${brand} mode`, () => {
    for (const section of SECTIONS) {
      test(section, async ({ page }) => {
        await open(page, brand);
        await expect(page.getByTestId(`section-${section}`)).toHaveScreenshot(
          `${brand}-${section}.png`,
        );
      });
    }

    for (const [button, name] of OVERLAYS) {
      test(name, async ({ page }) => {
        await open(page, brand);
        const trigger = page
          .getByTestId('section-overlays')
          .getByRole('button', { name: button, exact: true });
        await trigger.click();
        const dialog = page.getByRole(name.startsWith('dialog') ? 'alertdialog' : 'dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveScreenshot(`${brand}-${name}.png`);
        await expectNoSeriousA11yIssues(page);
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();
      });
    }

    test('axe: no serious or critical issues (WCAG 2.2 AA)', async ({ page }) => {
      await open(page, brand);
      await expectNoSeriousA11yIssues(page);
    });
  });
}
