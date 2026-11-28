// Error mapping (brief §15, ER-07, ER-08): every code in packages/contracts/errors.ts gets its
// plain message (the catalogue's, or the server's rendered one) and a next step; error screens
// show the short reference. The test checks every catalogue code. SCAN-001 (camera unavailable)
// is raised by this app, not the API, so contracts/errors.ts leaves it out; its copy is here.
import { ApiError } from '@skipa/api-client';
import { ERRORS, type ErrorCode } from '@skipa/contracts/errors';
import { State } from '@skipa/ui';

import { en } from './i18n/en.ts';

export type NextStep =
  'retry' | 'sign-in' | 'pay-at-till' | 'fix-input' | 'wait' | 'go-home' | 'none';

/** Codes this app raises itself (AD §10.3), not in the API catalogue. */
export const CLIENT_ERRORS = {
  'SCAN-001': { userMessage: en.errors.scan001, step: 'fix-input' },
} as const satisfies Record<string, { userMessage: string; step: NextStep }>;

/** Codes whose next step isn't what their HTTP class suggests. */
const STEPS: Partial<Record<ErrorCode, NextStep>> = {
  'AUTH-001': 'sign-in',
  'AUTH-002': 'fix-input',
  'AUTH-003': 'fix-input',
  'AUTH-004': 'wait',
  'SCAN-002': 'pay-at-till',
  'SCAN-003': 'pay-at-till',
  'SCAN-004': 'pay-at-till',
  'SCAN-005': 'retry',
  'SCAN-006': 'retry',
  'CART-001': 'go-home',
  'CART-002': 'pay-at-till',
  'CART-004': 'pay-at-till',
  'CART-006': 'fix-input',
  'PAY-001': 'pay-at-till',
  'PAY-002': 'retry',
  'PAY-003': 'fix-input',
  'PAY-004': 'go-home',
  'PAY-005': 'retry',
  'PAY-006': 'retry',
  // Never "try again" for a payment we're still checking: that is how shoppers pay twice.
  'PAY-007': 'wait',
  'PAY-020': 'none',
  'PAY-021': 'wait',
  'NOTIF-002': 'retry',
  'NOTIF-005': 'none',
  'SUPP-001': 'retry',
  'SYS-400': 'fix-input',
  'SYS-404': 'go-home',
  // SYS-410: the same request is still being processed (idempotency in flight).
  'SYS-410': 'wait',
  'SYS-426': 'retry',
  'SYS-429': 'wait',
};

export function nextStep(code: ErrorCode): NextStep {
  const explicit = STEPS[code];
  if (explicit !== undefined) return explicit;
  const http = ERRORS[code].http;
  if (http === null || http >= 500) return 'retry';
  if (http === 401) return 'sign-in';
  if (http === 403 || http === 404) return 'go-home';
  if (http === 429) return 'wait';
  return 'fix-input';
}

const TITLE: Record<NextStep, string> = {
  retry: en.errors.titles.retry,
  'sign-in': en.errors.titles.signIn,
  'pay-at-till': en.errors.titles.payAtTill,
  'fix-input': en.errors.titles.fixInput,
  wait: en.errors.titles.wait,
  'go-home': en.errors.titles.notFound,
  none: en.errors.titles.retry,
};

export interface ErrorView {
  title: string;
  body: string;
  step: NextStep;
  /** Short request reference (ER-08), when the request reached the API. */
  reference: string | null;
  code: string | null;
}

export function describeError(error: unknown): ErrorView {
  if (error instanceof ApiError && error.kind === 'network') {
    return {
      title: en.errors.titles.offline,
      body: en.errors.offline,
      step: 'retry',
      reference: null,
      code: null,
    };
  }
  if (error instanceof ApiError && error.code !== null) {
    // Generic "our side" copy only for SYS-5xx and codes we don't know. Never by HTTP status alone:
    // PAY-007 arrives as a 5xx and its own words ("Don't pay again") are what stop a double payment.
    const serverFault = error.code.startsWith('SYS-5') || error.rawCode !== error.code;
    if (serverFault)
      return {
        title: en.errors.titles.server,
        body: en.errors.server,
        step: 'retry',
        reference: error.requestId,
        code: error.rawCode,
      };
    return {
      title: TITLE[nextStep(error.code)],
      body: error.userMessage,
      step: nextStep(error.code),
      reference: error.requestId,
      code: error.rawCode,
    };
  }
  // A bug in the app (render error): no API reference, but still a way out.
  return {
    title: en.errors.titles.server,
    body: en.errors.server,
    step: 'retry',
    reference: null,
    code: null,
  };
}

export function ErrorScreen({
  error,
  onRetry,
  onHome,
}: {
  error: unknown;
  onRetry: () => void;
  onHome: () => void;
}) {
  const view = describeError(error);
  const goHome = view.step === 'go-home' || view.step === 'sign-in';
  return (
    <State
      art={view.step === 'pay-at-till' ? 'off' : 'error'}
      title={view.title}
      body={view.body}
      reference={
        view.reference === null
          ? undefined
          : { label: en.common.reference, requestId: view.reference, code: view.code ?? undefined }
      }
      action={
        view.step === 'none' || view.step === 'pay-at-till'
          ? undefined
          : goHome
            ? { label: en.common.goHome, icon: 'home', onClick: onHome }
            : { label: en.common.tryAgain, icon: 'refresh', onClick: onRetry }
      }
    />
  );
}
