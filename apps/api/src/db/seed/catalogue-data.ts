// Deterministic generated catalogue (brief §9): ~1,300 products per organisation from a generic
// Nigerian grocery list, valid EAN-13 barcodes (GS1 Nigeria prefix 615), prices ₦200–₦60,000,
// weights, and every edge case the screens need. Same input → same output, so the seed is
// repeatable and tests can rely on it.

export const STANDARD_CATEGORIES = [
  // PRD v2.0 §7.2 (9 categories; the AD says 10 — open question in docs/progress/backend.md).
  {
    key: 'drinks',
    name: 'Drinks',
    description: 'Soft drinks, water, juice, energy and malt drinks',
    defaultCheckLevel: 'standard',
  },
  {
    key: 'alcoholic_drinks',
    name: 'Alcoholic drinks',
    description: 'Beer, wine and spirits',
    defaultCheckLevel: 'extra',
  },
  {
    key: 'snacks_confectionery',
    name: 'Snacks and confectionery',
    description: 'Biscuits, crisps, chocolate and sweets',
    defaultCheckLevel: 'standard',
  },
  {
    key: 'packaged_food',
    name: 'Packaged food',
    description: 'Rice, pasta, noodles, cereals, canned food, oil and seasonings',
    defaultCheckLevel: 'standard',
  },
  {
    key: 'breakfast_dairy',
    name: 'Breakfast and dairy',
    description: 'Tea, coffee, beverage powders, tinned and powdered milk',
    defaultCheckLevel: 'standard',
  },
  {
    key: 'household_cleaning',
    name: 'Household and cleaning',
    description: 'Detergents, dishwashing liquid, toilet paper, air fresheners',
    defaultCheckLevel: 'standard',
  },
  {
    key: 'personal_care',
    name: 'Personal care',
    description: 'Soap, toothpaste, deodorant and sanitary products',
    defaultCheckLevel: 'standard',
  },
  {
    key: 'baby_care',
    name: 'Baby care',
    description: 'Diapers, wipes and baby formula',
    defaultCheckLevel: 'extra',
  },
  {
    key: 'beauty_cosmetics',
    name: 'Beauty and cosmetics',
    description: 'Makeup, perfume and skincare',
    defaultCheckLevel: 'extra',
  },
] as const;

export type CategoryKey = (typeof STANDARD_CATEGORIES)[number]['key'];

interface Size {
  label: string;
  grams: number;
  /** Multiplier on the base price. */
  factor: number;
}

interface Line {
  category: CategoryKey;
  names: readonly string[];
  sizes: readonly Size[];
  /** Price in kobo for factor 1. */
  baseKobo: number;
  packs?: readonly number[];
  /** Variant prefix (empty = plain). */
  variants: readonly string[];
}

const s = (label: string, grams: number, factor: number): Size => ({ label, grams, factor });

