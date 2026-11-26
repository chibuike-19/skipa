import { generateKeyPairSync, randomBytes } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { ConfigError, loadConfig } from './config.ts';
import { validEnv } from './test-env.ts';

const fails = (env: Record<string, string | undefined>) => {
  try {
    loadConfig(env);
  } catch (error) {
    expect(error).toBeInstanceOf(ConfigError);
    return (error as Error).message;
  }
  throw new Error('expected loadConfig to throw');
};

describe('loadConfig()', () => {
  it('accepts a complete local environment and parses it', () => {
    const config = loadConfig(validEnv());
    expect(config.PORT).toBe(4000);
    expect(config.APP_ORIGINS).toEqual(['http://localhost:5173', 'http://localhost:5174']);
    expect(config.PAYSTACK_SECRET_KEY).toBeUndefined();
    expect(config.EXIT_TOKEN_SIGNING_KEYS[0]?.kid).toBe('k1');
  });

  it('refuses to boot when a variable is missing, naming it', () => {
    expect(fails(validEnv({ PII_ENCRYPTION_KEY: undefined }))).toContain('PII_ENCRYPTION_KEY');
  });

  it('never prints secret values in the error', () => {
    // Built at runtime so the source holds no secret-shaped literals (keeps Gitleaks quiet).
    const secret = Buffer.from('secret-value-that-is-wrong-length').toString('base64');
    const liveKey = ['sk', 'live', 'abc123'].join('_');
    const message = fails(validEnv({ OTP_PEPPER: secret, PAYSTACK_SECRET_KEY: liveKey }));
    expect(message).not.toContain(secret);
    expect(message).not.toContain(liveKey);
  });

  it('refuses live Paystack keys outside production (AD §6.6)', () => {
    expect(fails(validEnv({ PAYSTACK_SECRET_KEY: 'sk_live_x' }))).toContain(
      'live key refused outside production',
    );
    expect(
      fails(
        validEnv({
          APP_ENV: 'staging',
          PAYSTACK_PUBLIC_KEY: 'pk_live_x',
          PAYSTACK_SECRET_KEY: 'sk_test_x',
          SMS_TRANSPORT: 'console',
        }),
      ),
    ).toContain('PAYSTACK_PUBLIC_KEY');
  });

  it('refuses test Paystack keys in production', () => {
    const message = fails(
      validEnv({
        APP_ENV: 'production',
        NODE_ENV: 'production',
        OTP_DEV_FIXED_CODE: '',
        PAYSTACK_SECRET_KEY: 'sk_test_x',
        PAYSTACK_PUBLIC_KEY: 'pk_test_x',
      }),
    );
    expect(message).toContain('test key refused in production');
  });

  it('requires Paystack keys and real transports when deployed', () => {
    const message = fails(validEnv({ APP_ENV: 'staging', OTP_DEV_FIXED_CODE: '' }));
    expect(message).toContain('PAYSTACK_SECRET_KEY: required in staging and production');
    expect(message).toContain('SMS_TRANSPORT: console transport refused when deployed');
    expect(message).toContain('EMAIL_TRANSPORT: console transport refused when deployed');
  });

  it('allows the fixed sign-in code only when APP_ENV is local (brief §9)', () => {
    expect(fails(validEnv({ APP_ENV: 'test' }))).toContain(
      'OTP_DEV_FIXED_CODE: only allowed when APP_ENV is local',
    );
    expect(
      loadConfig(validEnv({ APP_ENV: 'test', OTP_DEV_FIXED_CODE: '' })).OTP_DEV_FIXED_CODE,
    ).toBeUndefined();
  });

  it('requires 32-byte keys and different keys for each purpose', () => {
    expect(fails(validEnv({ PII_HMAC_KEY: randomBytes(16).toString('base64') }))).toContain(
      'PII_HMAC_KEY',
    );
    const shared = randomBytes(32).toString('base64');
    expect(fails(validEnv({ OTP_PEPPER: shared, PII_HMAC_KEY: shared }))).toContain(
      'each secret key must be different',
    );
  });

  it('requires Ed25519 exit-token keys with unique kids', () => {
    const rsa = generateKeyPairSync('rsa', { modulusLength: 1024 }).privateKey.export({
      type: 'pkcs8',
      format: 'pem',
    });
    expect(
      fails(
        validEnv({ EXIT_TOKEN_SIGNING_KEYS: JSON.stringify([{ kid: 'k1', privateKeyPem: rsa }]) }),
      ),
    ).toContain('Ed25519');
    expect(fails(validEnv({ EXIT_TOKEN_SIGNING_KEYS: 'not json' }))).toContain('must be JSON');
    const ed = generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'pem' });
    const dup = JSON.stringify([
      { kid: 'k1', privateKeyPem: ed },
      { kid: 'k1', privateKeyPem: ed },
    ]);
    expect(fails(validEnv({ EXIT_TOKEN_SIGNING_KEYS: dup }))).toContain(
      'kid values must be unique',
    );
  });

  it('requires provider settings when a provider transport is chosen', () => {
    const message = fails(validEnv({ EMAIL_TRANSPORT: 'resend', SMS_TRANSPORT: 'africastalking' }));
    for (const name of [
      'RESEND_API_KEY',
      'RESEND_WEBHOOK_SECRET',
      'AT_USERNAME',
      'AT_API_KEY',
      'TERMII_API_KEY',
      'SMS_WEBHOOK_SECRET',
    ]) {
      expect(message).toContain(name);
    }
  });

  it('keeps the email reserve below the daily limit', () => {
    expect(fails(validEnv({ EMAIL_DAILY_RESERVE: '100' }))).toContain('EMAIL_DAILY_RESERVE');
  });
});
