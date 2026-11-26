// Personal data and secrets never reach logs or error reports (ER-05, brief §12).
// Used by the logger (every log line) and by the Sentry beforeSend hook.

const REDACTED = '[redacted]';

/** Keys whose values are always removed, compared case-insensitively without _ or -. */
const SENSITIVE_KEYS = new Set([
  'authorization',
  'cookie',
  'setcookie',
  'xpaystacksignature',
  'xskipadevice',
  'xskipaaccessgrant',
  'signature',
  'svixsignature',
  'password',
  'secret',
  'token',
  'accesstoken',
  'refreshtoken',
  'sessiontoken',
  'devicetoken',
  'registrationtoken',
  'invitetoken',
  'granttoken',
  'apikey',
  'otp',
  'otpcode',
  'pin',
  'cvv',
  'pan',
  'cardnumber',
  'phone',
  'phonenumber',
  'msisdn',
  'mobile',
  'email',
  'emailaddress',
  'destination',
  'name',
  'firstname',
  'lastname',
  'fullname',
  'shoppername',
  'accountnumber',
  'authorizationcode',
  'latitude',
  'longitude',
  'lat',
  'lng',
  'privatekeypem',
  'accesscode',
]);

const normalise = (key: string) => key.toLowerCase().replace(/[_-]/g, '');

export function isSensitiveKey(key: string): boolean {
  const k = normalise(key);
  return (
    SENSITIVE_KEYS.has(k) || k.endsWith('token') || k.endsWith('secret') || k.endsWith('password')
  );
}

// Free text can still carry personal data (an error message quoting an email or a phone number).
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const NG_PHONE = /(?:\+?234[\s-]?|\b0)[789][01]\d[\s-]?\d{3}[\s-]?\d{4}\b/g;
const BEARER = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi;
const PAYSTACK_KEY = /\b[sp]k_(?:test|live)_[A-Za-z0-9]+/g;

export function scrubText(text: string): string {
  return text
    .replace(BEARER, '$1 [redacted]')
    .replace(PAYSTACK_KEY, '[redacted-key]')
    .replace(EMAIL, '[email]')
    .replace(NG_PHONE, '[phone]');
}

/** Deep copy with sensitive keys removed and free text scrubbed. Handles cycles. */
export function scrub(value: unknown, seen: WeakSet<object> = new WeakSet()): unknown {
  if (typeof value === 'string') return scrubText(value);
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return '[circular]';
  seen.add(value);
  if (Array.isArray(value)) return value.map((v) => scrub(v, seen));
  if (value instanceof Date) return value;
  if (Buffer.isBuffer(value)) return `[${value.length} bytes]`;
  if (value instanceof Error) {
    return {
      type: value.name,
      message: scrubText(value.message),
      stack: value.stack && scrubText(value.stack),
    };
  }
  const out: Record<string, unknown> = {};
  for (const [key, inner] of Object.entries(value)) {
    out[key] = isSensitiveKey(key) ? REDACTED : scrub(inner, seen);
  }
  return out;
}