const LINES: readonly Line[] = [
  {
    category: 'drinks',
    variants: ['', 'Zero sugar'],
    names: [
      'Malt drink',
      'Cola',
      'Orange soda',
      'Lemon-lime soda',
      'Table water',
      'Sparkling water',
      'Orange juice',
      'Apple juice',
      'Pineapple juice',
      'Mango juice',
      'Energy drink',
      'Tiger nut drink',
      'Zobo drink',
      'Iced tea',
      'Chocolate milk drink',
      'Yoghurt drink',
    ],
    sizes: [
      s('33 cl', 360, 1),
      s('50 cl', 540, 1.3),
      s('60 cl', 640, 1.5),
      s('1 L', 1_060, 2.4),
      s('1.5 L', 1_580, 3.2),
    ],
    baseKobo: 40_000,
    packs: [1, 6],
  },
  {
    category: 'alcoholic_drinks',
    variants: ['', 'Premium'],
    names: [
      'Lager beer',
      'Stout',
      'Shandy',
      'Red wine',
      'White wine',
      'Sparkling wine',
      'Dry gin',
      'Vodka',
      'Whisky',
      'Brandy',
      'Rum',
      'Cream liqueur',
    ],
    sizes: [s('33 cl', 520, 1), s('60 cl', 980, 1.6), s('75 cl', 1_250, 7), s('1 L', 1_600, 10)],
    baseKobo: 70_000,
    packs: [1, 6],
  },
  {
    category: 'snacks_confectionery',
    variants: ['', 'Spicy'],
    names: [
      'Cream crackers',
      'Digestive biscuits',
      'Shortbread',
      'Wafer bar',
      'Plantain chips',
      'Potato crisps',
      'Chin chin',
      'Groundnuts',
      'Cashew nuts',
      'Milk chocolate',
      'Dark chocolate',
      'Toffee',
      'Chewing gum',
      'Lollipops',
      'Popcorn',
      'Coconut chips',
    ],
    sizes: [s('40 g', 45, 1), s('100 g', 110, 2), s('200 g', 215, 3.6), s('400 g', 420, 6.5)],
    baseKobo: 25_000,
    packs: [1, 12],
  },
  {
    category: 'packaged_food',
    variants: ['', 'Premium'],
    names: [
      'Long grain rice',
      'Basmati rice',
      'Spaghetti',
      'Macaroni',
      'Instant noodles',
      'Corn flakes',
      'Oats',
      'Semolina',
      'Garri',
      'Beans',
      'Tomato paste',
      'Sardines',
      'Corned beef',
      'Baked beans',
      'Vegetable oil',
      'Palm oil',
      'Seasoning cubes',
      'Curry powder',
      'Thyme',
      'Salt',
      'Sugar',
      'Custard powder',
    ],
    sizes: [s('70 g', 75, 1), s('500 g', 510, 3.5), s('1 kg', 1_020, 6), s('5 kg', 5_050, 26)],
    baseKobo: 30_000,
  },
  {
    category: 'breakfast_dairy',
    variants: ['', 'Family'],
    names: [
      'Black tea',
      'Green tea',
      'Instant coffee',
      'Cocoa beverage',
      'Malted chocolate powder',
      'Evaporated milk',
      'Powdered milk',
      'Condensed milk',
      'Fresh yoghurt',
      'Butter',
      'Margarine',
      'Honey',
      'Peanut butter',
      'Jam',
    ],
    sizes: [s('25 bags', 60, 1), s('170 g', 180, 2), s('400 g', 420, 4), s('900 g', 930, 8)],
    baseKobo: 60_000,
  },
  {
    category: 'household_cleaning',
    variants: ['', 'Lemon'],
    names: [
      'Laundry detergent',
      'Bar soap (laundry)',
      'Dishwashing liquid',
      'Bleach',
      'Toilet cleaner',
      'Floor cleaner',
      'Toilet paper',
      'Kitchen towels',
      'Air freshener',
      'Insecticide spray',
      'Mosquito coil',
      'Scouring pads',
      'Bin bags',
      'Fabric softener',
    ],
    sizes: [
      s('Small', 250, 1),
      s('Medium', 520, 1.8),
      s('Large', 1_050, 3.2),
      s('Family', 2_100, 5.8),
    ],
    baseKobo: 70_000,
    packs: [1, 4],
  },
  {
    category: 'personal_care',
    variants: ['', 'Herbal'],
    names: [
      'Bath soap',
      'Antiseptic soap',
      'Toothpaste',
      'Toothbrush',
      'Mouthwash',
      'Roll-on deodorant',
      'Body spray',
      'Body lotion',
      'Petroleum jelly',
      'Shampoo',
      'Hair cream',
      'Sanitary pads',
      'Razor blades',
      'Hand sanitiser',
      'Cotton buds',
    ],
    sizes: [s('Small', 90, 1), s('Regular', 160, 1.7), s('Large', 320, 3), s('Value', 650, 5.4)],
    baseKobo: 45_000,
    packs: [1, 3],
  },
  {
    category: 'baby_care',
    variants: ['', 'Sensitive'],
    names: [
      'Diapers newborn',
      'Diapers size 3',
      'Diapers size 5',
      'Baby wipes',
      'Infant formula stage 1',
      'Infant formula stage 2',
      'Baby cereal',
      'Baby lotion',
      'Baby powder',
      'Baby oil',
      'Feeding bottle',
      'Teething gel',
    ],
    sizes: [
      s('Small', 200, 1),
      s('Medium', 420, 1.9),
      s('Large', 850, 3.5),
      s('Jumbo', 1_700, 6.4),
    ],
    baseKobo: 150_000,
  },
  {
    category: 'beauty_cosmetics',
    variants: ['', 'Matte'],
    names: [
      'Lipstick',
      'Lip gloss',
      'Foundation',
      'Face powder',
      'Mascara',
      'Eyeliner',
      'Nail polish',
      'Perfume',
      'Body mist',
      'Face cream',
      'Sunscreen',
      'Shea butter',
      'Hair relaxer',
      'Makeup remover',
    ],
    sizes: [s('Mini', 30, 1), s('Standard', 70, 2), s('Large', 150, 3.6), s('Gift set', 400, 7.5)],
    baseKobo: 200_000,
  },
];

