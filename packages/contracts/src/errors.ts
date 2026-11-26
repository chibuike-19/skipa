// Error code catalogue (AD §10.3, PRD 14.2). Owned by the backend agent; the frontend maps every
// code to its message (brief §18). Codes are stable: never reuse or renumber one.
//
//   severity     drives alerting (AD §10.5). 'warning' escalates to critical on a spike; 'store'
//                means a store alert (dashboard + email), not a platform page.
//   http         status when the code is returned as an API error; null = never an HTTP error
//                (raised in jobs, logs and alerts only). Throwing one in a route is a bug → 500.
//   userMessage  plain-English text safe to show (ER-07). {placeholders} are filled from params.
//                null = nobody outside the Skipa team ever sees it; the generic SYS-500 text is
//                used if it ever reaches a response.

export type Severity = 'low' | 'medium' | 'high' | 'critical' | 'warning' | 'store';

export interface ErrorDefinition {
  readonly meaning: string;
  readonly severity: Severity;
  readonly http: number | null;
  readonly userMessage: string | null;
}

const define = <const T extends Record<string, ErrorDefinition>>(catalogue: T) => catalogue;

export const ERRORS = define({
  // Auth
  'AUTH-001': {
    meaning: 'Session expired',
    severity: 'low',
    http: 401,
    userMessage: 'Please sign in again.',
  },
  'AUTH-002': {
    meaning: 'Wrong code',
    severity: 'low',
    http: 400,
    userMessage: "That code isn't right. Check and try again.",
  },
  'AUTH-003': {
    meaning: 'Code expired',
    severity: 'low',
    http: 400,
    userMessage: 'That code has expired. Send a new one.',
  },
  'AUTH-004': {
    meaning: 'Too many attempts (15-min lock)',
    severity: 'medium',
    http: 429,
    userMessage: 'Too many tries. Wait 15 minutes and try again.',
  },
  'AUTH-005': {
    meaning: 'No access to this branch/organisation',
    severity: 'low',
    http: 403,
    userMessage: "You don't have access to this branch.",
  },
  'AUTH-006': {
    meaning: 'Account suspended',
    severity: 'low',
    http: 403,
    userMessage: 'Your account is paused. Contact your head office.',
  },
  'AUTH-007': {
    meaning: 'Invite expired or already used',
    severity: 'low',
    http: 400,
    userMessage: 'This invite has expired. Ask for a new one.',
  },
  'AUTH-008': {
    meaning: 'Read-only view (view as store)',
    severity: 'low',
    http: 403,
    userMessage: 'Buttons are switched off in store view.',
  },
  'AUTH-009': {
    meaning: 'Second step required or failed',
    severity: 'medium',
    http: 401,
    userMessage: 'Enter the code from your authenticator app.',
  },
  'AUTH-010': {
    meaning: 'Second super admin blocked while second step is off',
    severity: 'high',
    http: 409,
    userMessage: 'Turn on the second sign-in step first.',
  },

  // Scanning (SCAN-001 camera is raised by the frontend only)
  'SCAN-002': {
    meaning: 'Barcode not in catalogue',
    severity: 'low',
    http: 422,
    userMessage: "We can't find this item. Pay for it at a till.",
  },
  'SCAN-003': {
    meaning: 'Not sold through Skipa (category off / till-only)',
    severity: 'low',
    http: 422,
    userMessage: "This item isn't sold through Skipa here. Pay for it at a till.",
  },
  'SCAN-004': {
    meaning: 'Price being updated (stale)',
    severity: 'low',
    http: 422,
    userMessage: 'This price is being updated. Pay for it at a till.',
  },
  'SCAN-005': {
    meaning: 'Catalogue download failed',
    severity: 'medium',
    http: 503,
    userMessage: "We couldn't load the products. Check your data and try again.",
  },
  'SCAN-006': {
    meaning: 'Store search failed',
    severity: 'medium',
    http: 503,
    userMessage: "Search isn't working right now. Try again.",
  },

  // Cart
  'CART-001': {
    meaning: 'Session ended or timed out',
    severity: 'low',
    http: 409,
    userMessage: 'Your session timed out.',
  },
  'CART-002': {
    meaning: 'Branch switched off',
    severity: 'low',
    http: 409,
    userMessage: 'Skipa is off at this branch. Please pay at the tills.',
  },
  'CART-004': {
    meaning: 'Cart limit exceeded (₦150,000 or 30 items)',
    severity: 'low',
    http: 422,
    userMessage: 'Your cart is over ₦150,000. Pay for the rest at a till.',
  },
  'CART-006': {
    meaning: 'Prices changed at checkout',
    severity: 'low',
    http: 409,
    userMessage: 'Some prices changed. Check your cart before paying.',
  },

  // Payments
  'PAY-001': {
    meaning: 'Payments unavailable (breaker open)',
    severity: 'critical',
    http: 503,
    userMessage: "We can't confirm payments right now. Please pay at the till.",
  },
  'PAY-002': {
    meaning: 'Paystack initialise failed',
    severity: 'high',
    http: 502,
    userMessage: "We couldn't start the payment. Try again.",
  },
  'PAY-003': {
    meaning: 'Channel switched off',
    severity: 'low',
    http: 422,
    userMessage: "This payment method isn't available here.",
  },
  'PAY-004': {
    meaning: 'Order not payable (already paid/failed state)',
    severity: 'low',
    http: 409,
    userMessage: 'This order is already paid.',
  },
  'PAY-005': {
    meaning: 'Payment declined',
    severity: 'low',
    http: 422,
    userMessage: '{reason} Try again or choose another way.',
  },
  'PAY-006': {
    meaning: 'Payment abandoned/expired',
    severity: 'low',
    http: 422,
    userMessage: "The payment wasn't completed. Nothing was charged.",
  },
  'PAY-007': {
    meaning: 'Verification timed out (> 2 min pending)',
    severity: 'warning',
    http: 504,
    userMessage: "We couldn't confirm your payment yet. Don't pay again; we're still checking.",
  },
  'PAY-008': {
    meaning: 'Webhook processing failed',
    severity: 'high',
    http: null,
    userMessage: null,
  },
  'PAY-009': {
    meaning: 'Webhook signature invalid',
    severity: 'high',
    http: 401,
    userMessage: null,
  },
  'PAY-010': {
    meaning: 'Amount/currency/subaccount mismatch',
    severity: 'critical',
    http: null,
    userMessage: null,
  },
  'PAY-011': {
    meaning: 'Duplicate/stray charge detected',
    severity: 'high',
    http: null,
    userMessage: null,
  },
  'PAY-012': {
    meaning: 'Dispute evidence not submitted in time',
    severity: 'critical',
    http: null,
    userMessage: null,
  },
  'PAY-020': {
    meaning: 'Refund already exists for order',
    severity: 'low',
    http: 409,
    userMessage: 'A refund was already requested.',
  },
  'PAY-021': {
    meaning: 'Refund needs head office',
    severity: 'low',
    http: 403,
    userMessage: 'Waiting for head office.',
  },
  'PAY-022': {
    meaning: 'Approved refund not recorded within 24 h',
    severity: 'medium',
    http: null,
    userMessage: 'Record the refund payment.',
  },
  'PAY-023': {
    meaning: 'Bank transfer reference missing',
    severity: 'low',
    http: 400,
    userMessage: 'Add the transfer reference.',
  },

  // Receipts (exit lookups report these as an invalid decision, not as HTTP errors)
  'RCPT-001': {
    meaning: 'Receipt not found',
    severity: 'low',
    http: 404,
    userMessage: 'Receipt not found.',
  },
  'RCPT-002': {
    meaning: 'Already used for exit',
    severity: 'low',
    http: 409,
    userMessage: 'Already used for exit at {time}.',
  },
  'RCPT-003': {
    meaning: 'Expired',
    severity: 'low',
    http: 409,
    userMessage: 'This receipt expired at {time}.',
  },
  'RCPT-004': {
    meaning: 'Not paid',
    severity: 'low',
    http: 409,
    userMessage: "This order isn't paid.",
  },
  'RCPT-005': {
    meaning: 'Other branch',
    severity: 'low',
    http: 409,
    userMessage: 'This receipt is for {branchName}.',
  },
  'RCPT-006': {
    meaning: 'Refunded',
    severity: 'low',
    http: 409,
    userMessage: 'This order was refunded.',
  },

  // Exit (EXIT-005 retired by D-16)
  'EXIT-001': {
    meaning: 'Lookup failed (server)',
    severity: 'high',
    http: 500,
    userMessage: "Couldn't check the receipt. Try again.",
  },
  'EXIT-002': {
    meaning: 'Token signature invalid',
    severity: 'medium',
    http: 400,
    userMessage: "This code isn't a Skipa receipt.",
  },
  'EXIT-003': { meaning: 'Check not found/closed', severity: 'low', http: 404, userMessage: null },
  'EXIT-004': {
    meaning: 'No connection, checks paused',
    severity: 'store',
    http: null,
    userMessage: 'No connection. Checks are paused.',
  },
  'EXIT-006': {
    meaning: 'Mismatch recorded',
    severity: 'store',
    http: null,
    userMessage: 'Send the shopper to a till. Manager alerted.',
  },
  'EXIT-007': {
    meaning: 'Flagged items not all ticked',
    severity: 'low',
    http: 422,
    userMessage: 'Tick every flagged item first.',
  },

  // POS
  'POS-001': { meaning: 'Connection test failed', severity: 'high', http: 502, userMessage: null },
  'POS-002': { meaning: 'Catalogue pull failed', severity: 'high', http: null, userMessage: null },
  'POS-003': { meaning: 'Push signature invalid', severity: 'high', http: 401, userMessage: null },
  'POS-004': { meaning: 'Product file rejected', severity: 'medium', http: 422, userMessage: null },
  'POS-010': {
    meaning: 'Sale posting rejected',
    severity: 'high',
    http: null,
    userMessage: 'Retry',
  },
  'POS-011': {
    meaning: 'Refund/chargeback posting rejected',
    severity: 'high',
    http: null,
    userMessage: 'Retry',
  },
  'POS-012': {
    meaning: 'Posting dead after 24 h',
    severity: 'high',
    http: null,
    userMessage: null,
  },

  // Reconciliation
  'RECON-001': {
    meaning: 'Settlement fetch failed',
    severity: 'high',
    http: null,
    userMessage: null,
  },
  'RECON-002': { meaning: 'POS sale missing', severity: 'high', http: null, userMessage: null },
  'RECON-003': {
    meaning: 'Payout does not match receipts (incl. fee split)',
    severity: 'high',
    http: null,
    userMessage: null,
  },
  'RECON-004': {
    meaning: 'Refund not recorded/posted',
    severity: 'medium',
    http: null,
    userMessage: null,
  },
  'RECON-005': {
    meaning: 'Billing fee mismatch vs Paystack split',
    severity: 'high',
    http: null,
    userMessage: null,
  },

  // Notifications
  'NOTIF-002': {
    meaning: 'SMS delivery failed',
    severity: 'medium',
    http: 502,
    userMessage: "We couldn't send the code. Try again.",
  },
  'NOTIF-003': { meaning: 'SMS failover used', severity: 'low', http: null, userMessage: null },
  'NOTIF-004': {
    meaning: 'Email held by daily quota',
    severity: 'medium',
    http: null,
    userMessage: null,
  },
  'NOTIF-005': {
    meaning: 'Email delivery failed / bounced',
    severity: 'medium',
    http: null,
    userMessage: "We couldn't email your receipt. It's still here.",
  },
  'NOTIF-006': {
    meaning: 'Telegram send failed (email fallback used)',
    severity: 'high',
    http: null,
    userMessage: null,
  },

  // Support
  'SUPP-001': {
    meaning: 'Ticket creation failed',
    severity: 'high',
    http: 500,
    userMessage: "Your message didn't send. Try again.",
  },
  'SUPP-003': {
    meaning: 'Support message did not reach the store inbox',
    severity: 'high',
    http: null,
    userMessage: null,
  },
  'SUPP-004': { meaning: 'First reply overdue', severity: 'store', http: null, userMessage: null },

  // System. SYS-400/404/500 messages are the contract's; the other generic texts are draft copy
  // pending the frontend agent's review.
  'SYS-001': {
    meaning: 'Database connection lost',
    severity: 'critical',
    http: 503,
    userMessage: 'Something went wrong on our side.',
  },
  'SYS-002': { meaning: 'Queue backlog', severity: 'high', http: null, userMessage: null },
  'SYS-003': {
    meaning: 'Dependency timeout',
    severity: 'high',
    http: 504,
    userMessage: 'This is taking too long. Try again.',
  },
  'SYS-400': {
    meaning: 'Validation failed',
    severity: 'low',
    http: 400,
    userMessage: "Something in that request wasn't right.",
  },
  'SYS-404': {
    meaning: 'Not found',
    severity: 'low',
    http: 404,
    userMessage: "We couldn't find that.",
  },
  'SYS-409': {
    meaning: 'Idempotency key reused with a different body',
    severity: 'low',
    http: 409,
    userMessage: 'That request was already sent with different details. Start again.',
  },
  'SYS-410': {
    meaning: 'Same request still in progress',
    severity: 'low',
    http: 409,
    userMessage: "We're still working on that. Wait a moment, then check again.",
  },
  'SYS-426': {
    meaning: 'Client version too old',
    severity: 'low',
    http: 426,
    userMessage: 'Please update Skipa to continue.',
  },
  'SYS-429': {
    meaning: 'Rate limited',
    severity: 'low',
    http: 429,
    userMessage: 'Too many requests. Wait a moment and try again.',
  },
  'SYS-500': {
    meaning: 'Unexpected error',
    severity: 'high',
    http: 500,
    userMessage: 'Something went wrong on our side.',
  },
});

export type ErrorCode = keyof typeof ERRORS;

export const ERROR_CODE_PATTERN = /^[A-Z]{3,6}-[0-9]{3}$/;

export function isErrorCode(value: string): value is ErrorCode {
  return Object.hasOwn(ERRORS, value);
}

/** Fill {placeholders}; unknown placeholders are left as-is so a missing param is visible in tests. */
export function renderUserMessage(
  code: ErrorCode,
  params: Readonly<Record<string, string>> = {},
): string {
  const template = ERRORS[code].userMessage ?? ERRORS['SYS-500'].userMessage;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => params[key] ?? whole);
}
