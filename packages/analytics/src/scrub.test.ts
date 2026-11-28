import { describe, expect, it } from 'vitest';

import { scrubBreadcrumb, scrubEvent } from './monitoring.ts';
import { REMOVED, scrubPersonalData, scrubText, scrubUrl } from './scrub.ts';

describe('scrubText (AN-06, ER-05)', () => {
  it.each([
    ['email', 'Sent to ada.n@mail.example', `Sent to ${REMOVED}`],
    ['NG phone, spaced', 'Call +234 803 123 4567 now', `Call ${REMOVED} now`],
    ['NG phone, local', 'from 08031234567', `from ${REMOVED}`],
    ['NG phone, short form', 'Phone 803 123 4567', `Phone ${REMOVED}`],
    [
      'card number (Paystack test card)',
      'card 4084 0840 8408 4081 declined',
      `card ${REMOVED} declined`,
    ],
    ['one-time code', 'code: 482913 rejected', `code: ${REMOVED} rejected`],
    ['coordinates', 'near 6.4474, 3.4723', `near ${REMOVED}`],
  ])('removes %s', (_kind, input, expected) => {
    expect(scrubText(input)).toBe(expected);
  });

  it.each([
    ['money', 'Total ₦31,300 for 13 items'],
    ['receipt reference', 'Receipt SKP-LK-04822'],
    ['error code', 'PAY-007 after 120 s'],
    ['request reference', 'Reference 91c0-44ad'],
    ['UUID', 'order 0193a1f2-4444-7000-8000-000000000001'],
    ['barcode', 'barcode 6156000231187 not found'],
  ])('keeps %s', (_kind, input) => {
    expect(scrubText(input)).toBe(input);
  });
});

describe('scrubPersonalData', () => {
  it('removes personal fields by key, keeps IDs, codes and money', () => {
    const out = scrubPersonalData({
      id: '0193a1f2-0000-7000-8000-00000000d001',
      name: 'Ada Nwosu',
      phoneMasked: '+234 *** *** 4471',
      email: 'ada.n@mail.example',
      latitude: 6.4474,
      longitude: 3.4723,
      deviceToken: 'mock.abc',
      totalKobo: 3_130_000,
      error: { code: 'PAY-007', userMessage: 'Don’t pay again.' },
      otp: { code: '482913' },
      branch: { storeName: 'Adunni Mart', branchName: 'Lekki Phase 1' },
      headers: { authorization: 'Bearer x', cookie: 'skipa_session=y' },
    });
    expect(out).toEqual({
      id: '0193a1f2-0000-7000-8000-00000000d001',
      name: REMOVED,
      phoneMasked: REMOVED,
      email: REMOVED,
      latitude: REMOVED,
      longitude: REMOVED,
      deviceToken: REMOVED,
      totalKobo: 3_130_000,
      error: { code: 'PAY-007', userMessage: 'Don’t pay again.' },
      otp: REMOVED,
      branch: { storeName: 'Adunni Mart', branchName: 'Lekki Phase 1' },
      headers: { authorization: REMOVED, cookie: REMOVED },
    });
  });

  it('removes a sign-in code but keeps an error code under the same key', () => {
    expect(scrubPersonalData({ challengeId: 'c1', code: '482913' })).toEqual({
      challengeId: 'c1',
      code: REMOVED,
    });
    expect(scrubPersonalData({ code: 'AUTH-002' })).toEqual({ code: 'AUTH-002' });
    expect(scrubPersonalData({ status_code: 409, authorization_code: 'AUTH_x' })).toEqual({
      status_code: 409,
      authorization_code: REMOVED,
    });
  });

  it('survives cycles and deep nesting', () => {
    const a: Record<string, unknown> = { email: 'x@y.example' };
    a.self = a;
    expect(scrubPersonalData(a)).toEqual({ email: REMOVED, self: REMOVED });
  });
});

describe('scrubUrl', () => {
  it('removes search terms and Paystack references from query strings, keeps the path', () => {
    expect(scrubUrl('https://api.skipa.ng/v1/stores?q=Ada%20Lekki&limit=10')).toBe(
      `https://api.skipa.ng/v1/stores?q=${encodeURIComponent(REMOVED)}&limit=10`,
    );
    expect(scrubUrl('/v1/payments/return?reference=SKP-LK-04815-A1&trxref=x')).toBe(
      `/v1/payments/return?reference=${encodeURIComponent(REMOVED)}&trxref=${encodeURIComponent(REMOVED)}`,
    );
  });
});

describe('GlitchTip events', () => {
  it('drop the user, request bodies, headers and cookies, and scrub messages', () => {
    const event = scrubEvent({
      user: { email: 'ada.n@mail.example', ip_address: '10.0.0.1' },
      request: {
        url: 'https://shop.skipa.ng/s/x/register?phone=08031234567',
        headers: { Cookie: 'a' },
        cookies: { a: 'b' },
        data: { name: 'Ada' },
      },
      message: 'Failed for ada.n@mail.example',
      exception: { values: [{ value: 'TypeError at +234 803 123 4567' }] },
      extra: { phone: '08031234567' },
      breadcrumbs: [{ message: 'GET /v1/me', data: { url: '/v1/stores?q=Ada', status_code: 200 } }],
    });
    expect(event.user).toBeUndefined();
    expect(event.request).toEqual({
      url: `https://shop.skipa.ng/s/x/register?phone=${encodeURIComponent(REMOVED)}`,
    });
    expect(event.message).toBe(`Failed for ${REMOVED}`);
    expect(event.exception.values[0]?.value).toBe(`TypeError at ${REMOVED}`);
    expect(event.extra).toEqual({ phone: REMOVED });
    expect(event.breadcrumbs[0]?.data.url).toBe(`/v1/stores?q=${encodeURIComponent(REMOVED)}`);
  });

  it('breadcrumbs keep method, status and path but not body sizes', () => {
    expect(
      scrubBreadcrumb({
        data: { method: 'POST', url: '/v1/orders', status_code: 201, request_body_size: 120 },
      }).data,
    ).toEqual({
      method: 'POST',
      url: '/v1/orders',
      status_code: 201,
    });
  });
});
