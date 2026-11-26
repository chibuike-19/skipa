# ADR-35: Generate the OpenAPI contract with an in-repo Zod emitter and YAML writer

|           |                                       |
| --------- | ------------------------------------- |
| Status    | Accepted (backend agent, 26 Nov 2026) |
| Milestone | M0                                    |

**Context.** Brief §5: from M0, `packages/contracts` (Zod) is the source of `api/openapi.v1.yaml`;
`pnpm contract:build` regenerates it and CI fails if the committed file differs, or if it changes
in meaning without a `contract-change` label. The agreed file uses a small, regular JSON Schema
subset (strict/loose objects, string formats, integers with bounds, enums, arrays, `$ref`,
`oneOf [X, null]`). Zod's built-in `toJSONSchema` adds keywords the contract does not have (regex
patterns for `uuid`/`email`, safe-integer bounds), and the approved stack has no YAML library.

**Options.** 1. Zod `toJSONSchema` + a YAML package (new dependency; output differs from the agreed
file). 2. `@fastify/swagger` from registered routes (needs all 177 routes registered; still differs). 3. A small emitter for exactly the subset in use, plus a minimal YAML writer, both in
`packages/contracts/src/openapi/`.

**Decision.** Option 3. The emitter throws on any Zod construct outside the subset, so the
generated file is always exactly what the source says. The Zod source was produced once from the
agreed file by `scripts/import_openapi_once.py` (kept for traceability, not to be re-run). The
first generated file has **no semantic differences** from the agreed file (checked with
`scripts/contract_diff.py`). CI uses Python with pinned pyyaml and jsonschema for two checks only
(the pack's own fixture validator and the semantic diff); nothing in the product uses Python.

**Consequences.** No new runtime or build dependency. Adding a new kind of schema construct means
extending the emitter (with a test) first. The YAML layout changed once (same meaning), so the
first PR is labelled `contract-change` as formatting-only for the frontend agent to approve.

**Revisit when.** The contract needs constructs the emitter does not cover often enough that
extending it costs more than adopting a library.
