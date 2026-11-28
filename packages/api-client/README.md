# packages/api-client

**Owner:** frontend agent. Brief §4, §5; AD §8.2.

The only way the apps call the API. Types come from `api/openapi.v1.yaml`; nothing is hand-written.

| Export                                                    | What                                                                                                                                                                                   |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createApiClient({ baseUrl, app, version, onError })`     | openapi-fetch client typed by the contract: `credentials: 'include'`, `X-Skipa-Client: <app>/<version>`, a fresh `X-Request-Id` per request                                            |
| `unwrap(call)`                                            | Returns the data or throws an `ApiError`                                                                                                                                               |
| `ApiError`                                                | `kind` (`api` or `network`), `status`, `code` (catalogue code; unknown codes → `SYS-500`; `null` when offline), `rawCode`, `userMessage` (ER-07), `requestId` (short reference, ER-08) |
| `idempotentAction(send)`                                  | Key created when the user starts the action, reused on retry; a second tap while the first is in flight joins it (one request, one key)                                                |
| `idempotencyHeader(key)`                                  | `params: { header: idempotencyHeader(key) }`                                                                                                                                           |
| `subscribeRealtime({ baseUrl, channels, onEvent, poll })` | SSE from `/v1/stream`; polls every 3 s while the stream isn't open (or no `EventSource`)                                                                                               |
| `Schema<'Order'>`, `paths`, `components`, `operations`    | Generated types                                                                                                                                                                        |

```ts
const api = createApiClient({ baseUrl: import.meta.env.VITE_API_URL, app: 'shopper', version });
const order = await unwrap(api.GET('/v1/orders/{orderId}', { params: { path: { orderId } } }));
```

## Generating

`pnpm api-client:gen` writes `src/generated/schema.ts` (committed). A test regenerates it and fails
if it differs, so a contract change without regeneration fails CI. openapi-typescript needs the
TypeScript 6 compiler API; `scripts/gen.ts` gives it TypeScript 6.0.3 through a module hook
(ADR-36). Everything else type-checks with 7.0.2.
