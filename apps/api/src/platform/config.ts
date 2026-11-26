// Configuration (brief §15): every variable is validated at start-up and the process refuses to
// boot on anything missing or inconsistent. Read it once in server.ts/worker.ts and pass it down;
// nothing else reads process.env.
import { createPrivateKey } from 'node:crypto';

import { z } from 'zod';

import { appEnvSchema, dbEnvSchema } from '../db/env.ts';

const base64Key32 = z
  .string()
  .refine((v) => Buffer.from(v, 'base64').length === 32 && /^[A-Za-z0-9+/]+=*$/.test(v), {
    error: 'must be 32 random bytes, base64-encoded',
  });

const optionalText = z
  .string()
  .optional()
  .transform((v) => (v === undefined || v.trim() === '' ? undefined : v));

const csv = z.string().transform((v) =>
  v
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== ''),
);

const intFromEnv = (min: number) => z.coerce.number().int().min(min);

const exitSigningKeys = z
  .string()
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      ctx.addIssue({ code: 'custom', message: 'must be JSON' });
      return z.NEVER;
    }
  })
  .pipe(
    z
      .array(
        z.object({ kid: z.string().regex(/^[A-Za-z0-9_-]{1,32}$/), privateKeyPem: z.string() }),
      )
      .min(1),
  )
  .superRefine((keys, ctx) => {
    for (const [i, key] of keys.entries()) {
      try {
        if (createPrivateKey(key.privateKeyPem).asymmetricKeyType !== 'ed25519') throw new Error();
      } catch {
        ctx.addIssue({
          code: 'custom',
          path: [i, 'privateKeyPem'],
          message: 'must be an Ed25519 private key (PEM)',
        });
      }
    }
    if (new Set(keys.map((k) => k.kid)).size !== keys.length) {
      ctx.addIssue({ code: 'custom', message: 'kid values must be unique' });
    }
  });

