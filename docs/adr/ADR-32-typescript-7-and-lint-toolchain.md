# ADR-32: TypeScript 7 for type-checking, TypeScript 6 for the lint toolchain

|           |                                                                                           |
| --------- | ----------------------------------------------------------------------------------------- |
| Status    | Accepted (backend agent, 26 Nov 2026), under the brief §3 rule for tools that fail on 7.x |
| Milestone | M0, repository setup                                                                      |

**Context.** The brief pins TypeScript 7.0.2. The 7.0.2 npm package ships only the native `tsc`
binary; it has no JavaScript compiler API. typescript-eslint 8.74.0 (the current release) needs
that API and declares `typescript >=4.8.4 <6.1.0` as a peer. Brief §3 says: "if a tool in the
chain fails on 7.x, pin that package's toolchain to 6.x and note it in the PR".

**Options.**

1. TypeScript 6.x everywhere. Simple, but drops the pinned 7.0.2 compiler for no reason.
2. Lint without type information (typescript-eslint non-type-checked rules). Loses the rules that
   matter most here (floating promises, unsafe `any`, unsafe enum assignment).
3. Two versions with clear jobs: 7.0.2 type-checks every package; 6.0.3 is installed only at the
   repo root as the parser for typescript-eslint.

**Decision.** Option 3.

- Each workspace package lists `typescript: 7.0.2` and runs `tsc` from its own `node_modules/.bin`
  (`pnpm typecheck`, through Turborepo).
- The repo root lists `typescript: 6.0.3` with `eslint` and `typescript-eslint`. Nothing else uses it.

**Consequences.**

- `pnpm typecheck` is the authority on types; lint uses 6.0.3's understanding of the same code. If
  they ever disagree (syntax that only 7.x accepts), lint fails loudly, so this cannot hide errors.
- Editors may pick up 6.0.3 from the root; point the editor at the package's 7.0.2 if that matters.
- Tools added later that need the compiler API (for example drizzle-kit) are checked when they
  arrive, and either use 6.0.3 or get their own note in their PR.

**Revisit when.** typescript-eslint supports TypeScript 7 (its peer range includes 7.x). Then drop
6.0.3 from the root.
