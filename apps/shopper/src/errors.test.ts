import { ApiError } from '@skipa/api-client';
import { ERRORS, type ErrorCode } from '@skipa/contracts/errors';
import { describe, expect, it } from 'vitest';

import { CLIENT_ERRORS, describeError, nextStep } from './errors.tsx';
import { en } from './i18n/en.ts';

const apiError = (code: ErrorCode) =>
  new ApiError({
    kind: 'api',
    status: ERRORS[code].http ?? 500,
    code,
    rawCode: code,
    userMessage: ERRORS[code].userMessage ?? ERRORS['SYS-500'].userMessage,
    requestId: '91c0-44ad',
    message: code,
  });

describe('every catalogue code has a message, a next step and the reference (ER-07, ER-08)', () => {
  it.each(Object.keys(ERRORS) as ErrorCode[])('%s', (code) => {
    const view = describeError(apiError(code));
    expect(view.title.length).toBeGreaterThan(0);
    expect(view.body.length).toBeGreaterThan(0);
    expect(['retry', 'sign-in', 'pay-at-till', 'fix-input', 'wait', 'go-home', 'none']).toContain(
      view.step,
    );
    expect(view.reference).toBe('91c0-44ad');
  });
});

describe('money-critical next steps', () => {
  it('PAY-007 says wait, never try again (SH-19: "Don’t pay again")', () => {
    expect(nextStep('PAY-007')).toBe('wait');
    expect(describeError(apiError('PAY-007')).body).toBe(
      "We couldn't confirm your payment yet. Don't pay again; we're still checking.",
    );
  });

  it.each(['PAY-001', 'CART-002', 'CART-004', 'SCAN-002', 'SCAN-003', 'SCAN-004'] as ErrorCode[])(
    '%s sends the shopper to the till',
    (code) => {
      expect(nextStep(code)).toBe('pay-at-till');
    },
  );

  it('SYS-410 (same request still in progress) says wait', () => {
    expect(nextStep('SYS-410')).toBe('wait');
  });
});

describe('errors without a catalogue code', () => {
  it('network failure → offline copy, no reference', () => {
    const view = describeError(
      new ApiError({
        kind: 'network',
        status: null,
        code: null,
        rawCode: null,
        userMessage: '',
        requestId: null,
        message: 'fetch failed',
      }),
    );
    expect(view).toMatchObject({
      title: en.errors.titles.offline,
      body: en.errors.offline,
      reference: null,
    });
  });

  it('a crash in the app → server copy with a way out', () => {
    expect(describeError(new TypeError('x is undefined'))).toMatchObject({
      title: en.errors.titles.server,
      step: 'retry',
      reference: null,
    });
  });

  it('server faults use the generic copy but keep the reference', () => {
    expect(describeError(apiError('SYS-500'))).toMatchObject({
      title: en.errors.titles.server,
      body: en.errors.server,
      reference: '91c0-44ad',
    });
  });

  it('SCAN-001 is raised on the phone with the AD §10.3 copy', () => {
    expect(CLIENT_ERRORS['SCAN-001']).toEqual({
      userMessage: 'Type the barcode number instead.',
      step: 'fix-input',
    });
    expect(Object.hasOwn(ERRORS, 'SCAN-001')).toBe(false);
  });
});
