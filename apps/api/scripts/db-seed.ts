// pnpm db:seed: fictional seed data for local and staging. Refuses to run in production.
import pg from 'pg';
import { z } from 'zod';

import { dbEnvSchema } from '../src/db/env.ts';
import { runSeed } from '../src/db/seed/seed.ts';
import { PiiCrypto } from '../src/platform/crypto.ts';

const env = dbEnvSchema
  .extend({
    NODE_ENV: z.string().optional(),
    PII_ENCRYPTION_KEY: z.string(),
    PII_HMAC_KEY: z.string(),
  })
  .parse(process.env);

if (env.APP_ENV === 'production' || env.NODE_ENV === 'production') {
  process.stderr.write('db:seed refuses to run in production\n');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: env.DATABASE_PLATFORM_URL,
  application_name: 'skipa-seed',
});
await client.connect();
try {
  await client.query('BEGIN');
  const counts = await runSeed(client, {
    crypto: new PiiCrypto(env.PII_ENCRYPTION_KEY, env.PII_HMAC_KEY),
  });
  await client.query('COMMIT');
  process.stdout.write(`seeded (rows inserted; 0 = already present): ${JSON.stringify(counts)}\n`);
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