export const MIN_PRICE_KOBO = 20_000; // ₦200
export const MAX_PRICE_KOBO = 6_000_000; // ₦60,000

export interface GeneratedProduct {
  index: number;
  posProductId: string;
  barcode: string | null;
  name: string;
  category: CategoryKey;
  posDepartment: string;
  weightGrams: number | null;
  soldByWeight: boolean;
  variablePrice: boolean;
  extraChecks: boolean;
  soldThroughSkipa: boolean;
  basePriceKobo: number;
}

/** EAN-13 check digit for the first 12 digits. */
export function ean13CheckDigit(first12: string): number {
  if (!/^\d{12}$/.test(first12)) throw new Error('need 12 digits');
  const sum = Array.from(first12, Number).reduce(
    (acc, digit, i) => acc + digit * (i % 2 === 0 ? 1 : 3),
    0,
  );
  return (10 - (sum % 10)) % 10;
}

export function isValidEan13(barcode: string): boolean {
  return /^\d{13}$/.test(barcode) && ean13CheckDigit(barcode.slice(0, 12)) === Number(barcode[12]);
}

/** ₦50 steps, clamped to the seed's price range. */
function roundPrice(kobo: number): number {
  const stepped = Math.round(kobo / 5_000) * 5_000;
  return Math.min(MAX_PRICE_KOBO, Math.max(MIN_PRICE_KOBO, stepped));
}

/**
 * Edge cases at fixed positions, so they are easy to find and stable across runs:
 * till-only, missing weight, variable price, sold by weight, extra checks in a standard
 * category, and no barcode (CT-04, CT-05, CT-07).
 */
export function edgeCaseFor(index: number) {
  return {
    tillOnly: index % 47 === 5,
    missingWeight: index % 53 === 7,
    variablePrice: index % 61 === 11,
    soldByWeight: index % 67 === 13,
    extraChecks: index % 71 === 17,
    noBarcode: index % 89 === 19,
  };
}

/** `companyPrefix` is 4 digits after 615, so each organisation's barcodes are distinct. */
export function generateCatalogue(companyPrefix: string, target = 1_300): GeneratedProduct[] {
  if (!/^\d{4}$/.test(companyPrefix)) throw new Error('company prefix must be 4 digits');
  // Candidates per line, then round-robin across lines so every category is represented evenly.
  const perLine = LINES.map((line) => {
    const items: { line: Line; label: string; grams: number; priceKobo: number }[] = [];
    for (const variant of line.variants) {
      for (const name of line.names) {
        for (const size of line.sizes) {
          for (const pack of line.packs ?? [1]) {
            const base = variant === '' ? name : `${name} ${variant.toLowerCase()}`;
            items.push({
              line,
              label: pack > 1 ? `${base} ${size.label} × ${pack}` : `${base} ${size.label}`,
              grams: size.grams * pack,
              priceKobo:
                line.baseKobo *
                size.factor *
                pack *
                (pack > 1 ? 0.95 : 1) *
                (variant === '' ? 1 : 1.1),
            });
          }
        }
      }
    }
    return items;
  });
  const total = perLine.reduce((n, items) => n + items.length, 0);
  if (total < target)
    throw new Error(`catalogue lines give ${String(total)} products, need ${String(target)}`);

  const out: GeneratedProduct[] = [];
  for (let round = 0; out.length < target; round++) {
    for (const items of perLine) {
      const item = items[round];
      if (item === undefined || out.length >= target) continue;
      const index = out.length;
      const edge = edgeCaseFor(index);
      const first12 = `615${companyPrefix}${String(index).padStart(5, '0')}`;
      out.push({
        index,
        posProductId: `P${companyPrefix}-${String(index).padStart(5, '0')}`,
        barcode: edge.noBarcode ? null : `${first12}${String(ean13CheckDigit(first12))}`,
        name: item.label,
        category: item.line.category,
        posDepartment: item.line.category.toUpperCase(),
        weightGrams: edge.missingWeight ? null : item.grams,
        soldByWeight: edge.soldByWeight,
        variablePrice: edge.variablePrice,
        extraChecks: edge.extraChecks,
        soldThroughSkipa: !edge.tillOnly,
        basePriceKobo: roundPrice(item.priceKobo),
      });
    }
  }
  return out;
}

/** Per-branch price: the base price ±3%, deterministic per branch and product, in ₦50 steps. */
export function branchPriceKobo(basePriceKobo: number, branchSalt: number, index: number): number {
  const wobble = (((index + 1) * 7_919 + branchSalt * 104_729) % 61) - 30; // −30..30 → ±3%
  return roundPrice(basePriceKobo * (1 + wobble / 1_000));
}
