// Creates a fresh database for the integration run, applies every migration with the real
// runner (including role creation, as in local), and drops the database afterwards.
// Settings come from apps/api/.env locally, or from the CI environment.
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import pg from 'pg';
import type { TestProject } from 'vitest/node';

import { dbEnvSchema, passwordOf } from '../../src/db/env.ts';
import { runMigrations } from '../../src/db/migrate.ts';

declare module 'vitest' {
  export interface ProvidedContext {
    db: { ownerUrl: string; appUrl: string; platformUrl: string };
  }
}

function withDatabase(url: string, database: string) {
  const u = new URL(url);
  u.pathname = `/${database}`;
  return u.toString();
}

export default async function setup(project: TestProject) {
  const envFile = fileURLToPath(new URL('../../.env', import.meta.url));
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  const env = dbEnvSchema.parse({ ...process.env, APP_ENV: 'test' });

  const database = `skipa_test_${randomBytes(4).toString('hex')}`;
  const admin = new pg.Client({
    connectionString: withDatabase(env.DATABASE_MIGRATION_URL, 'postgres'),
  });
  await admin.connect();
  await admin.query(`CREATE DATABASE ${database}`);

  const urls = {
    ownerUrl: withDatabase(env.DATABASE_MIGRATION_URL, database),
    appUrl: withDatabase(env.DATABASE_URL, database),
    platformUrl: withDatabase(env.DATABASE_PLATFORM_URL, database),
  };
  await runMigrations({
    migrationUrl: urls.ownerUrl,
    rolePasswords: {
      app: passwordOf(env.DATABASE_URL),
      platform: passwordOf(env.DATABASE_PLATFORM_URL),
    },
  });
  project.provide('db', urls);

  return async () => {
    await admin.query(`DROP DATABASE IF EXISTS ${database} WITH (FORCE)`);
    await admin.end();
  };
}
