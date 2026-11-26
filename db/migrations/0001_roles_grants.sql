-- Privileges for the two runtime roles (brief §7, schema.sql §16 notes).
--   skipa_app       request traffic for shopper, exit and store surfaces; RLS enforced.
--   skipa_platform  worker jobs and super admin routes; BYPASSRLS.
-- The roles themselves are created outside migrations: by infra/ansible on servers, and by
-- `pnpm db:migrate` itself when APP_ENV is local or test (apps/api/src/db/roles.ts).
-- Append-only tables keep their triggers; audit tables get no UPDATE/DELETE grant at all.

GRANT USAGE ON SCHEMA public, analytics, pii, audit TO skipa_app, skipa_platform;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public, analytics, pii
  TO skipa_app, skipa_platform;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA audit TO skipa_app, skipa_platform;

ALTER DEFAULT PRIVILEGES IN SCHEMA public, analytics, pii
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO skipa_app, skipa_platform;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit
  GRANT SELECT, INSERT ON TABLES TO skipa_app, skipa_platform;
ALTER DEFAULT PRIVILEGES IN SCHEMA public, analytics, pii, audit
  GRANT USAGE, SELECT ON SEQUENCES TO skipa_app, skipa_platform;
