# apps/store

**Owner:** frontend agent. Skipa for stores at `stores.skipa.ng` (brief §6.3).

```bash
pnpm --filter @skipa/store dev:mocks   # http://localhost:5175 against MSW
```

On mocks, sign in as `bisi.kalu@adunnimart.example` with any 6-digit code (`000000` = wrong code, `111111` =
expired). F0 is the shell (routing, session, error mapping, navigation); screens arrive in F5.
