## What and why

<!-- One or two sentences. -->

## Links

- Milestone: <!-- M0 … M6, H1 -->
- PRD IDs: <!-- e.g. PY-01, SH-17 -->
- Decision records: <!-- docs/adr/… if any -->

## Checks

- [ ] `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test` pass locally
- [ ] Integration tests cover every new route (happy path, validation, permission/scope, idempotency, state guards)
- [ ] Analytics events and error codes for this work are emitted and tested
- [ ] Logs carry request IDs; no personal data, card data or secrets in logs
- [ ] Money only through `packages/domain/money.ts`; money-moving requests carry an `Idempotency-Key`

## Contract

- [ ] No change to `api/openapi.v1.yaml`
- [ ] Contract changed: PR labelled `contract-change`, the other agent asked to review, breaking changes flagged for the lead

## Not done / open questions

<!-- Anything stubbed, skipped or left for later, stated plainly. -->
