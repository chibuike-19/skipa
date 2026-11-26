// Exit mode (online only, D-16). Lookups answer by scenario; weigh and complete arrive with F4.
import { HttpResponse } from 'msw';

import { empty, json, mock, type MockDefinition } from '../http.ts';
import { getScenario } from '../scenarios.ts';
import { fixtures } from '../seed.ts';

const flagged = fixtures.exitFlagged;
const used = fixtures.exitUsed;
const unflaggedItems = flagged.items.map((i) => ({ ...i, flagged: false, flagReason: null }));

function decision() {
  const checkId = crypto.randomUUID();
  switch (getScenario()) {
    case 'exit-flagged':
      return { ...flagged, checkId };
    case 'exit-large-basket':
    case 'exit-mismatch': // the mismatch itself comes from recordWeight (F4)
      return { ...flagged, checkId, items: unflaggedItems };
    case 'exit-random':
      return {
        ...flagged,
        checkId,
        randomCheck: true,
        largeBasket: false,
        expectedWeightGrams: null,
        weightRangeGrams: null,
        items: unflaggedItems,
      };
    case 'exit-invalid-used':
      return { ...used, checkId };
    case 'exit-invalid-expired':
      return { ...used, checkId, invalidReason: 'expired', usedAt: null };
    case 'exit-invalid-unpaid':
      return { ...used, checkId, invalidReason: 'not_paid', usedAt: null };
    case 'exit-invalid-other-branch':
      return { ...used, checkId, invalidReason: 'other_branch', usedAt: null };
    default:
      return {
        ...flagged,
        checkId,
        decision: 'clear',
        largeBasket: false,
        expectedWeightGrams: null,
        weightRangeGrams: null,
        receipt: { ...flagged.receipt, itemCount: 2 },
        items: [],
      };
  }
}

export const exitMocks: MockDefinition[] = [
  mock(
    'exitLookup',
    () => (getScenario() === 'exit-no-connection' ? HttpResponse.error() : json(decision())),
    [
      {
        headers: { 'Idempotency-Key': '0193a1f2-0000-7000-8000-0000000000f3' },
        body: { qrPayload: fixtures.receipt.exit.qrPayload },
      },
      {
        headers: { 'Idempotency-Key': '0193a1f2-0000-7000-8000-0000000000f4' },
        body: { receiptNumber: 'LK-04822' },
      },
    ],
  ),
  mock(
    'exitHeartbeat',
    () => (getScenario() === 'exit-no-connection' ? HttpResponse.error() : empty(204)),
    [{ body: { sentAt: '2026-11-26T10:00:00Z', appVersion: 'exit@0.0.0', networkType: '4g' } }],
  ),
];
