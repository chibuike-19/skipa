import { describe, expect, it } from 'vitest';

import {
  ERROR_CODE_PATTERN,
  ERRORS,
  isErrorCode,
  renderUserMessage,
  type ErrorCode,
} from './errors.ts';

const codes = Object.keys(ERRORS) as ErrorCode[];

describe('error catalogue', () => {
  it('every code matches the contract pattern ^[A-Z]{3,6}-[0-9]{3}$', () => {
    expect(codes.filter((c) => !ERROR_CODE_PATTERN.test(c))).toEqual([]);
  });

  it('contains every server-side code the brief assigns to the backend (§18)', () => {
    const expected = [
      ...range('AUTH', 1, 10),
      ...range('SCAN', 2, 6),
      'CART-001',
      'CART-002',
      'CART-004',
      'CART-006',
      ...range('PAY', 1, 12),
      ...range('PAY', 20, 23),
      ...range('RCPT', 1, 6),
      'EXIT-001',
      'EXIT-002',
      'EXIT-003',
      'EXIT-004',
      'EXIT-006',
      'EXIT-007',
      'POS-001',
      'POS-002',
      'POS-003',
      'POS-004',
      'POS-010',
      'POS-011',
      'POS-012',
      ...range('RECON', 1, 5),
      ...range('NOTIF', 2, 6),
      'SUPP-001',
      'SUPP-003',
      'SUPP-004',
      'SYS-001',
      'SYS-002',
      'SYS-003',
      'SYS-400',
      'SYS-404',
      'SYS-409',
      'SYS-410',
      'SYS-426',
      'SYS-429',
      'SYS-500',
    ];
    expect([...codes].sort()).toEqual([...expected].sort());
  });

  it('leaves out codes that are retired or frontend-only', () => {
    expect(isErrorCode('EXIT-005')).toBe(false); // retired by D-16
    expect(isErrorCode('SCAN-001')).toBe(false); // camera; raised by the frontend
    expect(isErrorCode('WALLET-001')).toBe(false); // reserved for Phase 3
  });

  it('uses only HTTP error statuses', () => {
    for (const code of codes) {
      const { http } = ERRORS[code];
      if (http !== null) expect(http, code).toBeGreaterThanOrEqual(400);
    }
  });

  it('matches the contract examples for the shared responses', () => {
    expect(ERRORS['SYS-400'].userMessage).toBe("Something in that request wasn't right.");
    expect(ERRORS['SYS-404'].userMessage).toBe("We couldn't find that.");
    expect(ERRORS['SYS-500'].userMessage).toBe('Something went wrong on our side.');
    expect(ERRORS['AUTH-001'].userMessage).toBe('Please sign in again.');
    expect(ERRORS['PAY-007'].userMessage).toBe(
      "We couldn't confirm your payment yet. Don't pay again; we're still checking.",
    );
  });

  it('never mentions SMS outside shopper sign-in codes (AD-03)', () => {
    const smsMentions = codes.filter((c) => /\bSMS\b|text you/i.test(ERRORS[c].userMessage ?? ''));
    expect(smsMentions).toEqual([]);
  });
});

describe('renderUserMessage()', () => {
  it('fills placeholders', () => {
    expect(renderUserMessage('RCPT-002', { time: '14:39' })).toBe(
      'Already used for exit at 14:39.',
    );
    expect(renderUserMessage('RCPT-005', { branchName: 'Ikeja GRA' })).toBe(
      'This receipt is for Ikeja GRA.',
    );
  });

  it('leaves a missing placeholder visible rather than inventing text', () => {
    expect(renderUserMessage('RCPT-003')).toBe('This receipt expired at {time}.');
  });

  it('falls back to the generic message for internal-only codes', () => {
    expect(renderUserMessage('PAY-010')).toBe('Something went wrong on our side.');
  });
});

function range(prefix: string, from: number, to: number): string[] {
  return Array.from(
    { length: to - from + 1 },
    (_, i) => `${prefix}-${String(from + i).padStart(3, '0')}`,
  );
}
