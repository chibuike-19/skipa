import { describe, expect, it } from 'vitest';

import {
  addMinutes,
  addWatDays,
  BUSINESS_TZ,
  formatWatDate,
  formatWatTime,
  MAX_RANGE_DAYS,
  parseWatDate,
  startOfWatDay,
  TimeError,
  watDate,
  watDayRange,
} from './time.ts';

describe('WAT business dates', () => {
  it('uses Africa/Lagos', () => {
    expect(BUSINESS_TZ).toBe('Africa/Lagos');
  });

  it('puts 23:30 UTC on the next WAT day (UTC+1)', () => {
    expect(watDate(new Date('2026-11-25T22:59:59Z'))).toBe('2026-11-25');
    expect(watDate(new Date('2026-11-25T23:00:00Z'))).toBe('2026-11-26');
    expect(watDate(new Date('2026-12-31T23:30:00Z'))).toBe('2027-01-01');
  });

  it('starts a WAT day at 23:00 UTC the evening before', () => {
    expect(startOfWatDay(parseWatDate('2026-11-26')).toISOString()).toBe(
      '2026-11-25T23:00:00.000Z',
    );
    expect(startOfWatDay(parseWatDate('2027-01-01')).toISOString()).toBe(
      '2026-12-31T23:00:00.000Z',
    );
  });

  it('round-trips: the start of a WAT day is on that day', () => {
    for (const d of ['2026-01-01', '2026-06-30', '2028-02-29']) {
      expect(watDate(startOfWatDay(parseWatDate(d)))).toBe(d);
    }
  });

  it('adds days across month, year and leap boundaries', () => {
    expect(addWatDays(parseWatDate('2026-11-30'), 1)).toBe('2026-12-01');
    expect(addWatDays(parseWatDate('2027-01-01'), -1)).toBe('2026-12-31');
    expect(addWatDays(parseWatDate('2028-02-28'), 1)).toBe('2028-02-29');
    expect(() => addWatDays(parseWatDate('2026-01-01'), 0.5)).toThrow(TimeError);
  });

  it.each(['2026-02-30', '2026-13-01', '26-11-25', '2026-11-25T00:00', ''])(
    'rejects %j',
    (text) => {
      expect(() => parseWatDate(text)).toThrow(TimeError);
    },
  );

  it('rejects invalid instants', () => {
    expect(() => watDate(new Date('nope'))).toThrow(TimeError);
    expect(() => formatWatTime(new Date('nope'))).toThrow(TimeError);
    expect(() => formatWatDate(new Date('nope'))).toThrow(TimeError);
    expect(() => addMinutes(new Date('nope'), 1)).toThrow(TimeError);
  });
});

describe('watDayRange()', () => {
  it('covers whole WAT days, end exclusive', () => {
    const range = watDayRange(parseWatDate('2026-11-01'), parseWatDate('2026-11-30'));
    expect(range.start.toISOString()).toBe('2026-10-31T23:00:00.000Z');
    expect(range.endExclusive.toISOString()).toBe('2026-11-30T23:00:00.000Z');
  });

  it('allows one day and up to 366 days', () => {
    expect(() => watDayRange(parseWatDate('2026-11-26'), parseWatDate('2026-11-26'))).not.toThrow();
    const from = parseWatDate('2027-01-01');
    expect(() => watDayRange(from, addWatDays(from, MAX_RANGE_DAYS - 1))).not.toThrow();
    expect(() => watDayRange(from, addWatDays(from, MAX_RANGE_DAYS))).toThrow(TimeError);
  });

  it('rejects reversed ranges', () => {
    expect(() => watDayRange(parseWatDate('2026-11-26'), parseWatDate('2026-11-25'))).toThrow(
      TimeError,
    );
  });
});

describe('formatting in WAT', () => {
  it('shows clock times and dates in WAT', () => {
    expect(formatWatTime(new Date('2026-11-25T13:39:00Z'))).toBe('14:39');
    expect(formatWatDate(new Date('2026-11-25T23:30:00Z'))).toBe('26 Nov 2026');
  });

  it('adds minutes (e.g. the 30-minute exit window)', () => {
    expect(addMinutes(new Date('2026-11-25T13:35:00Z'), 30).toISOString()).toBe(
      '2026-11-25T14:05:00.000Z',
    );
  });
});
