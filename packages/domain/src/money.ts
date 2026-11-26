// Money is integer kobo everywhere (PY-05, DM-01, brief §2). This module is the only place that
// does arithmetic on money; nothing else adds, multiplies or rounds amounts.
//
// `Kobo` is a branded number: a plain `number` cannot be passed where `Kobo` is expected, so every
// amount enters through `kobo()`, `koboFromDb()` or `parseNaira()`, which reject anything that is
// not a safe integer.

declare const koboBrand: unique symbol;
export type Kobo = number & { readonly [koboBrand]: true };

export const KOBO_PER_NAIRA = 100;
/** Basis points in one whole (100% = 10,000 bps). */
export const BPS_PER_WHOLE = 10_000;

export class MoneyError extends RangeError {
  override name = 'MoneyError';
}

/** Wrap an integer amount in kobo. Throws on fractions, NaN, Infinity or unsafe integers. */
export function kobo(amount: number): Kobo {
  if (!Number.isSafeInteger(amount)) {
    throw new MoneyError(`kobo amount must be a safe integer, got ${String(amount)}`);
  }
  // Normalise -0 so formatting and equality never see it.
  return (amount === 0 ? 0 : amount) as Kobo;
}

export const ZERO_KOBO = kobo(0);

/** Like `kobo()`, but also rejects negative amounts (prices, totals, fees). */
export function nonNegativeKobo(amount: number): Kobo {
  const value = kobo(amount);
  if (value < 0) throw new MoneyError(`amount must not be negative, got ${String(amount)}`);
  return value;
}

/**
 * Read a `bigint` money column. node-postgres returns int8 as a string by default; Drizzle's
 * `mode: "number"` returns a number. Both are checked to be exact safe integers.
 */
export function koboFromDb(value: string | number | bigint): Kobo {
  if (typeof value === 'number') return kobo(value);
  const text = typeof value === 'bigint' ? value.toString() : value;
  if (!/^-?\d+$/.test(text))
    throw new MoneyError(`not an integer kobo value: ${JSON.stringify(text)}`);
  const big = BigInt(text);
  if (big > BigInt(Number.MAX_SAFE_INTEGER) || big < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new MoneyError(`kobo value out of safe range: ${text}`);
  }
  return kobo(Number(big));
}

export function addKobo(...amounts: readonly Kobo[]): Kobo {
  return amounts.reduce<Kobo>((total, amount) => kobo(total + amount), ZERO_KOBO);
}

export function subtractKobo(from: Kobo, amount: Kobo): Kobo {
  return kobo(from - amount);
}

/** Price × quantity (order lines, DM-02: line_total = unit × qty). */
export function multiplyKobo(unit: Kobo, quantity: number): Kobo {
  if (!Number.isSafeInteger(quantity)) {
    throw new MoneyError(`quantity must be an integer, got ${String(quantity)}`);
  }
  return kobo(unit * quantity);
}

export function negateKobo(amount: Kobo): Kobo {
  return kobo(0 - amount);
}

export function compareKobo(a: Kobo, b: Kobo): -1 | 0 | 1 {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * `amount × bps / 10,000`, rounded half-up to the kobo (brief §2: fees rounded half-up).
 * Defined for non-negative amounts and rates only: fees and charges are never negative. Uses
 * BigInt internally so large amounts cannot lose precision in the intermediate product.
 */
export function applyBps(amount: Kobo, bps: number): Kobo {
  if (amount < 0) throw new MoneyError('applyBps is only defined for non-negative amounts');
  if (!Number.isSafeInteger(bps) || bps < 0) {
    throw new MoneyError(`basis points must be a non-negative integer, got ${String(bps)}`);
  }
  const whole = BigInt(BPS_PER_WHOLE);
  const scaled = BigInt(amount) * BigInt(bps);
  const rounded = (scaled * 2n + whole) / (whole * 2n); // floor(x + 0.5) for x ≥ 0
  return koboFromDb(rounded);
}

const NAIRA_INPUT = /^(?<naira>\d{1,3}(?:,\d{3})*|\d+)(?:\.(?<kobo>\d{1,2}))?$/;

/**
 * Parse an amount a person typed in naira ("31,300", "31300.5", "₦1,250.75") into kobo, without
 * floating point. Commas must be in thousands positions; at most two decimal places.
 */
export function parseNaira(input: string): Kobo {
  const text = input.trim().replace(/^₦\s*/, '');
  const match = NAIRA_INPUT.exec(text);
  const groups = match?.groups;
  if (groups?.naira === undefined)
    throw new MoneyError(`not a naira amount: ${JSON.stringify(input)}`);
  const naira = BigInt(groups.naira.replaceAll(',', ''));
  const koboPart = BigInt((groups.kobo ?? '0').padEnd(2, '0'));
  return koboFromDb(naira * BigInt(KOBO_PER_NAIRA) + koboPart);
}

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Display an amount: "₦31,300", or "₦31,300.50" when there are kobo (DM-01: kobo shown only
 * when non-zero). Negative amounts get a leading minus: "-₦500".
 */
export function formatNaira(amount: Kobo): string {
  const negative = amount < 0;
  const absolute = Math.abs(amount);
  const naira = Math.trunc(absolute / KOBO_PER_NAIRA);
  const remainder = absolute % KOBO_PER_NAIRA;
  const text =
    remainder === 0
      ? `₦${groupThousands(String(naira))}`
      : `₦${groupThousands(String(naira))}.${String(remainder).padStart(2, '0')}`;
  return negative ? `-${text}` : text;
}
