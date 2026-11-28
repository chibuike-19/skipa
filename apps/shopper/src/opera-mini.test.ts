// AD-11, NF-21: Opera Mini is detected before the bundle loads and sent to a plain page.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const inline = (file: string) => {
  const html = readFileSync(join(root, file), 'utf8');
  const m = /<script>([\s\S]*?)<\/script>/.exec(html);
  if (m?.[1] === undefined) throw new Error(`no inline script in ${file}`);
  return m[1];
};

/** Run one of our own inline page scripts with stand-ins for the browser globals it uses. */
function runInline(file: string, globals: Record<string, unknown>): void {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- our own committed page script
  const fn = new Function(...Object.keys(globals), inline(file)) as (...args: unknown[]) => void;
  fn(...Object.values(globals));
}

function runDetector(userAgent: string) {
  const replace = vi.fn();
  runInline('index.html', {
    navigator: { userAgent },
    location: { pathname: '/q/QR-ADU-LKI-01', search: '', replace },
  });
  return replace;
}

describe('index.html Opera Mini check', () => {
  it.each([
    'Opera/9.80 (Android; Opera Mini/36.2.2254/119.132; U; id) Presto/2.12.423 Version/12.16',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) OPiOS/16.0.14 OPiM/1',
  ])('sends Opera Mini to /open-in-chrome.html with the page it came for', (ua) => {
    expect(runDetector(ua)).toHaveBeenCalledWith('/open-in-chrome.html?from=%2Fq%2FQR-ADU-LKI-01');
  });

  it.each([
    'Mozilla/5.0 (Linux; Android 12; TECNO KG5p) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; SM-A145F) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36 OPR/80.0.0.0',
  ])('leaves other browsers alone (incl. full Opera): %s', (ua) => {
    expect(runDetector(ua)).not.toHaveBeenCalled();
  });
});

describe('open-in-chrome page', () => {
  function linkFor(search: string) {
    const link = { textContent: '' };
    const button = { onclick: null as null | (() => void), textContent: '' };
    runInline('public/open-in-chrome.html', {
      location: { search, origin: 'https://shop.skipa.ng' },
      document: { getElementById: (id: string) => (id === 'link' ? link : button) },
      navigator: {},
      URLSearchParams,
    });
    return link.textContent;
  }

  it('shows the link the shopper came for, on this site', () => {
    expect(linkFor('?from=%2Fq%2FQR-ADU-LKI-01')).toBe('https://shop.skipa.ng/q/QR-ADU-LKI-01');
  });

  it.each(['?from=%2F%2Fevil.example%2Fx', '?from=https%3A%2F%2Fevil.example', ''])(
    'never echoes an outside URL (%s)',
    (search) => {
      expect(linkFor(search)).toBe('https://shop.skipa.ng/');
    },
  );
});
