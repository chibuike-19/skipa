// Every failure the apps see is an ApiError: the contract's envelope {error:{code,userMessage,
// requestId}} when the API answered, or a network failure. Apps map `code` to copy and a next step
// in their errors.tsx (ER-07) and show `requestId`, the short reference (ER-08).
import { isErrorCode, renderUserMessage, type ErrorCode } from '@skipa/contracts/errors';

export type ApiErrorKind = 'api' | 'network';

interface Envelope {
  error: { code: string; message?: string; userMessage?: string; requestId?: string };
}

const isEnvelope = (value: unknown): value is Envelope => {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false;
  const error = value.error;
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as { code?: unknown }).code === 'string'
  );
};

/** The short reference users read out (ER-08); same rule as the API's shortRequestRef(). */
export function shortRef(requestId: string): string {
  const tail = requestId
    .replace(/[^0-9a-fA-F]/g, '')
    .toLowerCase()
    .slice(-8)
    .padStart(8, '0');
  return `${tail.slice(0, 4)}-${tail.slice(4)}`;
}

export class ApiError extends Error {
  override readonly name = 'ApiError';
  /** 'network': no answer (offline, DNS, CORS, aborted). 'api': the API answered with an error. */
  readonly kind: ApiErrorKind;
  /** HTTP status, or null when there was no answer. */
  readonly status: number | null;
  /** A catalogue code. Unknown or missing codes become SYS-500; null only for network failures. */
  readonly code: ErrorCode | null;
  /** The code exactly as the server sent it (e.g. MOCK-501 from the mocks). */
  readonly rawCode: string | null;
  /** Plain-English message safe to show (ER-07). */
  readonly userMessage: string;
  /** Short reference for the user and support (ER-08), when the request reached the API. */
  readonly requestId: string | null;

  constructor(init: {
    kind: ApiErrorKind;
    status: number | null;
    code: ErrorCode | null;
    rawCode: string | null;
    userMessage: string;
    requestId: string | null;
    message: string;
    cause?: unknown;
  }) {
    super(init.message, { cause: init.cause });
    this.kind = init.kind;
    this.status = init.status;
    this.code = init.code;
    this.rawCode = init.rawCode;
    this.userMessage = init.userMessage;
    this.requestId = init.requestId;
  }
}

export function networkError(cause: unknown): ApiError {
  return new ApiError({
    kind: 'network',
    status: null,
    code: null,
    rawCode: null,
    userMessage: "You're offline. Check your data and try again.",
    requestId: null,
    message: cause instanceof Error ? cause.message : 'network error',
    cause,
  });
}

/** Normalise a non-2xx response (and its parsed body, if any) into an ApiError. */
export function errorFromResponse(response: Response, body: unknown): ApiError {
  const header = response.headers.get('X-Request-Id');
  const envelope = isEnvelope(body) ? body.error : undefined;
  const rawCode = envelope?.code ?? null;
  const code: ErrorCode = rawCode !== null && isErrorCode(rawCode) ? rawCode : 'SYS-500';
  const known = rawCode !== null && isErrorCode(rawCode);
  return new ApiError({
    kind: 'api',
    status: response.status,
    code,
    rawCode,
    // The server renders placeholders ("Already used for exit at 14:39"), so its text wins when
    // the code is one we know; otherwise fall back to the catalogue's generic message.
    userMessage:
      known && envelope?.userMessage !== undefined ? envelope.userMessage : renderUserMessage(code),
    requestId: envelope?.requestId ?? (header === null ? null : shortRef(header)),
    message: `${String(response.status)} ${rawCode ?? 'no error code'}${envelope?.message === undefined ? '' : `: ${envelope.message}`}`,
  });
}
