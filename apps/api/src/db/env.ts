import { z } from 'zod';

/** Database settings, shared by `db:migrate`, `db:seed` and the API config (platform/config.ts). */
export const appEnvSchema = z.enum(['local', 'test', 'staging', 'production']);

export const dbEnvSchema = z.object({
  APP_ENV: appEnvSchema,
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  DATABASE_PLATFORM_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  DATABASE_MIGRATION_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});
export type DbEnv = z.infer<typeof dbEnvSchema>;

/** Password embedded in a connection URL (local and test only: used to create the roles). */
export function passwordOf(url: string): string {
  const password = decodeURIComponent(new URL(url).password);
  if (password === '') throw new Error('database URL has no password');
  return password;
}
