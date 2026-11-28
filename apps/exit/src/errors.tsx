// Error mapping (brief §15, ER-07, ER-08): every code in packages/contracts/errors.ts gets its
// plain message (the catalogue's, or the server's rendered one) and a next step; error screens
// show the short reference. The test checks every catalogue code.
import { ApiError } from '@skipa/api-client';
import { ERRORS, type ErrorCode } from '@skipa/contracts/errors';
import { State } from '@skipa/ui';

import { en } from './i18n/en.ts';

export type NextStep = 'retry' | 'sign-in' | 'fix-input' | 'wait' | 'go-home' | 'none';

/** Codes whose next step isn't what their HTTP class suggests. */
const STEPS: Partial<Record<ErrorCode, NextStep>> = {
  'AUTH-004': 'wait',
  'AUTH-005': 'none',
  'AUTH-006': 'none',
  'AUTH-008': 'none',
  'AUTH-009': 'fix-input',
  // Receipt results are shown as exit results (F4), never as "try again".
  'RCPT-002': 'none',
  'RCPT-003': 'none',
  'RCPT-004': 'none',
  'RCPT-005': 'none',
  'RCPT-006': 'none',
  'EXIT-002': 'none',
  'EXIT-004': 'wait',
  'EXIT-006': 'none',
  'EXIT-007': 'fix-input',
  // A payment still being checked: never invite a second attempt.
  'PAY-007': 'wait',
  'SYS-410': 'wait',
  'SYS-426': 'retry',
};

export function nextStep(code: ErrorCode): NextStep {
  const explicit = STEPS[code];
  if (explicit !== undefined) return explicit;
  const http = ERRORS[code].http;
  if (http === null || http >= 500) return 'retry';
  if (http === 401) return 'sign-in';
  if (http === 403) return 'none';
  if (http === 404) return 'go-home';
  if (http === 429) return 'wait';
  return 'fix-input';
}

const TITLE: Record<NextStep, string> = {
  retry: en.errors.titles.retry,
  'sign-in': en.errors.titles.signIn,
  'fix-input': en.errors.titles.fixInput,
  wait: en.errors.titles.wait,
  'go-home': en.errors.titles.notFound,
  none: en.errors.titles.forbidden,
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
    // Generic "our side" copy only for SYS-5xx and codes we don't know, never by HTTP status alone.
    const serverFault = error.code.startsWith('SYS-5') || error.rawCode !== error.code;
    if (serverFault)
      return {
        title: en.errors.titles.server,
        body: en.errors.server,
        step: 'retry',
        reference: error.requestId,
        code: error.rawCode,
      };
    const step = nextStep(error.code);
    return {
      title: TITLE[step],
      body: error.userMessage,
      step,
      reference: error.requestId,
      code: error.rawCode,
    };
  }
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
      art={error instanceof ApiError && error.kind === 'network' ? 'off' : 'error'}
      title={view.title}
      body={view.body}
      reference={
        view.reference === null
          ? undefined
          : { label: en.common.reference, requestId: view.reference, code: view.code ?? undefined }
      }
      action={
        view.step === 'none'
          ? undefined
          : goHome
            ? { label: en.common.goHome, icon: 'home', onClick: onHome }
            : { label: en.common.tryAgain, icon: 'refresh', onClick: onRetry }
      }
    />
  );
}
