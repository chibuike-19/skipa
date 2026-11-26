# ADR-33: Run the API's TypeScript directly on Node 24 (no build step, no runner)

|           |                                       |
| --------- | ------------------------------------- |
| Status    | Accepted (backend agent, 26 Nov 2026) |
| Milestone | M0                                    |

**Context.** The API, worker and scripts are TypeScript. They need to run locally, in CI and in the
Docker image. Usual choices add a dependency (tsx, ts-node) or a build step (tsc emit, esbuild).
TypeScript 7.0.2 is a native binary used for type-checking only (ADR-32).

**Options.** 1. Build with `tsc` to `dist/`. 2. Run with tsx. 3. Node 24's built-in type stripping.

**Decision.** Option 3. Node 24 runs `.ts` files directly by removing type annotations.
`packages/config/tsconfig.node.json` sets `allowImportingTsExtensions` (imports use `.ts`) and
`erasableSyntaxOnly` (TypeScript rejects syntax Node cannot strip: `enum`, `namespace`, constructor
parameter properties). Workspace packages are imported as `.ts` source.

**Consequences.** No new dependency and no build output to keep in step. Code must avoid enums
(use `as const` objects) and parameter properties; `tsc` enforces it. Stack traces point at source
lines. Vitest and Vite (frontend) already understand `.ts`.

**Revisit when.** Start-up time of the API image matters (type stripping costs a little at load),
or a dependency needs emitted JavaScript.
