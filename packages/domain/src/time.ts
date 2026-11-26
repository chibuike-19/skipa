// Time rules (AD §5.4, brief §13): store UTC instants; business days, reports, daily caps and
// schedules use West Africa Time. Lagos is UTC+1 all year (no daylight saving), but conversions
// still go through Intl with the IANA zone so nothing depends on that fact silently.

export const BUSINESS_TZ = 'Africa/Lagos';

/** A calendar date in WAT, 'YYYY-MM-DD'. */
export type WatDate = string & { readonly __watDate: true };

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;
/** Largest date range a list or report accepts (AD §6.2: date ranges max 366 days). */
export const MAX_RANGE_DAYS = 366;

export class TimeError extends RangeError {
  override name = 'TimeError';
}

function assertValidInstant(instant: Date) {
  if (Number.isNaN(instant.getTime())) throw new TimeError('invalid date');
}

const partsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function watParts(
  instant: Date,
): Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', string> {
  assertValidInstant(instant);
  const out = { year: '', month: '', day: '', hour: '', minute: '', second: '' };
  for (const part of partsFormatter.formatToParts(instant)) {
    if (part.type in out) out[part.type as keyof typeof out] = part.value;
  }
  return out;
}

/** The WAT business date an instant falls on (e.g. star award_date_wat, reconciliation day). */
export function watDate(instant: Date): WatDate {
  const p = watParts(instant);
  return `${p.year}-${p.month}-${p.day}` as WatDate;
}

/** Validate 'YYYY-MM-DD' (a real calendar date) and brand it. */
export function parseWatDate(text: string): WatDate {
  const match = ISO_DATE.exec(text);
  if (!match) throw new TimeError(`not a YYYY-MM-DD date: ${JSON.stringify(text)}`);
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) {
    throw new TimeError(`not a calendar date: ${text}`);
  }
  return text as WatDate;
}

/** Offset of WAT from UTC at an instant, in minutes (60 for Lagos). */
function watOffsetMinutes(instant: Date): number {
  const p = watParts(instant);
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - Math.floor(instant.getTime() / 1000) * 1000) / 60_000);
}

/** The UTC instant at which a WAT calendar day starts (00:00 WAT). */
export function startOfWatDay(date: WatDate): Date {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const midnightAsUtc = Date.UTC(y, m - 1, d);
  // First guess with the offset at that moment, then correct once (handles any zone).
  const guess = new Date(midnightAsUtc - watOffsetMinutes(new Date(midnightAsUtc)) * 60_000);
  return new Date(midnightAsUtc - watOffsetMinutes(guess) * 60_000);
}

export function addWatDays(date: WatDate, days: number): WatDate {
  if (!Number.isSafeInteger(days)) throw new TimeError('days must be an integer');
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d) + days * MS_PER_DAY).toISOString().slice(0, 10) as WatDate;
}

/**
 * A query range for `from`..`to` inclusive WAT dates, as UTC instants [start, endExclusive).
 * Rejects reversed ranges and ranges longer than 366 days.
 */
export function watDayRange(from: WatDate, to: WatDate): { start: Date; endExclusive: Date } {
  if (to < from) throw new TimeError(`range ends before it starts: ${from}..${to}`);
  const days = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / MS_PER_DAY + 1;
  if (days > MAX_RANGE_DAYS)
    throw new TimeError(`range is ${days} days; the limit is ${MAX_RANGE_DAYS}`);
  return { start: startOfWatDay(from), endExclusive: startOfWatDay(addWatDays(to, 1)) };
}

const clockFormatter = new Intl.DateTimeFormat('en-NG', {
  timeZone: BUSINESS_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const dateFormatter = new Intl.DateTimeFormat('en-NG', {
  timeZone: BUSINESS_TZ,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** "14:39" in WAT (e.g. "Already used for exit at 14:39", RCPT-002). */
export function formatWatTime(instant: Date): string {
  assertValidInstant(instant);
  return clockFormatter.format(instant);
}

/** "25 Nov 2026" in WAT. */
export function formatWatDate(instant: Date): string {
  assertValidInstant(instant);
  return dateFormatter.format(instant);
}

export function addMinutes(instant: Date, minutes: number): Date {
  assertValidInstant(instant);
  return new Date(instant.getTime() + minutes * 60_000);
}
