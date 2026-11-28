# packages/mocks

**Owner:** frontend agent. Brief §5. Dev and tests only; never in a production bundle.

MSW 3 handlers that answer like the API in `api/openapi.v1.yaml`, so the apps are built before each
backend milestone lands. **Every handler response, in every scenario, is validated against the
contract** (`pnpm mocks:validate`, run in CI's `contract` job and by `pnpm test`).

| Path                                      | What                                                                                               |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `fixtures/*.json`, `validate_fixtures.py` | The pack's fixtures, moved unchanged from `docs/architecture-pack/mocks/`                          |
| `src/generated/operations.ts`             | Operation index from the contract (`mocks:gen`; drift fails `mocks:validate`)                      |
| `src/handlers/*.ts`                       | Handlers, each built with `mock(operationId, …)` so method and path come from the contract         |
| `src/seed.ts`                             | Adunni Mart (LK, IK; pilot), Harbour Grocers (VI; paid), staff and shopper from the canvas samples |
| `src/state.ts`                            | In-memory orders/receipts/sign-ins; the realtime bus behind `GET /v1/stream`                       |
| `src/scenarios.ts`                        | Scenario list (`?scenario=` or the dev toolbar), with the milestone that builds each               |
| `src/config.ts`                           | `VITE_USE_MOCKS`, `LIVE_TAGS` and `VITE_MOCK_LIVE_TAGS`: tags served by the real API               |
| `src/browser.ts` / `src/node.ts`          | `startBrowserMocks(import.meta.env)` / `createMockServer()`                                        |

## Rules the handlers enforce

- **No invented data.** An operation with no mock yet answers **501 `MOCK-501`** naming the
  operation. Mocked so far: 21 of 177 (`mocks:validate` prints the count). Each milestone adds its
  area's handlers.
- **Only documented statuses.** A handler cannot return a status the operation doesn't list.
- **Idempotency.** Operations whose contract requires `Idempotency-Key` reject a missing key
  (SYS-400) and replay the first response for a repeated key, so a double tap gives one order.
- **Payment truth.** An order becomes Paid only in the mock "server" (`state.ts`), 4 s after the
  payment attempt; the stream then sends `order.updated` and `receipt.issued`. `Date` drives it,
  so Playwright's clock can fast-forward the 2-minute PAY-007 case.
- **Errors** use the contract envelope with the catalogue's status and user message
  (`@skipa/contracts/errors`), and a short reference matching `X-Request-Id`.
- **SSE** uses MSW's `sse()` against the app's real `EventSource`, in the API's wire format. Event
  data carries IDs only; apps refetch on each event (AD §8.2). Node needs
  `--experimental-eventsource` (set in the package scripts).

## Scenarios

`default`, `payment-success`, `payment-pending-long`, `payment-failed`, `payments-unavailable`,
`branch-switched-off`, `price-changed`, `offline`, `server-error`, `exit-clear`, `exit-flagged`,
`exit-large-basket`, `exit-random`, `exit-invalid-used|expired|unpaid|other-branch`,
`exit-no-connection`, `refund-requested|awaiting-head-office|approved|declined|paid`.

**Listed, not built yet** (selecting them changes nothing): `cart-limit` (see gaps), `exit-mismatch`
(needs `recordWeight`, F4), `ticket-replied` (F3), `empty-states` (list handlers arrive with their
screens).

## Contract gaps found while building (raised with the backend agent)

1. `checkIn` documents no 404, so an unknown or retired QR code has no documented answer. The
   mock returns 400 SYS-400.
2. CART-004 (cart limit) is HTTP 422, but `createOrder` documents no 422.
3. PAY-001 (payments unavailable) is HTTP 503, but `createOrder` and `startPayment` document no 503. The mock shows it through check-in (`status: payments_unavailable`), which is documented.
