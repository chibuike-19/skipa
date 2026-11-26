import { describe, expect, it } from 'vitest';

import {
  branchPriceKobo,
  ean13CheckDigit,
  generateCatalogue,
  isValidEan13,
  MAX_PRICE_KOBO,
  MIN_PRICE_KOBO,
  STANDARD_CATEGORIES,
} from './catalogue-data.ts';
import { seedId } from './seed.ts';

describe('generated catalogue (brief §9)', () => {
  const catalogue = generateCatalogue('0001');

  it('has about 1,300 products across every standard category', () => {
    expect(catalogue).toHaveLength(1_300);
    const categories = new Set(catalogue.map((p) => p.category));
    expect(categories).toEqual(new Set(STANDARD_CATEGORIES.map((c) => c.key)));
  });

  it('uses valid, unique EAN-13 barcodes on the Nigerian GS1 prefix', () => {
    const barcodes = catalogue.flatMap((p) => (p.barcode === null ? [] : [p.barcode]));
    expect(barcodes.every(isValidEan13)).toBe(true);
    expect(barcodes.every((b) => b.startsWith('615'))).toBe(true);
    expect(new Set(barcodes).size).toBe(barcodes.length);
  });

  it('prices are within ₦200–₦60,000 in ₦50 steps, also after branch variation', () => {
    for (const p of catalogue) {
      for (const price of [
        p.basePriceKobo,
        branchPriceKobo(p.basePriceKobo, 1, p.index),
        branchPriceKobo(p.basePriceKobo, 2, p.index),
      ]) {
        expect(price).toBeGreaterThanOrEqual(MIN_PRICE_KOBO);
        expect(price).toBeLessThanOrEqual(MAX_PRICE_KOBO);
        expect(price % 5_000).toBe(0);
      }
    }
  });

  it('includes every edge case the screens need', () => {
    expect(catalogue.filter((p) => !p.soldThroughSkipa).length).toBeGreaterThan(10); // till-only
    expect(catalogue.filter((p) => p.weightGrams === null).length).toBeGreaterThan(10); // missing weight
    expect(catalogue.filter((p) => p.variablePrice).length).toBeGreaterThan(5);
    expect(catalogue.filter((p) => p.soldByWeight).length).toBeGreaterThan(5);
    expect(catalogue.filter((p) => p.extraChecks).length).toBeGreaterThan(5);
    expect(catalogue.filter((p) => p.barcode === null).length).toBeGreaterThan(5);
  });

  it('is deterministic and distinct per organisation', () => {
    expect(generateCatalogue('0001')).toEqual(catalogue);
    const other = new Set(generateCatalogue('0002').map((p) => p.barcode));
    expect(catalogue.some((p) => p.barcode !== null && other.has(p.barcode))).toBe(false);
  });

  it('computes EAN-13 check digits correctly', () => {
    expect(ean13CheckDigit('400638133393')).toBe(1); // 4006381333931 is a well-known valid EAN-13
    expect(isValidEan13('4006381333931')).toBe(true);
    expect(isValidEan13('4006381333932')).toBe(false);
    expect(() => ean13CheckDigit('123')).toThrow();
    expect(() => generateCatalogue('12')).toThrow();
  });
});

describe('seedId()', () => {
  it('is a stable RFC 9562 version-8 UUID', () => {
    expect(seedId('x')).toBe(seedId('x'));
    expect(seedId('x')).not.toBe(seedId('y'));
    expect(seedId('org:harbour')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
