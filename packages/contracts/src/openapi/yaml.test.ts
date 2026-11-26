import { describe, expect, it } from 'vitest';

import { toYaml } from './yaml.ts';

describe('toYaml()', () => {
  it('writes block YAML with safe quoting', () => {
    const text = toYaml({
      openapi: '3.1.0',
      paths: {
        '/v1/orders/{orderId}': {
          get: {
            responses: { '200': { description: 'OK' } },
            security: [],
            tags: ['Store · Live'],
          },
        },
      },
      flags: { yes: 'no', n: 1, ok: true, nothing: null, empty: {} },
      list: [{ a: 1, b: 'x: y' }, 'plain text', '#hash', ' padded '],
    });
    expect(text).toBe(
      [
        'openapi: "3.1.0"',
        'paths:',
        '  "/v1/orders/{orderId}":',
        '    get:',
        '      responses:',
        '        "200":',
        '          description: OK',
        '      security: []',
        '      tags:',
        '      - "Store · Live"',
        'flags:',
        '  "yes": "no"',
        '  "n": 1',
        '  ok: true',
        '  nothing: null',
        '  empty: {}',
        'list:',
        '- a: 1',
        '  b: "x: y"',
        '- plain text',
        '- "#hash"',
        '- " padded "',
        '',
      ].join('\n'),
    );
  });

  it('adds the header comment', () => {
    expect(toYaml({ a: 1 }, '# generated')).toBe('# generated\na: 1\n');
  });
});
