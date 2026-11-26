// Personal data never leaves the phone in error reports or analytics (AN-06, ER-05, NF-29,
// AD §10.2 redaction list). Applied to GlitchTip events (beforeSend, breadcrumbs) and, from F1,
// to every analytics event before it is queued.
//
// Removed: names, phone numbers, emails, coordinates, card data, one-time codes, tokens, cookies,
// authorization headers. Values are replaced with "[removed]"; keys stay so a report still shows
// that the field existed.

export const REMOVED = '[removed]';

/** Keys whose values are always removed (matched case-insensitively, anywhere in the key). */
const SENSITIVE_KEY = /(?:^|[_\-.]|(?<=[a-z])(?=[A-Z]))(name|phone|email|lat|lng|latitude|longitude|coords?|card|pan|cvv|otp|token|password|secret|cookie|authorization|account_?number|destination)(?:$|[_\-.A-Z])/i;

/** Keys that look sensitive by the rule above but are safe identifiers we need. */
const SAFE_KEYS = new Set(['errorCode', 'error_code', 'rawCode', 'storeName', 'branchName', 'displayName', 'screen', 'event_name']);

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// Nigerian and international phone numbers: +234 803 123 4567, 08031234567, 803 123 4567.
const PHONE = /(?:\+?234[\s-]?|\b0)?[789][01]\d(?:[\s-]?\d){7}\b/g;
// Card numbers: 15–19 digits (optional single spaces or dashes) that pass the Luhn check. Barcodes
// (EAN-8/13, UPC-A: 8–13 digits) and IDs are not cards and must survive (product_scanned).
const CARD = /(?<!\d)\d(?:[ -]?\d){14,18}(?!\d)/g;

function luhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i += 1) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}
// Six-digit codes next to the word code/OTP.
const OTP = /\b(code|otp)\b(\W{1,3})\d{6}\b/gi;
// "lat,lng" pairs with decimals.
const COORDS = /-?\d{1,3}\.\d{3,}\s*,\s*-?\d{1,3}\.\d{3,}/g;

export function scrubText(text: string): string {
  return text
    .replace(EMAIL, REMOVED)
    .replace(COORDS, REMOVED)
    .replace(CARD, (m) => (luhn(m.replace(/\D/g, '')) ? REMOVED : m))
    .replace(PHONE, REMOVED)
    .replace(OTP, (_m, word: string, sep: string) => `${word}${sep}${REMOVED}`);
}

function isSensitiveKey(key: string): boolean {
  return !SAFE_KEYS.has(key) && SENSITIVE_KEY.test(key);
}

/** `code` is an error code ("PAY-007") or a sign-in code ("482913"); only the second is personal. */
function isSensitive(key: string, value: unknown): boolean {
  if (key === 'code') return typeof value !== 'string' || !/^[A-Z]{3,6}-\d{3}$/.test(value);
  if (/authorization_?code/i.test(key)) return true; // Paystack reusable card authorisation
  return isSensitiveKey(key);
}

/** Deep-copy `value` with personal data removed. Cycles are cut; depth is limited. */
export function scrubPersonalData<T>(value: T, depth = 8, seen = new WeakSet<object>()): T {
  if (typeof value === 'string') return scrubText(value) as T;
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value) || depth <= 0) return REMOVED as T;
  seen.add(value);
  if (Array.isArray(value)) return value.map((v: unknown) => scrubPersonalData(v, depth - 1, seen)) as T;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = isSensitive(k, v) && v !== null && v !== undefined ? REMOVED : scrubPersonalData(v, depth - 1, seen);
  }
  return out as T;
}

/** Remove query values that can carry personal data from a URL (keeps path and safe params). */
export function scrubUrl(url: string): string {
  try {
    const u = new URL(url, 'https://x.invalid');
    for (const key of [...u.searchParams.keys()]) {
      if (isSensitiveKey(key) || key === 'q' || key === 'trxref' || key === 'reference') u.searchParams.set(key, REMOVED);
    }
    const out = u.origin === 'https://x.invalid' ? `${u.pathname}${u.search}` : u.href;
    return scrubText(out);
  } catch {
    return scrubText(url);
  }
}
