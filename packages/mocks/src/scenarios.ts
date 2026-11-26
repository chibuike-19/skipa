// Mock scenarios (brief §5), switched by `?scenario=<name>` or the dev toolbar. The choice is kept in
// sessionStorage so it survives navigation within the tab.
//
// `milestone` says which frontend milestone builds the screens that use a scenario. A scenario whose
// handlers are not built yet is listed so the toolbar can show it as "not built yet"; selecting it
// changes nothing. Nothing pretends to be done.

export const SCENARIOS = {
  default: {
    milestone: 'F0',
    built: true,
    about: 'Happy path: check-in works, payments confirm after a few seconds',
  },
  'payment-success': {
    milestone: 'F3',
    built: true,
    about: 'Payment confirms about 4 s after Paystack hands back',
  },
  'payment-pending-long': {
    milestone: 'F3',
    built: true,
    about: 'Payment stays pending; after 2 min the order reports pendingTooLong (PAY-007 copy)',
  },
  'payment-failed': {
    milestone: 'F3',
    built: true,
    about: 'Payment fails about 4 s after Paystack hands back',
  },
  'payments-unavailable': {
    milestone: 'F1',
    built: true,
    about: 'Check-in reports payments unavailable (pay at the till, NF-05)',
  },
  'branch-switched-off': {
    milestone: 'F1',
    built: true,
    about: 'Check-in reports the branch switched off (CART-002)',
  },
  'price-changed': {
    milestone: 'F2',
    built: true,
    about: 'Creating the order fails with CART-006 (prices changed)',
  },
  'cart-limit': {
    milestone: 'F2',
    built: false,
    about: 'Cart over ₦150,000 or 30 items (checked on the phone; see README for the contract gap)',
  },
  offline: { milestone: 'F0', built: true, about: 'Every API request fails at the network level' },
  'exit-clear': { milestone: 'F4', built: true, about: 'Exit lookup: clear' },
  'exit-flagged': {
    milestone: 'F4',
    built: true,
    about: 'Exit lookup: flagged items and a large basket',
  },
  'exit-large-basket': {
    milestone: 'F4',
    built: true,
    about: 'Exit lookup: large basket only (weigh)',
  },
  'exit-random': { milestone: 'F4', built: true, about: 'Exit lookup: random full check' },
  'exit-mismatch': {
    milestone: 'F4',
    built: false,
    about: 'Weigh result out of tolerance (needs recordWeight, F4)',
  },
  'exit-invalid-used': {
    milestone: 'F4',
    built: true,
    about: 'Exit lookup: receipt already used (RCPT-002)',
  },
  'exit-invalid-expired': {
    milestone: 'F4',
    built: true,
    about: 'Exit lookup: receipt expired (RCPT-003)',
  },
  'exit-invalid-unpaid': {
    milestone: 'F4',
    built: true,
    about: 'Exit lookup: order not paid (RCPT-004)',
  },
  'exit-invalid-other-branch': {
    milestone: 'F4',
    built: true,
    about: 'Exit lookup: receipt for another branch (RCPT-005)',
  },
  'exit-no-connection': {
    milestone: 'F4',
    built: true,
    about: 'Exit lookups and heartbeats fail at the network level (EXIT-004)',
  },
  'refund-requested': { milestone: 'F3', built: true, about: 'Refund status: requested' },
  'refund-awaiting-head-office': {
    milestone: 'F3',
    built: true,
    about: 'Refund status: waiting for head office',
  },
  'refund-approved': {
    milestone: 'F3',
    built: true,
    about: 'Refund status: approved, store to pay',
  },
  'refund-declined': {
    milestone: 'F3',
    built: true,
    about: 'Refund status: declined with a reason',
  },
  'refund-paid': {
    milestone: 'F3',
    built: true,
    about: 'Refund status: paid by the store (recorded)',
  },
  'ticket-replied': {
    milestone: 'F3',
    built: false,
    about: 'Support ticket with a store reply (support handlers, F3)',
  },
  'empty-states': {
    milestone: 'F1',
    built: false,
    about: 'Every list empty (list handlers arrive with their screens)',
  },
  'server-error': {
    milestone: 'F0',
    built: true,
    about: 'Every API request returns SYS-500 with a reference',
  },
} as const satisfies Record<string, { milestone: string; built: boolean; about: string }>;

export type Scenario = keyof typeof SCENARIOS;

const STORAGE_KEY = 'skipa:mock-scenario';
let current: Scenario = 'default';

export function isScenario(value: unknown): value is Scenario {
  return typeof value === 'string' && Object.hasOwn(SCENARIOS, value);
}

export function getScenario(): Scenario {
  return current;
}

// sessionStorage is missing in Node and can throw in private mode; the in-memory value still applies.
const hasStorage = (): boolean => typeof sessionStorage !== 'undefined';

export function setScenario(scenario: Scenario): void {
  current = scenario;
  if (!hasStorage()) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, scenario);
  } catch {
    // ignore: see hasStorage
  }
}

/** Browser start-up: `?scenario=` wins, then the tab's last choice, then `default`. */
export function scenarioFromLocation(search: string, stored: string | null): Scenario {
  const fromUrl = new URLSearchParams(search).get('scenario');
  if (isScenario(fromUrl)) return fromUrl;
  if (isScenario(stored)) return stored;
  return 'default';
}

export function initScenarioFromBrowser(): Scenario {
  let stored: string | null;
  try {
    stored = hasStorage() ? sessionStorage.getItem(STORAGE_KEY) : null;
  } catch {
    stored = null;
  }
  const search = typeof location === 'undefined' ? '' : location.search;
  const scenario = scenarioFromLocation(search, stored);
  setScenario(scenario);
  return scenario;
}
