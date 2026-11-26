# packages/contracts

**Owner:** backend agent. The frontend agent reviews every change; breaking changes also need the
lead (brief §5).

The API contract's source. `api/openapi.v1.yaml` is **generated** from here and committed.

| Path                             | What                                                                       |
| -------------------------------- | -------------------------------------------------------------------------- |
| `src/schemas/components.ts`      | The 148 named schemas (`<Name>Schema`), Zod                                |
| `src/schemas/primitives.ts`      | Shared pieces, e.g. `kobo` (integer kobo, int64)                           |
| `src/operations/*.ts`            | The 177 operations by tag (`defineOperation(method, path, spec)`)          |
| `src/errors.ts`                  | Error code catalogue (AD §10.3)                                            |
| `src/openapi/`                   | Emitter (Zod → JSON Schema subset), YAML writer, document builder (ADR-35) |
| `scripts/build-openapi.ts`       | `pnpm contract:build` / `pnpm contract:check`                              |
| `scripts/import_openapi_once.py` | One-off import from the agreed YAML (M0). Do not run again.                |

**Changing the contract:** edit the Zod source, run `pnpm contract:build`, commit both, label the
PR `contract-change`, list what changed and why, and ask the other agent to review. CI
(`contract` job) fails if the YAML is stale, if a pack fixture no longer validates, or if the
meaning changed without the label (`scripts/contract_diff.py` against the base branch).

Not here yet: `src/events.ts` (analytics event allow-list, M6 per brief §17; added with the first
server-side events in M1).
