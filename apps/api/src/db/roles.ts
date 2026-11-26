import type { ClientBase } from 'pg';

/** The two runtime roles (brief §7). Names are fixed: migrations grant to them by name. */
export const RUNTIME_ROLES = {
  app: { name: 'skipa_app', bypassRls: false },
  platform: { name: 'skipa_platform', bypassRls: true },
} as const;

export interface RolePasswords {
  app: string;
  platform: string;
}

/**
 * Creates or updates the runtime roles. Only for local development and tests: on servers the
 * roles are created by infra/ansible with passwords from SOPS, and the migration role there is
 * not allowed to create roles.
 */
export async function ensureRuntimeRoles(client: ClientBase, passwords: RolePasswords) {
  for (const key of ['app', 'platform'] as const) {
    const role = RUNTIME_ROLES[key];
    const exists = await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [role.name]);
    // Identifiers are constants above; the password goes through format(%L) so it is quoted by Postgres.
    const verb = exists.rowCount === 0 ? 'CREATE' : 'ALTER';
    const rls = role.bypassRls ? 'BYPASSRLS' : 'NOBYPASSRLS';
    const { rows } = await client.query<{ sql: string }>(
      `SELECT format('${verb} ROLE ${role.name} LOGIN ${rls} NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD %L', $1::text) AS sql`,
      [passwords[key]],
    );
    const statement = rows[0]?.sql;
    if (statement === undefined) throw new Error('could not build role statement');
    await client.query(statement);
  }
}
