// Discovery, Shopping, Payments, Receipts, Refunds (shopper PWA).
import { apiError, empty, json, mock, readJson, type MockDefinition } from '../http.ts';
import { getScenario } from '../scenarios.ts';
import { BRANCHES, branchById, fixtures } from '../seed.ts';
import * as db from '../state.ts';

const LK = fixtures.checkIn.branch.branchId;
const ORDER_ID = fixtures.orderPending.id;

function catalogueFor(branchId: string) {
  return { ...fixtures.catalogue, branchId, generatedAt: new Date().toISOString() };
}

const REFUND_STATES = {
  'refund-requested': { status: 'requested', needsHeadOffice: false },
  'refund-awaiting-head-office': { status: 'awaiting_head_office' },
  'refund-approved': { status: 'approved' },
  'refund-declined': {
    status: 'declined',
    declineReason: 'The rice was opened, so we can’t take it back.',
  },
  'refund-paid': {
    status: 'paid',
    paymentMethod: 'bank_transfer',
    paidAt: '2026-11-25T16:40:00Z',
    recordedByName: 'Bisi Kalu',
  },
} as const;

export const shoppingMocks: MockDefinition[] = [
  mock(
    'getBranchPublic',
    ({ params }) => {
      const seed = branchById(params.branchId ?? '');
      return seed === undefined ? apiError('SYS-404', 'unknown branch') : json(seed.branch);
    },
    [{ params: { branchId: LK } }],
  ),

  mock(
    'checkIn',
    async ({ request }) => {
      const body = await readJson<{ qrCode?: string }>(request);
      const seed = BRANCHES.find((b) => b.qrCode === body?.qrCode);
      // The contract has no 404 for an unknown QR code (raised with the backend); 400 is the closest documented status.
      if (seed === undefined) return apiError('SYS-400', `unknown QR code ${body?.qrCode ?? ''}`);
      const scenario = getScenario();
      const status =
        scenario === 'branch-switched-off'
          ? 'switched_off'
          : scenario === 'payments-unavailable'
            ? 'payments_unavailable'
            : 'active';
      const skipaStatus =
        status === 'switched_off'
          ? 'off'
          : status === 'payments_unavailable'
            ? 'payments_unavailable'
            : 'on';
      return json(
        {
          ...fixtures.checkIn,
          sessionId: crypto.randomUUID(),
          branch: { ...seed.branch, skipaStatus },
          status,
        },
        201,
      );
    },
    [
      { body: { qrCode: 'QR-ADU-LKI-01', entryPoint: 'store_qr' } },
      { body: { qrCode: 'QR-HBR-VIC-01' } },
    ],
  ),

  mock(
    'getCatalogue',
    ({ params, url }) => {
      const branchId = params.branchId ?? '';
      if (branchById(branchId) === undefined) return apiError('SYS-404', 'unknown branch');
      if (url.searchParams.get('sinceVersion') === String(fixtures.catalogue.version))
        return empty(304);
      return json(catalogueFor(branchId));
    },
    [
      { params: { branchId: LK } },
      { params: { branchId: LK }, query: { sinceVersion: String(fixtures.catalogue.version) } },
    ],
  ),

  mock(
    'createOrder',
    async ({ request }) => {
      if (getScenario() === 'price-changed') return apiError('CART-006');
      const body = await readJson<{
        sessionId?: string;
        items?: { productId: string; quantity: number }[];
        branchId?: string;
      }>(request);
      if (body?.sessionId === undefined || !Array.isArray(body.items) || body.items.length === 0) {
        return apiError('SYS-400', 'sessionId and at least one item are required');
      }
      // Sessions are not tracked by the mock; orders are placed at Lekki Phase 1.
      const result = db.createOrder(LK, body.items);
      if (!result.ok)
        return apiError('SYS-400', `cart has a ${result.reason.replace('_', ' ')} product`);
      return json(result.order, 201);
    },
    [
      {
        headers: { 'Idempotency-Key': '0193a1f2-0000-7000-8000-0000000000f1' },
        body: {
          sessionId: fixtures.checkIn.sessionId,
          items: [
            {
              productId: fixtures.catalogue.products[0]?.id ?? '',
              quantity: 2,
              expectedUnitPriceKobo: 40000,
            },
          ],
          channel: 'card',
        },
      },
    ],
  ),

  mock(
    'getOrder',
    ({ params }) => {
      const order = db.getOrder(params.orderId ?? '');
      return order === undefined ? apiError('SYS-404', 'unknown order') : json(order);
    },
    [{ params: { orderId: ORDER_ID } }],
  ),

  mock(
    'startPayment',
    ({ params }) => {
      const order = db.getOrder(params.orderId ?? '');
      if (order === undefined) return apiError('SYS-404', 'unknown order');
      if (order.status !== 'created' && order.status !== 'pending' && order.status !== 'failed')
        return apiError('PAY-004');
      db.startPayment(order);
      const ref = `${order.orderNumber}-A1`;
      return json(
        {
          ...fixtures.paymentAttempt,
          attemptId: crypto.randomUUID(),
          reference: ref,
          amountKobo: order.totalKobo,
        },
        201,
      );
    },
    [
      {
        params: { orderId: ORDER_ID },
        body: { channel: 'card' },
        headers: { 'Idempotency-Key': '0193a1f2-0000-7000-8000-0000000000f2' },
      },
    ],
  ),

  mock(
    'nudgeVerify',
    ({ params }) => {
      const order = db.getOrder(params.orderId ?? '');
      return order === undefined ? apiError('SYS-404', 'unknown order') : json(order, 202);
    },
    [{ params: { orderId: ORDER_ID } }],
  ),

  mock(
    'getReceipt',
    ({ params }) => {
      const receipt = db.getReceipt(params.receiptId ?? '');
      return receipt === undefined ? apiError('SYS-404', 'unknown receipt') : json(receipt);
    },
    [{ params: { receiptId: fixtures.receipt.id } }],
  ),

  mock(
    'getMyRefund',
    ({ params }) => {
      if (params.refundId !== fixtures.refund.id) return apiError('SYS-404', 'unknown refund');
      const scenario = getScenario();
      const overrides =
        scenario in REFUND_STATES ? REFUND_STATES[scenario as keyof typeof REFUND_STATES] : {};
      return json({ ...fixtures.refund, ...overrides });
    },
    [{ params: { refundId: fixtures.refund.id } }],
  ),
];
