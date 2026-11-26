import { describe, expect, it } from 'vitest';

import { acceptRequestId, shortRequestRef, uuidv7 } from './ids.ts';

describe('uuidv7()', () => {
  it('produces RFC 9562 version 7 UUIDs that sort by time', () => {
    const a = uuidv7(1_764_115_200_000);
    const b = uuidv7(1_764_115_200_001);
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(a < b).toBe(true);
    expect(a.slice(0, 13).replace('-', '')).toBe(
      (1_764_115_200_000).toString(16).padStart(12, '0'),
    );
  });

  it('is unique', () => {
    expect(new Set(Array.from({ length: 1000 }, () => uuidv7())).size).toBe(1000);
  });
});

describe('request IDs', () => {
  it('keeps a plain client ID up to 64 characters and rejects anything else', () => {
    expect(acceptRequestId('0193a1f2-7c1d-7e2a-9b3c-91c044ad0000')).toBe(
      '0193a1f2-7c1d-7e2a-9b3c-91c044ad0000',
    );
    expect(acceptRequestId('short')).toBeUndefined();
    expect(acceptRequestId('a'.repeat(65))).toBeUndefined();
    expect(acceptRequestId('bad id\nwith newline')).toBeUndefined();
    expect(acceptRequestId(['a'])).toBeUndefined();
  });

  it('shows people the last 8 hex characters as "91c0-44ad" (ER-08)', () => {
    expect(
      shortRequestRef(
        '0193a1f2-0000-7000-8000-00000091c044ad'.slice(0, 36).replace(/.{8}$/, '91c044ad'),
      ),
    ).toBe('91c0-44ad');
    expect(shortRequestRef('abc')).toBe('0000-0abc');
  });
});
