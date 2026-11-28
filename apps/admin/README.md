# apps/admin

**Owner:** frontend agent. Skipa super admin at `admin.skipa.ng` (brief §6.4).

```bash
pnpm --filter @skipa/admin dev:mocks   # http://localhost:5176 against MSW
```

On mocks, sign in as `tolu@skipa.example` with any 6-digit code (`000000` = wrong code, `111111` =
expired). F0 is the shell (routing, session, error mapping, navigation); screens arrive in F6.
