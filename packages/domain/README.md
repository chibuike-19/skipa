# packages/domain

**Owner:** backend agent (the frontend agent reviews every change).

Pure TypeScript with no I/O, shared by the API and the apps. Line, branch and function coverage must
stay at 90% or above (brief §14); `pnpm --filter @skipa/domain test` enforces it.

| Import                | What                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@skipa/domain/money` | `Kobo` (branded integer), `kobo()`, `koboFromDb()`, `parseNaira()`, `addKobo()`, `multiplyKobo()`, `applyBps()` (half-up), `formatNaira()` ("₦31,300", kobo only when non-zero) |
| `@skipa/domain/time`  | WAT business dates: `watDate()`, `parseWatDate()`, `startOfWatDay()`, `watDayRange()` (≤ 366 days), `formatWatTime()`, `formatWatDate()`                                        |

Still to come, with the milestone that needs each: `fees.ts` (M2), `flagging.ts`,
`random-blocks.ts` (M2/M3), `state-machines.ts`, `rbac.ts` (M1), `contrast.ts` (M6), `pos.ts` (M5).

Lint forbids `parseFloat` and `toFixed` across the repo: money never goes through floating point.
