# ADR-36: Generate API types with openapi-typescript on TypeScript 6.0.3

|           |                                                                          |
| --------- | ------------------------------------------------------------------------ |
| Status    | Accepted (frontend agent, 26 Nov 2026), under the brief §3 rule (ADR-32) |
| Milestone | F0, `packages/api-client`                                                |

**Context.** Brief §5 requires the API types to be generated with openapi-typescript 7.13.0
(`pnpm api-client:gen`). openapi-typescript builds its output with the TypeScript compiler API
(`ts.factory`) and declares `typescript ^5.x` as a peer. TypeScript 7.0.2 ships only the native
compiler, without that API: generation fails with `Cannot read properties of undefined (reading
'createKeywordTypeNode')`. `packages/api-client` type-checks with 7.0.2 like every other package,
so pnpm resolves openapi-typescript's peer to 7.0.2. A pnpm `overrides` entry does not change a
peer's resolution (tried).

**Options.**

1. Hand-write the types. Forbidden by brief §5.
2. Type-check `packages/api-client` with TypeScript 6 instead of 7. Drops the pinned compiler for a
   whole package to fix one script.
3. Install TypeScript 6.0.3 under an alias (`typescript-6`) as a dev dependency of
   `packages/api-client`, and have `scripts/gen.ts` redirect only openapi-typescript's
   `import 'typescript'` to it with a Node module resolve hook (`module.registerHooks`, Node 24).

**Decision.** Option 3. The hook matches only imports whose parent is inside `openapi-typescript`;
everything else, including `tsc` for type-checking, uses 7.0.2.

**Consequences.**

- One extra dev dependency (`typescript-6` → `typescript@6.0.3`), the version already at the repo
  root for typescript-eslint (ADR-32). Nothing ships to users.
- The output is committed (`src/generated/schema.ts`). A test regenerates it and fails on any
  difference, so the types cannot drift from `api/openapi.v1.yaml`.

**Revisit when.** openapi-typescript supports TypeScript 7 (its peer range includes 7.x). Then
remove the alias and the hook.
