import { randomBytes } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { maskEmail, maskPhone, normaliseNigerianPhone, PiiCrypto } from './crypto.ts';

const key = () => randomBytes(32).toString('base64');

describe('PiiCrypto', () => {
  const crypto = new PiiCrypto(key(), key());

  it('round-trips, with a fresh IV each time', () => {
    const a = crypto.encrypt('+2348031234567', 'pii.shoppers.phone');
    const b = crypto.encrypt('+2348031234567', 'pii.shoppers.phone');
    expect(a.equals(b)).toBe(false);
    expect(a.includes(Buffer.from('8031234567'))).toBe(false);
    expect(crypto.decrypt(a, 'pii.shoppers.phone')).toBe('+2348031234567');
  });

  it('refuses tampered ciphertext, the wrong column context and the wrong key', () => {
    const sealed = crypto.encrypt('ada@example.com', 'pii.shoppers.email');
    const tampered = Buffer.from(sealed);
    tampered[tampered.length - 1] = (tampered[tampered.length - 1] ?? 0) ^ 1;
    expect(() => crypto.decrypt(tampered, 'pii.shoppers.email')).toThrow();
    expect(() => crypto.decrypt(sealed, 'pii.shoppers.phone')).toThrow();
    expect(() => new PiiCrypto(key(), key()).decrypt(sealed, 'pii.shoppers.email')).toThrow();
    expect(() => crypto.decrypt(Buffer.from([9, 1, 2]), 'x')).toThrow(/format/);
  });

  it('gives stable lookup keys per kind', () => {
    const a = crypto.lookupKey('phone', '+2348031234567');
    expect(crypto.sameLookup(a, crypto.lookupKey('phone', '+2348031234567'))).toBe(true);
    expect(crypto.sameLookup(a, crypto.lookupKey('email', '+2348031234567'))).toBe(false);
  });

  it('rejects keys that are not 32 bytes', () => {
    expect(() => new PiiCrypto(randomBytes(16).toString('base64'), key())).toThrow(/32 bytes/);
  });
});

describe('phone and email helpers', () => {
  it.each([
    ['0803 123 4567', '+2348031234567'],
    ['+234 803 123 4567', '+2348031234567'],
    ['2349031234567', '+2349031234567'],
  ])('normalises %s', (input, e164) => {
    expect(normaliseNigerianPhone(input)).toBe(e164);
  });

  it.each(['+447911123456', '0603 123 4567', '0803123456', 'abc'])(
    'rejects %s (SMS only to Nigerian mobiles)',
    (input) => {
      expect(normaliseNigerianPhone(input)).toBeUndefined();
    },
  );

  it('masks for display', () => {
    expect(maskPhone('+2348031181180')).toBe('+234 803 *** 1180');
    expect(maskEmail('tolu@skipa.ng')).toBe('t***@skipa.ng');
  });
});
