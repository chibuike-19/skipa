// Personal data at rest (brief §12, AD §11.2): phone and email are AES-256-GCM encrypted
// (PII_ENCRYPTION_KEY) and looked up by HMAC-SHA256 (PII_HMAC_KEY), never stored in clear.
// Only modules/identity and modules/privacy may use these helpers on pii.* data.
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

const VERSION = 1;
const IV_BYTES = 12;
const TAG_BYTES = 16;

function key32(base64: string, name: string): Buffer {
  const key = Buffer.from(base64, 'base64');
  if (key.length !== 32) throw new Error(`${name} must be 32 bytes`);
  return key;
}

export class PiiCrypto {
  private readonly encryptionKey: Buffer;
  private readonly hmacKey: Buffer;

  constructor(encryptionKeyBase64: string, hmacKeyBase64: string) {
    this.encryptionKey = key32(encryptionKeyBase64, 'PII_ENCRYPTION_KEY');
    this.hmacKey = key32(hmacKeyBase64, 'PII_HMAC_KEY');
  }

  /** version (1 byte) | IV (12) | auth tag (16) | ciphertext. `context` binds the value to its column. */
  encrypt(plaintext: string, context: string): Buffer {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv, {
      authTagLength: TAG_BYTES,
    });
    cipher.setAAD(Buffer.from(context));
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    return Buffer.concat([Buffer.from([VERSION]), iv, cipher.getAuthTag(), ciphertext]);
  }

  decrypt(sealed: Buffer, context: string): string {
    if (sealed.length < 1 + IV_BYTES + TAG_BYTES || sealed[0] !== VERSION)
      throw new Error('unknown PII ciphertext format');
    const iv = sealed.subarray(1, 1 + IV_BYTES);
    const tag = sealed.subarray(1 + IV_BYTES, 1 + IV_BYTES + TAG_BYTES);
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv, {
      authTagLength: TAG_BYTES,
    });
    decipher.setAAD(Buffer.from(context));
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(sealed.subarray(1 + IV_BYTES + TAG_BYTES)),
      decipher.final(),
    ]).toString('utf8');
  }

  /** Deterministic lookup key for a normalised value (e.g. "phone:+2348031234567"). */
  lookupKey(kind: 'phone' | 'email' | 'ip', normalisedValue: string): Buffer {
    return createHmac('sha256', this.hmacKey).update(`${kind}:${normalisedValue}`).digest();
  }

  sameLookup(a: Buffer, b: Buffer): boolean {
    return a.length === b.length && timingSafeEqual(a, b);
  }
}

/** Nigerian mobile numbers to E.164 (+234…). SMS goes only to +234 (brief §12). */
export function normaliseNigerianPhone(input: string): string | undefined {
  const digits = input.replace(/[\s()-]/g, '');
  const match = /^(?:\+234|234|0)([789][01]\d{8})$/.exec(digits);
  return match ? `+234${match[1] ?? ''}` : undefined;
}

/** "+234 803 *** 1180" (AD §6.3 masked destination). */
export function maskPhone(e164: string): string {
  return `+234 ${e164.slice(4, 7)} *** ${e164.slice(-4)}`;
}

/** "t***@skipa.ng". */
export function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.split('@');
  return `${local.slice(0, 1)}***@${domain}`;
}
