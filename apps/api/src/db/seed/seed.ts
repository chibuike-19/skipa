// pnpm db:seed (brief §9, AD §7.5): fictional data for local and staging, never production.
// Deterministic IDs and ON CONFLICT DO NOTHING make it safe to run again. Where the pack fixtures
// show the same entity, the seed uses the fixture's IDs and values (docs/architecture-pack/mocks).
//
// Not seeded here yet, each waiting for the module that owns it: 30 days of activity (each
// milestone seeds its own area: lead's decision, 26 Nov 2026), branding versions (need the
// contrast checker), notification templates and the 30 platform FAQs (no source text in the
// documents yet), stars and visited stores (need visits).
import { createHash } from 'node:crypto';

import type pg from 'pg';

import { maskPhone, type PiiCrypto } from '../../platform/crypto.ts';
import {
  branchPriceKobo,
  generateCatalogue,
  STANDARD_CATEGORIES,
  type CategoryKey,
} from './catalogue-data.ts';

/** Stable UUID (RFC 9562 version 8, name-based) for a seed label. */
export function seedId(label: string): string {
  const h = createHash('sha256').update(`skipa-seed:${label}`).digest('hex');
  const variant = ((parseInt(h.slice(16, 17), 16) & 0x3) | 0x8).toString(16);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-8${h.slice(13, 16)}-${variant}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

// IDs and values shared with docs/architecture-pack/mocks/fixtures (check-in.json, catalogue.json).
export const FIXTURE = {
  adunniOrgId: '0193a1f2-0000-7000-8000-00000000000a',
  lekkiBranchId: '0193a1f2-0000-7000-8000-0000000000a1',
  drinksCategoryId: '0193a1f2-2222-7000-8000-000000000001',
  alcoholCategoryId: '0193a1f2-2222-7000-8000-000000000002',
  products: [
    // Barcodes are the fixtures' own; their EAN-13 check digits are not valid (open question).
    {
      id: '0193a1f2-3333-7000-8000-000000000001',
      barcode: '6156000231187',
      name: 'Malt drink 33 cl',
      weightGrams: 360,
      priceKobo: 40_000,
      category: 'drinks',
      soldThroughSkipa: true,
    },
    {
      id: '0193a1f2-3333-7000-8000-000000000002',
      barcode: '5000213003218',
      name: 'Stout 60 cl',
      weightGrams: 980,
      priceKobo: 120_000,
      category: 'alcoholic_drinks',
      soldThroughSkipa: true,
    },
    // catalogue.json puts vegetable oil under Drinks; kept as the fixture has it.
    {
      id: '0193a1f2-3333-7000-8000-000000000003',
      barcode: '6154000057038',
      name: 'Vegetable oil 1 L',
      weightGrams: 920,
      priceKobo: 320_000,
      category: 'drinks',
      soldThroughSkipa: false,
    },
  ],
} as const;

const WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const hours = (open: string, close: string, sunday: [string, string]) =>
  Object.fromEntries(WEEK.map((d) => [d, [d === 'sun' ? sunday : [open, close]]]));

interface OrgSpec {
  key: string;
  id: string;
  name: string;
  legalName: string;
  status: 'pilot' | 'live';
  plan: 'pilot' | 'paid';
  pilotEndsOn: string | null;
  feeBps: number;
  posMode: 'api' | 'file';
  connector: string;
  emailDomain: string;
  barcodePrefix: string;
  branches: {
    id: string;
    code: string;
    name: string;
    addressLine: string;
    area: string;
    latitude: number;
    longitude: number;
    phone: string;
    serviceDesk: string;
    hours: Record<string, string[][]>;
  }[];
}

export const ORGANISATIONS: readonly OrgSpec[] = [
  {
    key: 'adunni',
    id: FIXTURE.adunniOrgId,
    name: 'Adunni Mart',
    legalName: 'Adunni Mart Limited',
    status: 'pilot',
    plan: 'pilot',
    pilotEndsOn: '2027-01-15',
    feeBps: 0,
    posMode: 'api',
    connector: 'mock_pos',
    emailDomain: 'adunni.test',
    barcodePrefix: '0001',
    branches: [
      {
        id: FIXTURE.lekkiBranchId,
        code: 'LK',
        name: 'Lekki Phase 1',
        addressLine: '14 Admiralty Way, Lekki Phase 1',
        area: 'Lekki',
        latitude: 6.4474,
        longitude: 3.4723,
        phone: '+234 803 000 1180',
        serviceDesk: 'Customer service desk by the main entrance',
        hours: hours('08:00', '21:00', ['12:00', '20:00']),
      },
      {
        id: seedId('branch:adunni:IK'),
        code: 'IK',
        name: 'Ikeja GRA',
        addressLine: '7 Isaac John Street, Ikeja GRA',
        area: 'Ikeja',
        latitude: 6.5806,
        longitude: 3.3567,
        phone: '+234 803 000 1181',
        serviceDesk: 'Service desk next to the bakery',
        hours: hours('08:00', '21:00', ['12:00', '20:00']),
      },
    ],
  },
  {
    key: 'harbour',
    id: seedId('org:harbour'),
    name: 'Harbour Grocers',
    legalName: 'Harbour Grocers Nigeria Limited',
    status: 'live',
    plan: 'paid',
    pilotEndsOn: null,
    feeBps: 200,
    posMode: 'file',
    connector: 'generic_csv',
    emailDomain: 'harbour.test',
    barcodePrefix: '0002',
    branches: [
      {
        id: seedId('branch:harbour:VI'),
        code: 'VI',
        name: 'Victoria Island',
        addressLine: '22 Adeola Odeku Street, Victoria Island',
        area: 'Victoria Island',
        latitude: 6.4302,
        longitude: 3.4225,
        phone: '+234 803 000 2190',
        serviceDesk: 'Customer service by the exit',
        hours: hours('08:00', '22:00', ['11:00', '20:00']),
      },
    ],
  },
];

export const SUPER_ADMIN_EMAIL = 'tolu@skipa.test';

/** Multi-row INSERT … ON CONFLICT DO NOTHING, in batches. Returns rows actually inserted. */
async function insertMany(
  client: pg.ClientBase,
  table: string,
  columns: readonly string[],
  rows: readonly unknown[][],
): Promise<number> {
  let inserted = 0;
  const batch = Math.max(1, Math.floor(10_000 / columns.length));
  for (let start = 0; start < rows.length; start += batch) {
    const chunk = rows.slice(start, start + batch);
    const values: unknown[] = [];
    const tuples = chunk.map(
      (row) => `(${row.map((v) => `$${String(values.push(v))}`).join(', ')})`,
    );
    const result = await client.query(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${tuples.join(', ')} ON CONFLICT DO NOTHING`,
      values,
    );
    inserted += result.rowCount ?? 0;
  }
  return inserted;
}

export interface SeedOptions {
  crypto: PiiCrypto;
  /** Clock for timestamps (stale prices are relative to it). */
  now?: Date;
}

export async function runSeed(client: pg.ClientBase, { crypto, now = new Date() }: SeedOptions) {
  const counts: Record<string, number> = {};
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000);

  // Platform configuration ------------------------------------------------------------------
  counts.standard_categories = await insertMany(
    client,
    'standard_categories',
    ['id', 'key', 'name', 'description', 'default_check_level', 'sort_order'],
    STANDARD_CATEGORIES.map((c, i) => [
      seedId(`std:${c.key}`),
      c.key,
      c.name,
      c.description,
      c.defaultCheckLevel,
      i,
    ]),
  );
  counts.platform_settings = await insertMany(
    client,
    'platform_settings',
    ['key', 'value'],
    [
      [
        'timeouts',
        JSON.stringify({
          shopperIdleDays: 90,
          exitIdleHours: 12,
          storeIdleHours: 8,
          adminIdleMinutes: 30,
          adminAbsoluteHours: 12,
        }),
      ],
      [
        'defaults',
        JSON.stringify({
          cartMaxValueKobo: 15_000_000,
          cartMaxItems: 30,
          exitWindowMinutes: 30,
          refundHeadOfficeThresholdKobo: 2_000_000,
          platformFeeBps: 200,
        }),
      ],
      ['emailDailyReserve', JSON.stringify(40)],
      ['chargebackReserveLowWaterKobo', JSON.stringify(10_000_000)],
    ],
  );
  counts.feature_flags = await insertMany(
    client,
    'feature_flags',
    ['key', 'description', 'enabled'],
    [
      ['superadmin_second_step', 'Super admins must pass a TOTP second step (D-23)', false],
      ['skipa_home', 'Skipa home: stores, support and profile outside a store (D-12)', true],
      [
        'first_time_tours',
        'First-time tours on shopper, dashboard and exit (SH-31, SD-21, EX-12)',
        true,
      ],
      ['connected_exit_scale', 'Connected scales at the exit (not in the MVP)', false],
      ['referrals', 'Referrals (not in the MVP)', false],
    ],
  );
  counts.star_rules = await insertMany(
    client,
    'star_rules',
    ['id', 'version', 'rules', 'effective_from'],
    [
      [
        seedId('star_rules:1'),
        1,
        JSON.stringify({ perVisit: 1, dailyCapPerStore: 1, bonuses: [], tiersEnabled: false }),
        '2026-11-01T00:00:00Z',
      ],
    ],
  );

  // Organisations, branches, settings, QR codes ---------------------------------------------
  for (const org of ORGANISATIONS) {
    counts.organisations =
      (counts.organisations ?? 0) +
      (await insertMany(
        client,
        'organisations',
        [
          'id',
          'name',
          'legal_name',
          'status',
          'plan',
          'pilot_ends_on',
          'platform_fee_bps',
          'pos_mode',
          'pos_connector_key',
          'head_office_email',
          'agreement_signed_on',
        ],
        [
          [
            org.id,
            org.name,
            org.legalName,
            org.status,
            org.plan,
            org.pilotEndsOn,
            org.feeBps,
            org.posMode,
            org.connector,
            `ho@${org.emailDomain}`,
            '2026-11-01',
          ],
        ],
      ));
    for (const b of org.branches) {
      counts.branches =
        (counts.branches ?? 0) +
        (await insertMany(
          client,
          'branches',
          [
            'id',
            'organisation_id',
            'code',
            'name',
            'address_line',
            'area',
            'city',
            'latitude',
            'longitude',
            'phone',
            'service_desk_note',
            'opening_hours',
            'status',
            'skipa_enabled',
          ],
          [
            [
              b.id,
              org.id,
              b.code,
              b.name,
              b.addressLine,
              b.area,
              'Lagos',
              b.latitude,
              b.longitude,
              b.phone,
              b.serviceDesk,
              JSON.stringify(b.hours),
              'live',
              true,
            ],
          ],
        ));
      await insertMany(
        client,
        'branch_settings',
        ['branch_id', 'organisation_id'],
        [[b.id, org.id]],
      );
      await insertMany(
        client,
        'qr_codes',
        ['id', 'organisation_id', 'branch_id', 'code', 'location_label'],
        [
          [seedId(`qr:${b.code}:ENT-01`), org.id, b.id, `QR-${b.code}-ENT-01`, 'Main entrance'],
          [seedId(`qr:${b.code}:CPK-01`), org.id, b.id, `QR-${b.code}-CPK-01`, 'Car park entrance'],
        ],
      );
    }
  }

  // Staff: one user per role per organisation, plus the super admin -----------------------
  const staff: unknown[][] = [
    [seedId('user:super'), null, SUPER_ADMIN_EMAIL, 'Tolu Adebayo', 'super_admin', 'active'],
  ];
  const userBranches: unknown[][] = [];
  const people = [
    'Chiamaka Obi',
    'Emeka Nwosu',
    'Funmi Ajayi',
    'Ibrahim Musa',
    'Kemi Bello',
    'Ngozi Eze',
    'Segun Ade',
    'Zainab Yusuf',
  ];
  let person = 0;
  for (const org of ORGANISATIONS) {
    staff.push([
      seedId(`user:${org.key}:ho`),
      org.id,
      `ho@${org.emailDomain}`,
      people[person++ % people.length],
      'head_office_admin',
      'active',
    ]);
    for (const b of org.branches) {
      for (const [role, prefix] of [
        ['store_manager', 'manager'],
        ['exit_checker', 'checker'],
      ] as const) {
        const id = seedId(`user:${org.key}:${prefix}:${b.code}`);
        staff.push([
          id,
          org.id,
          `${prefix}.${b.code.toLowerCase()}@${org.emailDomain}`,
          people[person++ % people.length],
          role,
          'active',
        ]);
        userBranches.push([id, b.id, org.id]);
      }
    }
  }
  counts.users = await insertMany(
    client,
    'users',
    ['id', 'organisation_id', 'email', 'name', 'role', 'status'],
    staff,
  );
  await client.query(
    `UPDATE users SET activated_at = coalesce(activated_at, $1) WHERE id = ANY($2)`,
    [now, staff.map((s) => s[0])],
  );
  counts.user_branches = await insertMany(
    client,
    'user_branches',
    ['user_id', 'branch_id', 'organisation_id'],
    userBranches,
  );

  // Catalogue: category copies, products, branch prices ---------------------------------------
  for (const org of ORGANISATIONS) {
    const categoryIds = new Map<CategoryKey, string>();
    const categoryRows = STANDARD_CATEGORIES.map((c) => {
      const id =
        org.id === FIXTURE.adunniOrgId && c.key === 'drinks'
          ? FIXTURE.drinksCategoryId
          : org.id === FIXTURE.adunniOrgId && c.key === 'alcoholic_drinks'
            ? FIXTURE.alcoholCategoryId
            : seedId(`category:${org.key}:${c.key}`);
      categoryIds.set(c.key, id);
      // Extra-checks standard categories cannot be lowered below extra (loss control).
      return [
        id,
        org.id,
        seedId(`std:${c.key}`),
        'standard',
        c.name,
        c.defaultCheckLevel,
        c.defaultCheckLevel,
      ];
    });
    counts.categories =
      (counts.categories ?? 0) +
      (await insertMany(
        client,
        'categories',
        [
          'id',
          'organisation_id',
          'standard_category_id',
          'kind',
          'name',
          'check_level',
          'check_level_floor',
        ],
        categoryRows,
      ));
    for (const b of org.branches) {
      await insertMany(
        client,
        'branch_categories',
        ['branch_id', 'category_id', 'organisation_id', 'active', 'activated_at'],
        STANDARD_CATEGORIES.map((c) => {
          // catalogue.json: alcoholic drinks are switched off at Lekki (Stout shows category_off).
          const active = !(b.id === FIXTURE.lekkiBranchId && c.key === 'alcoholic_drinks');
          return [b.id, categoryIds.get(c.key), org.id, active, active ? now : null];
        }),
      );
    }

    const generated = generateCatalogue(org.barcodePrefix);
    const productRows = generated.map((p) => [
      seedId(`product:${org.key}:${p.posProductId}`),
      org.id,
      p.posProductId,
      p.barcode,
      p.name,
      p.posDepartment,
      categoryIds.get(p.category),
      p.weightGrams,
      p.weightGrams === null ? null : 'import',
      p.soldByWeight,
      p.variablePrice,
      p.extraChecks,
      p.soldThroughSkipa,
    ]);
    if (org.id === FIXTURE.adunniOrgId) {
      for (const [i, p] of FIXTURE.products.entries()) {
        productRows.push([
          p.id,
          org.id,
          `FIX-${String(i + 1)}`,
          p.barcode,
          p.name,
          p.category.toUpperCase(),
          categoryIds.get(p.category),
          p.weightGrams,
          'store',
          false,
          false,
          false,
          p.soldThroughSkipa,
        ]);
      }
    }
    counts.products =
      (counts.products ?? 0) +
      (await insertMany(
        client,
        'products',
        [
          'id',
          'organisation_id',
          'pos_product_id',
          'barcode',
          'name',
          'pos_department',
          'category_id',
          'weight_grams',
          'weight_source',
          'sold_by_weight',
          'variable_price',
          'extra_checks',
          'sold_through_skipa',
        ],
        productRows,
      ));

    for (const [branchIndex, b] of org.branches.entries()) {
      const priceRows = generated.map((p) => [
        b.id,
        seedId(`product:${org.key}:${p.posProductId}`),
        org.id,
        branchPriceKobo(p.basePriceKobo, branchIndex + 1, p.index),
        p.index % 41 === 3 ? 0 : 20 + (p.index % 180), // some out of stock (CT-06)
        p.index % 97 === 23 ? hoursAgo(30) : hoursAgo(1), // some stale prices: > 24 h old (12.4)
      ]);
      if (org.id === FIXTURE.adunniOrgId) {
        for (const p of FIXTURE.products)
          priceRows.push([b.id, p.id, org.id, p.priceKobo, 50, hoursAgo(1)]);
      }
      counts.branch_products =
        (counts.branch_products ?? 0) +
        (await insertMany(
          client,
          'branch_products',
          [
            'branch_id',
            'product_id',
            'organisation_id',
            'price_kobo',
            'stock_qty',
            'price_synced_at',
          ],
          priceRows,
        ));
    }
  }

  // Shoppers: 50, all five avatars, phone and email encrypted --------------------------------
  const avatars = ['tomi', 'mimi', 'ata', 'lubo', 'sardi'] as const;
  const first = ['Ada', 'Bayo', 'Chidi', 'Dami', 'Efe', 'Folake', 'Gbenga', 'Hauwa', 'Ife', 'Jide'];
  const last = ['Okafor', 'Adeyemi', 'Bello', 'Eze', 'Lawal'];
  const shopperRows: unknown[][] = [];
  const consentRows: unknown[][] = [];
  for (let i = 1; i <= 50; i++) {
    const id = seedId(`shopper:${String(i)}`);
    const phone = `+2348099990${String(i).padStart(3, '0')}`; // fictional +234 809 999 0xxx range
    const hasEmail = i % 3 !== 0;
    const email = `shopper${String(i).padStart(2, '0')}@example.test`;
    shopperRows.push([
      id,
      crypto.lookupKey('phone', phone),
      crypto.encrypt(phone, 'pii.shoppers.phone'),
      maskPhone(phone),
      `${first[i % first.length] ?? 'Ada'} ${last[i % last.length] ?? 'Okafor'}`,
      hasEmail ? crypto.encrypt(email, 'pii.shoppers.email') : null,
      hasEmail ? crypto.lookupKey('email', email) : null,
      hasEmail && i % 2 === 0,
      avatars[i % avatars.length],
    ]);
    consentRows.push([
      seedId(`consent:${String(i)}:privacy`),
      id,
      'privacy_notice',
      '2026-11-v1',
      true,
    ]);
    consentRows.push([
      seedId(`consent:${String(i)}:marketing`),
      id,
      'marketing',
      '2026-11-v1',
      i % 5 < 2,
    ]);
  }
  counts.shoppers = await insertMany(
    client,
    'pii.shoppers',
    [
      'id',
      'phone_hmac',
      'phone_enc',
      'phone_masked',
      'name',
      'email_enc',
      'email_hmac',
      'email_receipts',
      'avatar',
    ],
    shopperRows,
  );
  counts.consents = await insertMany(
    client,
    'pii.consents',
    ['id', 'shopper_id', 'kind', 'notice_version', 'granted'],
    consentRows,
  );

  return counts;
}
