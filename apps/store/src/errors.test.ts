import { ApiError } from '@skipa/api-client';
import { ERRORS, type ErrorCode } from '@skipa/contracts/errors';
import { describe, expect, it } from 'vitest';

import { describeError, nextStep } from './errors.tsx';
import { en } from './i18n/en.ts';

const apiError = (code: ErrorCode, rawCode: string = code) =>
  new ApiError({
    kind: 'api',
    status: ERRORS[code].http ?? 500,
    code,
    rawCode,
    userMessage: ERRORS[code].userMessage ?? ERRORS['SYS-500'].userMessage,
    requestId: '91c0-44ad',
    message: code,
  });

describe('every catalogue code has a message, a next step and the reference (ER-07, ER-08)', () => {
  it.each(Object.keys(ERRORS) as ErrorCode[])('%s', (code) => {
    const view = describeError(apiError(code));
    expect(view.title.length).toBeGreaterThan(0);
    expect(view.body.length).toBeGreaterThan(0);
    expect(view.reference).toBe('91c0-44ad');
  });
});

describe('next steps', () => {
  it('AUTH-001 sends the user to sign in again', () => {
    expect(nextStep('AUTH-001')).toBe('sign-in');
  });

  it('AUTH-008 (read-only store view) offers no retry', () => {
    expect(nextStep('AUTH-008')).toBe('none');
  });

  it('PAY-007 says wait, never try again', () => {
    expect(nextStep('PAY-007')).toBe('wait');
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
        message: 'Failed to fetch',
      }),
    );
    expect(view.title).toBe(en.errors.titles.offline);
    expect(view.reference).toBeNull();
  });

  it('an unknown code gets the generic copy and keeps its reference', () => {
    const view = describeError(apiError('SYS-500', 'NEW-999'));
    expect(view.title).toBe(en.errors.titles.server);
    expect(view.reference).toBe('91c0-44ad');
    expect(view.code).toBe('NEW-999');
  });

  it('a render bug still offers a way out', () => {
    expect(describeError(new Error('boom')).step).toBe('retry');
  });
});
