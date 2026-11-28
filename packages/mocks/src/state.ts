// In-memory state shared by the handlers: orders move pending → paid/failed over (fake-able) time,
// sign-ins last for the tab, and a small bus feeds the SSE stream. `resetState()` gives tests and
// `mocks:validate` a clean start.
import { addKobo, kobo, multiplyKobo } from '@skipa/domain/money';

import { resetIdempotency } from './http.ts';
import { getScenario } from './scenarios.ts';
import { branchById, fixtures, type Surface } from './seed.ts';

type Nullable<T, K extends keyof T> = Omit<T, K> & { [P in K]: string | null };
type Order = Nullable<
  typeof fixtures.orderPending,
  'paidAt' | 'exitValidUntil' | 'receiptId' | 'pendingSince'
> & {
  status: string;
  pendingTooLong: boolean;
};
type Receipt = Omit<typeof fixtures.receipt, 'exit'> & {
  exit: Nullable<typeof fixtures.receipt.exit, 'usedAt'>;
};
type OrderItem = (typeof fixtures.orderPending.items)[number];

export const PAYMENT_SETTLE_MS = 4_000;
export const PENDING_TOO_LONG_MS = 120_000;
const EXIT_WINDOW_MS = 30 * 60_000;

export interface RealtimeMessage {
  id: string;
  channel: string;
  type: string;
  at: string;
  data: Record<string, unknown>;
}

type Listener = (event: RealtimeMessage) => void;

interface State {
  orders: Map<string, Order>;
  receipts: Map<string, Receipt>;
  challenges: Map<string, { surface: Surface; destination: string }>;
  signedIn: Set<Surface>;
  orderSeq: number;
  listeners: Set<Listener>;
  timers: Set<ReturnType<typeof setTimeout>>;
}

const state: State = {
  orders: new Map(),
  receipts: new Map(),
  challenges: new Map(),
  signedIn: new Set(),
  orderSeq: 4815,
  listeners: new Set(),
  timers: new Set(),
};

export function resetState(): void {
  for (const t of state.timers) clearTimeout(t);
  state.timers.clear();
  state.orders = new Map<string, Order>([[fixtures.orderPending.id, { ...fixtures.orderPending }]]);
  state.receipts = new Map<string, Receipt>([
    [fixtures.receipt.id, structuredClone(fixtures.receipt)],
  ]);
  state.challenges.clear();
  state.signedIn.clear();
  state.orderSeq = 4815;
  resetIdempotency();
}
resetState();

// ---------- realtime bus ----------

export function subscribe(listener: Listener): () => void {
  state.listeners.add(listener);
  return () => state.listeners.delete(listener);
}

export function publish(channel: string, type: string, data: Record<string, unknown>): void {
  const event: RealtimeMessage = {
    id: crypto.randomUUID(),
    channel,
    type,
    at: new Date().toISOString(),
    data,
  };
  for (const l of state.listeners) l(event);
}

// ---------- sign-in ----------

export const auth = {
  startChallenge(surface: Surface, destination: string): string {
    const id = crypto.randomUUID();
    state.challenges.set(id, { surface, destination });
    return id;
  },
  challenge: (id: string) => state.challenges.get(id),
  signIn: (surface: Surface) => state.signedIn.add(surface),
  signOut: (surface: Surface) => state.signedIn.delete(surface),
  isSignedIn: (surface: Surface) => state.signedIn.has(surface),
};

// ---------- orders and payments ----------

interface LineInput {
  productId: string;
  quantity: number;
}

export type CreateOrderResult =
  { ok: true; order: Order } | { ok: false; reason: 'unknown_product' | 'not_sellable' };

