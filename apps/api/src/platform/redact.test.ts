import { describe, expect, it } from 'vitest';

import { isSensitiveKey, scrub, scrubText } from './redact.ts';

describe('scrub()', () => {
  it('removes personal data and secrets by key, at any depth (ER-05)', () => {
    const out = scrub({
      headers: {
        authorization: 'Bearer abc',
        cookie: 'sid=1',
        'x-paystack-signature': 'f00',
        accept: 'json',
      },
      shopper: { phone: '+2348031234567', email: 'ada@example.com', name: 'Ada', avatar: 'tomi' },
      paystack: {
        authorization_code: 'AUTH_x',
        account_number: '0123456789',
        reference: 'SKP-LK-04815-A1',
      },
      location: { latitude: 6.43, longitude: 3.42 },
      otp: '123456',
      deviceToken: 't',
      code: 'PAY-007',
    }) as Record<string, Record<string, unknown>>;
    expect(out.headers).toEqual({
      authorization: '[redacted]',
      cookie: '[redacted]',
      'x-paystack-signature': '[redacted]',
      accept: 'json',
    });
    expect(out.shopper).toEqual({
      phone: '[redacted]',
      email: '[redacted]',
      name: '[redacted]',
      avatar: 'tomi',
    });
    expect(out.paystack).toEqual({
      authorization_code: '[redacted]',
      account_number: '[redacted]',
      reference: 'SKP-LK-04815-A1',
    });
    expect(out.location).toEqual({ latitude: '[redacted]', longitude: '[redacted]' });
    expect(out.otp).toBe('[redacted]');
    expect(out.deviceToken).toBe('[redacted]');
    expect(out.code).toBe('PAY-007'); // error codes stay
  });

  it('scrubs emails, Nigerian phone numbers, bearer tokens and Paystack keys inside free text', () => {
    expect(scrubText('sent to ada@example.com and +234 803 123 4567 / 08031234567')).toBe(
      'sent to [email] and [phone] / [phone]',
    );
    expect(scrubText('Authorization: Bearer eyJhbGciOi.x.y')).toBe(
      'Authorization: Bearer [redacted]',
    );
    expect(scrubText('key sk_test_abc123XYZ leaked')).toBe('key [redacted-key] leaked');
  });

  it('handles errors, buffers, dates, arrays and cycles', () => {
    const cyclic: Record<string, unknown> = { a: 1 };
    cyclic.self = cyclic;
    const out = scrub({
      err: new Error('failed for ada@example.com'),
      buf: Buffer.alloc(32),
      at: new Date(0),
      list: [{ email: 'x@y.co' }],
      cyclic,
    }) as Record<string, unknown>;
    expect(out.err).toMatchObject({ type: 'Error', message: 'failed for [email]' });
    expect(out.buf).toBe('[32 bytes]');
    expect(out.at).toEqual(new Date(0));
    expect(out.list).toEqual([{ email: '[redacted]' }]);
    expect((out.cyclic as Record<string, unknown>).self).toBe('[circular]');
  });

  it('treats any *token, *secret and *password key as sensitive', () => {
    expect(
      ['inviteToken', 'webhook_secret', 'adminPassword', 'x-skipa-device'].every(isSensitiveKey),
    ).toBe(true);
    expect(['route', 'status', 'reference', 'request_id'].some(isSensitiveKey)).toBe(false);
  });
});
