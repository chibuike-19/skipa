// pnpm db:migrate: apply db/migrations as the migration owner.
// In local and test it also creates the runtime roles from the passwords in the database URLs.
import { dbEnvSchema, passwordOf } from '../src/db/env.ts';
import { runMigrations } from '../src/db/migrate.ts';

const env = dbEnvSchema.parse(process.env);
const local = env.APP_ENV === 'local' || env.APP_ENV === 'test';

await runMigrations({
  migrationUrl: env.DATABASE_MIGRATION_URL,
  ...(local && {
    rolePasswords: {
      app: passwordOf(env.DATABASE_URL),
      platform: passwordOf(env.DATABASE_PLATFORM_URL),
    },
  }),
});
process.stdout.write('migrations applied\n');
