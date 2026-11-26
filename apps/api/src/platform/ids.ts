import { randomBytes } from 'node:crypto';

/** UUID v7 (RFC 9562): 48-bit Unix ms timestamp, version 7, variant 10, 74 random bits. */
export function uuidv7(now: number = Date.now()): string {
  const bytes = randomBytes(16);
  let ts = BigInt(now);
  for (let i = 5; i >= 0; i--) {
    bytes[i] = Number(ts & 0xffn);
    ts >>= 8n;
  }
  bytes[6] = 0x70 | ((bytes[6] ?? 0) & 0x0f);
  bytes[8] = 0x80 | ((bytes[8] ?? 0) & 0x3f);
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Client-supplied request IDs are kept only if short and plain (contract: ≤ 64 chars). */
const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{8,64}$/;

export function acceptRequestId(incoming: unknown): string | undefined {
  return typeof incoming === 'string' && SAFE_REQUEST_ID.test(incoming) ? incoming : undefined;
}

/**
 * The short reference people see and read out to support (ER-08): the last 8 hex characters of
 * the request ID, as "91c0-44ad".
 */
export function shortRequestRef(requestId: string): string {
  const tail = requestId
    .replace(/[^0-9a-fA-F]/g, '')
    .toLowerCase()
    .slice(-8)
    .padStart(8, '0');
  return `${tail.slice(0, 4)}-${tail.slice(4)}`;
}
