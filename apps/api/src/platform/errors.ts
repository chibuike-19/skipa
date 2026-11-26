// Business errors carry a catalogue code (brief §13: AppError('PAY-007', …)). The error handler
// turns them into the contract's envelope {error:{code,message,userMessage,requestId,details}}.
import { ERRORS, renderUserMessage, type ErrorCode } from '@skipa/contracts/errors';

import { shortRequestRef } from './ids.ts';
import { scrubText } from './redact.ts';

export interface AppErrorOptions {
  /** For logs and the envelope's `message`. Never put personal data here. */
  message?: string;
  /** Values for {placeholders} in the user message. */
  params?: Readonly<Record<string, string>>;
  /** Structured, non-personal details for the client (e.g. which items changed price). */
  details?: Readonly<Record<string, unknown>>;
  cause?: unknown;
}

export class AppError extends Error {
  override name = 'AppError';
  readonly code: ErrorCode;
  readonly params: Readonly<Record<string, string>>;
  readonly details: Readonly<Record<string, unknown>> | undefined;

  constructor(code: ErrorCode, options: AppErrorOptions = {}) {
    super(options.message ?? ERRORS[code].meaning, { cause: options.cause });
    this.code = code;
    this.params = options.params ?? {};
    this.details = options.details;
  }

  /** HTTP status for the response; a code that is never an HTTP error becomes a 500. */
  get status(): number {
    return ERRORS[this.code].http ?? 500;
  }
}

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    userMessage: string;
    requestId: string;
    details?: Readonly<Record<string, unknown>>;
  };
}

export function envelope(
  code: ErrorCode,
  requestId: string,
  message: string,
  params: Readonly<Record<string, string>> = {},
  details?: Readonly<Record<string, unknown>>,
): ErrorEnvelope {
  return {
    error: {
      code,
      message: scrubText(message),
      userMessage: renderUserMessage(code, params),
      requestId: shortRequestRef(requestId),
      ...(details && { details }),
    },
  };
}
