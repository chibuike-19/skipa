// A complete, valid local environment for unit tests (values are throwaway test fixtures).
import { generateKeyPairSync, randomBytes } from 'node:crypto';

const key = () => randomBytes(32).toString('base64');

export function validEnv(
  overrides: Record<string, string | undefined> = {},
): Record<string, string | undefined> {
  const exitKey = generateKeyPairSync('ed25519').privateKey.export({
    type: 'pkcs8',
    format: 'pem',
  });
  return {
    APP_ENV: 'local',
    NODE_ENV: 'development',
    PORT: '4000',
    PUBLIC_API_URL: 'http://localhost:4000',
    APP_ORIGINS: 'http://localhost:5173,http://localhost:5174',
    RELEASE: 'api@0.0.0+test',
    LOG_LEVEL: 'info',
    BUSINESS_TZ: 'Africa/Lagos',
    DATABASE_URL: 'postgres://skipa_app:a@127.0.0.1:5432/skipa',
    DATABASE_PLATFORM_URL: 'postgres://skipa_platform:b@127.0.0.1:5432/skipa',
    DATABASE_MIGRATION_URL: 'postgres://skipa_owner:c@127.0.0.1:5432/skipa',
    PG_POOL_MAX: '5',
    OTP_PEPPER: key(),
    OTP_DEV_FIXED_CODE: '000000',
    DEVICE_TOKEN_SECRET: key(),
    REGISTRATION_TOKEN_SECRET: key(),
    PII_ENCRYPTION_KEY: key(),
    PII_HMAC_KEY: key(),
    CONFIG_ENCRYPTION_KEY: key(),
    TOTP_ENCRYPTION_KEY: key(),
    EXIT_TOKEN_SIGNING_KEYS: JSON.stringify([{ kid: 'k1', privateKeyPem: exitKey }]),
    PAYSTACK_SECRET_KEY: '',
    PAYSTACK_PUBLIC_KEY: '',
    PAYSTACK_BASE_URL: 'https://api.paystack.co',
    PAYSTACK_CALLBACK_URL: 'http://localhost:4000/v1/payments/return',
    PAYMENT_EMAIL_DOMAIN: 'pay.skipa.test',
    SMS_TRANSPORT: 'console',
    EMAIL_TRANSPORT: 'console',
    EMAIL_FROM: 'Skipa <no-reply@skipa.test>',
    EMAIL_DAILY_LIMIT: '100',
    EMAIL_MONTHLY_LIMIT: '3000',
    EMAIL_DAILY_RESERVE: '40',
    POSTHOG_MONTHLY_CAP: '900000',
    SENTRY_ENVIRONMENT: 'test',
    FILES_DIR: '/tmp/skipa-files',
    ...overrides,
  };
}
