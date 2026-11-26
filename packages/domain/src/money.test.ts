import { describe, expect, it } from 'vitest';

import {
  addKobo,
  applyBps,
  compareKobo,
  formatNaira,
  kobo,
  koboFromDb,
  MoneyError,
  multiplyKobo,
  negateKobo,
  nonNegativeKobo,
  parseNaira,
  subtractKobo,
  ZERO_KOBO,
} from './money.ts';

describe('kobo()', () => {
  it('accepts safe integers, including negatives for signed ledgers', () => {
    expect(kobo(3_130_000)).toBe(3_130_000);
    expect(kobo(-500)).toBe(-500);
    expect(Object.is(kobo(-0), 0)).toBe(true);
  });

  it.each([0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects %s',
    (value) => {
      expect(() => kobo(value)).toThrow(MoneyError);
    },
  );

  it('nonNegativeKobo rejects negatives', () => {
    expect(nonNegativeKobo(0)).toBe(0);
    expect(() => nonNegativeKobo(-1)).toThrow(MoneyError);
  });
});

describe('koboFromDb()', () => {
  it('reads int8 strings, numbers and bigints exactly', () => {
    expect(koboFromDb('15000000')).toBe(15_000_000);
    expect(koboFromDb('-250')).toBe(-250);
    expect(koboFromDb(42)).toBe(42);
    expect(koboFromDb(9_007_199_254_740_991n)).toBe(Number.MAX_SAFE_INTEGER);
  });

  it.each(['1.5', '', 'abc', '1e3', '9007199254740992'])('rejects %j', (value) => {
    expect(() => koboFromDb(value)).toThrow(MoneyError);
  });

  it('rejects bigints below the safe range', () => {
    expect(() => koboFromDb(-9_007_199_254_740_992n)).toThrow(MoneyError);
  });
});

describe('arithmetic', () => {
  it('adds, subtracts, multiplies, negates and compares', () => {
    expect(addKobo()).toBe(ZERO_KOBO);
    expect(addKobo(kobo(100), kobo(250), kobo(-50))).toBe(300);
    expect(subtractKobo(kobo(1_000), kobo(1_250))).toBe(-250);
    expect(multiplyKobo(kobo(31_300), 3)).toBe(93_900);
    expect(negateKobo(kobo(700))).toBe(-700);
    expect([
      compareKobo(kobo(1), kobo(2)),
      compareKobo(kobo(2), kobo(2)),
      compareKobo(kobo(3), kobo(2)),
    ]).toEqual([-1, 0, 1]);
  });

  it('multiplyKobo rejects fractional quantities', () => {
    expect(() => multiplyKobo(kobo(100), 1.5)).toThrow(MoneyError);
  });

  it('refuses results that leave the safe integer range', () => {
    expect(() => addKobo(kobo(Number.MAX_SAFE_INTEGER), kobo(1))).toThrow(MoneyError);
    expect(() => multiplyKobo(kobo(Number.MAX_SAFE_INTEGER), 2)).toThrow(MoneyError);
  });
});

describe('applyBps() — fee rounding half-up to the kobo', () => {
  it('matches the AD fee examples', () => {
    // 2% platform fee on ₦31,300 = ₦626.
    expect(applyBps(kobo(3_130_000), 200)).toBe(62_600);
    // Pilot stores: 0%.
    expect(applyBps(kobo(3_130_000), 0)).toBe(0);
  });

  it('rounds exactly half up and everything below half down', () => {
    expect(applyBps(kobo(25), 200)).toBe(1); // 0.5 → 1
    expect(applyBps(kobo(24), 200)).toBe(0); // 0.48 → 0
    expect(applyBps(kobo(75), 200)).toBe(2); // 1.5 → 2
    expect(applyBps(kobo(1), 5_000)).toBe(1); // 0.5 → 1
  });

  it('agrees with exact rational rounding on 10,000 random cases', () => {
    let seed = 20_261_126;
    const random = () => {
      seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
      return seed;
    };
    for (let i = 0; i < 10_000; i++) {
      const amount = random() % 100_000_000;
      const bps = random() % 2_001;
      const exactNumerator = BigInt(amount) * BigInt(bps);
      const floor = exactNumerator / 10_000n;
      const remainder = exactNumerator % 10_000n;
      const expected = remainder >= 5_000n ? floor + 1n : floor;
      expect(applyBps(kobo(amount), bps)).toBe(Number(expected));
    }
  });

  it('stays exact for very large amounts', () => {
    expect(applyBps(kobo(Number.MAX_SAFE_INTEGER), 1)).toBe(900_719_925_474);
  });

  it.each([
    [-1, 200],
    [100, -1],
    [100, 1.5],
  ])('rejects amount %s at %s bps', (amount, bps) => {
    expect(() => applyBps(kobo(amount), bps)).toThrow(MoneyError);
  });
});

describe('formatNaira()', () => {
  it.each([
    [0, '₦0'],
    [100, '₦1'],
    [3_130_000, '₦31,300'],
    [3_130_050, '₦31,300.50'],
    [5, '₦0.05'],
    [15_000_000, '₦150,000'],
    [100_000_000_000, '₦1,000,000,000'],
    [-50_000, '-₦500'],
    [-1, '-₦0.01'],
  ])('%i kobo → %s', (amount, text) => {
    expect(formatNaira(kobo(amount))).toBe(text);
  });
});

describe('parseNaira()', () => {
  it.each([
    ['31,300', 3_130_000],
    ['31300', 3_130_000],
    ['₦31,300.5', 3_130_050],
    ['₦ 1,250.75', 125_075],
    ['0.05', 5],
    ['  20000 ', 2_000_000],
  ])('%j → %i kobo', (text, amount) => {
    expect(parseNaira(text)).toBe(amount);
  });

  it.each(['', '₦', '1,00', '12,3456', '1.234', '-5', '1e3', '0.1.2', 'abc'])(
    'rejects %j',
    (text) => {
      expect(() => parseNaira(text)).toThrow(MoneyError);
    },
  );

  it('round-trips with formatNaira for non-negative amounts', () => {
    for (const amount of [0, 1, 99, 100, 101, 3_130_050, 15_000_000, 987_654_321]) {
      expect(parseNaira(formatNaira(kobo(amount)))).toBe(amount);
    }
  });
});
