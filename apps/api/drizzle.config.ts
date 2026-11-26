// drizzle-kit is used to introspect (`pull`) and to draft future migrations. Migrations are
// reviewed SQL in db/migrations; triggers, RLS, partial indexes and generated columns are
// hand-written there (brief §7).
import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_MIGRATION_URL;
if (url === undefined) throw new Error('DATABASE_MIGRATION_URL is not set');

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: process.env.DRIZZLE_OUT ?? '../../db/migrations',
  schemaFilter: ['public', 'pii', 'audit', 'analytics'],
  dbCredentials: { url },
});
