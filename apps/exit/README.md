# apps/exit

**Owner:** frontend agent. Exit mode at `exit.skipa.ng` (brief §6.2): phone and tablet, online only.

```bash
pnpm --filter @skipa/exit dev:mocks   # http://localhost:5174 against MSW
```

On mocks, sign in as `chidi.o@adunnimart.example` with any 6-digit code (`000000` = wrong code,
`111111` = expired). F0 is the shell (routing, session, error mapping); screens arrive in F4.
