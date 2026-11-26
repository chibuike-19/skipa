import { describe, expect, it } from 'vitest';

import { canonicalJson } from './idempotency.ts';

describe('canonicalJson()', () => {
  it('ignores key order and undefined values, keeps array order', () => {
    expect(canonicalJson({ b: 1, a: { d: [2, 1], c: null }, e: undefined })).toBe(
      '{"a":{"c":null,"d":[2,1]},"b":1}',
    );
    expect(canonicalJson({ a: 1, b: 2 })).toBe(canonicalJson({ b: 2, a: 1 }));
    expect(canonicalJson(undefined)).toBe('');
    expect(canonicalJson('x')).toBe('"x"');
  });
});