export function createOrder(sessionBranchId: string, lines: LineInput[]): CreateOrderResult {
  const items: OrderItem[] = [];
  for (const line of lines) {
    const product = fixtures.catalogue.products.find((p) => p.id === line.productId);
    if (product === undefined) return { ok: false, reason: 'unknown_product' };
    if (product.status !== 'available') return { ok: false, reason: 'not_sellable' };
    const category = fixtures.catalogue.categories.find((c) => c.id === product.categoryId);
    const unit = kobo(product.priceKobo);
    items.push({
      id: crypto.randomUUID(),
      name: product.name,
      barcode: product.barcode,
      quantity: line.quantity,
      unitPriceKobo: unit,
      lineTotalKobo: multiplyKobo(unit, line.quantity),
      categoryName: category?.name ?? '',
    });
  }
  const code = branchById(sessionBranchId)?.code ?? 'LK';
  state.orderSeq += 1;
  const order: Order = {
    id: crypto.randomUUID(),
    orderNumber: `SKP-${code}-${String(state.orderSeq).padStart(5, '0')}`,
    status: 'created',
    branchId: sessionBranchId,
    items,
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    totalKobo: addKobo(...items.map((i) => kobo(i.lineTotalKobo))),
    createdAt: new Date().toISOString(),
    paidAt: null,
    exitValidUntil: null,
    receiptId: null,
    pendingSince: null,
    pendingTooLong: false,
  };
  state.orders.set(order.id, order);
  return { ok: true, order };
}

export function getOrder(id: string): Order | undefined {
  const order = state.orders.get(id);
  if (order !== undefined) progress(order);
  return order;
}

/** Paystack popup opened: the order is pending until the (mock) server verifies it. */
export function startPayment(order: Order): void {
  if (order.status === 'created' || order.status === 'failed') {
    order.status = 'pending';
    order.pendingSince = new Date().toISOString();
    order.pendingTooLong = false;
  }
  const timer = setTimeout(() => {
    state.timers.delete(timer);
    progress(order);
  }, PAYMENT_SETTLE_MS);
  state.timers.add(timer);
}

/** Server-side truth for the order, by scenario and elapsed time. Only this ever marks it Paid. */
function progress(order: Order): void {
  if (order.status !== 'pending' || order.pendingSince === null) return;
  const waited = Date.now() - Date.parse(order.pendingSince);
  const scenario = getScenario();
  if (scenario === 'payment-pending-long') {
    order.pendingTooLong = waited >= PENDING_TOO_LONG_MS;
    return;
  }
  if (waited < PAYMENT_SETTLE_MS) return;
  if (scenario === 'payment-failed') {
    order.status = 'failed';
    publish(`order:${order.id}`, 'order.updated', { orderId: order.id, status: order.status });
    return;
  }
  const now = new Date();
  order.status = 'paid';
  order.paidAt = now.toISOString();
  order.exitValidUntil = new Date(now.getTime() + EXIT_WINDOW_MS).toISOString();
  const receipt = issueReceipt(order, now);
  order.receiptId = receipt.id;
  publish(`order:${order.id}`, 'order.updated', { orderId: order.id, status: order.status });
  publish(`order:${order.id}`, 'receipt.issued', { orderId: order.id, receiptId: receipt.id });
}

function issueReceipt(order: Order, at: Date): Receipt {
  const branch = branchById(order.branchId);
  const receipt: Receipt = {
    ...structuredClone(fixtures.receipt),
    id: crypto.randomUUID(),
    receiptNumber: order.orderNumber.replace(/^SKP-/, ''),
    orderId: order.id,
    store: branch?.branch.brand ?? fixtures.receipt.store,
    branchName: branch?.branch.branchName ?? fixtures.receipt.branchName,
    issuedAt: at.toISOString(),
    items: order.items,
    itemCount: order.itemCount,
    totalKobo: order.totalKobo,
    exit: {
      ...fixtures.receipt.exit,
      validUntil: new Date(at.getTime() + EXIT_WINDOW_MS).toISOString(),
    },
  };
  state.receipts.set(receipt.id, receipt);
  return receipt;
}

export function getReceipt(id: string): Receipt | undefined {
  return state.receipts.get(id);
}