const envSchema = dbEnvSchema
  .extend({
    APP_ENV: appEnvSchema,
    NODE_ENV: z.enum(['development', 'production', 'test']),
    PORT: intFromEnv(1).max(65_535),
    PUBLIC_API_URL: z.url(),
    APP_ORIGINS: csv.pipe(z.array(z.url()).min(1)),
    RELEASE: z.string().min(1),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
    BUSINESS_TZ: z.literal('Africa/Lagos'),
    PG_POOL_MAX: intFromEnv(1).max(100),

    OTP_PEPPER: base64Key32,
    OTP_DEV_FIXED_CODE: optionalText.pipe(
      z
        .string()
        .regex(/^\d{6}$/)
        .optional(),
    ),
    DEVICE_TOKEN_SECRET: base64Key32,
    REGISTRATION_TOKEN_SECRET: base64Key32,
    PII_ENCRYPTION_KEY: base64Key32,
    PII_HMAC_KEY: base64Key32,
    CONFIG_ENCRYPTION_KEY: base64Key32,
    TOTP_ENCRYPTION_KEY: base64Key32,
    EXIT_TOKEN_SIGNING_KEYS: exitSigningKeys,

    PAYSTACK_SECRET_KEY: optionalText,
    PAYSTACK_PUBLIC_KEY: optionalText,
    PAYSTACK_BASE_URL: z.url(),
    PAYSTACK_CALLBACK_URL: z.url(),
    PAYMENT_EMAIL_DOMAIN: z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/),

    SMS_TRANSPORT: z.enum(['console', 'africastalking']),
    AT_USERNAME: optionalText,
    AT_API_KEY: optionalText,
    AT_SENDER_ID: optionalText,
    TERMII_API_KEY: optionalText,
    TERMII_SENDER_ID: optionalText,
    SMS_WEBHOOK_SECRET: optionalText,
    SMS_ALLOWLIST: optionalText.transform((v) =>
      v === undefined ? [] : v.split(',').map((s) => s.trim()),
    ),

    EMAIL_TRANSPORT: z.enum(['console', 'resend']),
    RESEND_API_KEY: optionalText,
    RESEND_WEBHOOK_SECRET: optionalText,
    EMAIL_FROM: z.string().min(3),
    EMAIL_DAILY_LIMIT: intFromEnv(1),
    EMAIL_MONTHLY_LIMIT: intFromEnv(1),
    EMAIL_DAILY_RESERVE: intFromEnv(0),

    TELEGRAM_BOT_TOKEN: optionalText,
    TELEGRAM_ALERT_CHAT_ID: optionalText,
    PLATFORM_ALERT_EMAIL: optionalText,

    POSTHOG_API_KEY: optionalText,
    POSTHOG_HOST: optionalText,
    POSTHOG_MONTHLY_CAP: intFromEnv(0),

    SENTRY_DSN: optionalText,
    SENTRY_ENVIRONMENT: z.string().min(1),

    R2_ACCOUNT_ID: optionalText,
    R2_ACCESS_KEY_ID: optionalText,
    R2_SECRET_ACCESS_KEY: optionalText,
    R2_BUCKET_ASSETS: optionalText,
    R2_PUBLIC_BASE_URL: optionalText,

    FILES_DIR: z.string().min(1),
    TURNSTILE_SECRET_KEY: optionalText,
  })
  .superRefine((env, ctx) => {
    const issue = (path: string, message: string) => {
      ctx.addIssue({ code: 'custom', path: [path], message });
    };
    const deployed = env.APP_ENV === 'staging' || env.APP_ENV === 'production';
    const live = /^(sk|pk)_live_/;
    const test = /^(sk|pk)_test_/;

    // Paystack keys (AD §6.6): live keys only in production, test keys never in production.
    for (const name of ['PAYSTACK_SECRET_KEY', 'PAYSTACK_PUBLIC_KEY'] as const) {
      const value = env[name];
      if (value === undefined) {
        if (deployed) issue(name, 'required in staging and production');
        continue;
      }
      const prefix = name === 'PAYSTACK_SECRET_KEY' ? 'sk_' : 'pk_';
      if (!value.startsWith(prefix)) issue(name, `must start with ${prefix}`);
      if (env.APP_ENV === 'production' && test.test(value))
        issue(name, 'test key refused in production');
      if (env.APP_ENV !== 'production' && live.test(value))
        issue(name, 'live key refused outside production');
    }
    if (env.APP_ENV === 'production' && env.NODE_ENV !== 'production') {
      issue('NODE_ENV', 'must be production when APP_ENV is production');
    }

    // The fixed sign-in code exists for local development only (brief §9).
    if (env.OTP_DEV_FIXED_CODE !== undefined && env.APP_ENV !== 'local') {
      issue('OTP_DEV_FIXED_CODE', 'only allowed when APP_ENV is local');
    }

    // Console transports never leave a developer machine or CI.
    if (deployed && env.SMS_TRANSPORT === 'console')
      issue('SMS_TRANSPORT', 'console transport refused when deployed');
    if (deployed && env.EMAIL_TRANSPORT === 'console')
      issue('EMAIL_TRANSPORT', 'console transport refused when deployed');
    if (env.SMS_TRANSPORT === 'africastalking') {
      for (const name of [
        'AT_USERNAME',
        'AT_API_KEY',
        'TERMII_API_KEY',
        'SMS_WEBHOOK_SECRET',
      ] as const) {
        if (env[name] === undefined) issue(name, 'required when SMS_TRANSPORT is africastalking');
      }
    }
    if (env.EMAIL_TRANSPORT === 'resend') {
      for (const name of ['RESEND_API_KEY', 'RESEND_WEBHOOK_SECRET'] as const) {
        if (env[name] === undefined) issue(name, 'required when EMAIL_TRANSPORT is resend');
      }
    }
    if (env.EMAIL_DAILY_RESERVE >= env.EMAIL_DAILY_LIMIT) {
      issue('EMAIL_DAILY_RESERVE', 'must be below EMAIL_DAILY_LIMIT');
    }

    // Distinct keys: reusing one key for two purposes weakens both.
    const keys = [
      'OTP_PEPPER',
      'DEVICE_TOKEN_SECRET',
      'REGISTRATION_TOKEN_SECRET',
      'PII_ENCRYPTION_KEY',
      'PII_HMAC_KEY',
      'CONFIG_ENCRYPTION_KEY',
      'TOTP_ENCRYPTION_KEY',
    ] as const;
    if (new Set(keys.map((k) => env[k])).size !== keys.length) {
      issue('OTP_PEPPER', 'each secret key must be different');
    }
  });

export type Config = z.infer<typeof envSchema>;

export class ConfigError extends Error {
  override name = 'ConfigError';
}

/**
 * Validate the environment. The error lists variable names and problems only, never values,
 * so it is safe to print at start-up.
 */
export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const result = envSchema.safeParse(env);
  if (result.success) return result.data;
  const lines = result.error.issues.map((i) => `  ${i.path.join('.') || '(env)'}: ${i.message}`);
  throw new ConfigError(`invalid configuration:\n${[...new Set(lines)].join('\n')}`);
}
