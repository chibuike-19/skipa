// Seed-consistent mock data (brief §5): Adunni Mart (pilot; LK Lekki Phase 1, IK Ikeja GRA) and
// Harbour Grocers (paid 2%; VI). Everything starts from the pack fixtures (validated against the
// contract); the other branches reuse them with their own IDs and brand. Names are the canvas's
// sample people; emails use the reserved .example domain.
import catalogueFixture from '../fixtures/catalogue.json' with { type: 'json' };
import checkInFixture from '../fixtures/check-in.json' with { type: 'json' };
import exitFlaggedFixture from '../fixtures/exit-flagged.json' with { type: 'json' };
import exitUsedFixture from '../fixtures/exit-invalid-used.json' with { type: 'json' };
import orderPendingFixture from '../fixtures/order-pending.json' with { type: 'json' };
import paymentAttemptFixture from '../fixtures/payment-attempt.json' with { type: 'json' };
import receiptFixture from '../fixtures/receipt-valid.json' with { type: 'json' };
import refundFixture from '../fixtures/refund-awaiting-ho.json' with { type: 'json' };

export const fixtures = {
  catalogue: catalogueFixture.data,
  checkIn: checkInFixture.data,
  exitFlagged: exitFlaggedFixture.data,
  exitUsed: exitUsedFixture.data,
  orderPending: orderPendingFixture.data,
  paymentAttempt: paymentAttemptFixture.data,
  receipt: receiptFixture.data,
  refund: refundFixture.data,
};

type BranchPublic = typeof checkInFixture.data.branch;
type Brand = BranchPublic['brand'];

const adunniBrand: Brand = fixtures.checkIn.branch.brand;

const harbourBrand: Brand = {
  displayName: 'Harbour Grocers',
  logoSquareUrl: 'https://assets.skipa.ng/o/harbour/logo-sq.51c0.webp',
  logoWideUrl: 'https://assets.skipa.ng/o/harbour/logo-wide.a7d2.webp',
  coverUrl: 'https://assets.skipa.ng/o/harbour/cover.0e44.webp',
  // Same values as the [data-brand="harbour"] block in tokens.css v1.1.
  primary: '#B3400F',
  primaryHover: '#9A370D',
  primaryPressed: '#812E0B',
  onPrimary: '#FFFFFF',
  primaryText: '#B3400F',
  primarySubtle: '#F7ECE7',
  accent: '#1D6F8A',
  onAccent: '#FFFFFF',
  accentSubtle: '#E8F1F3',
  welcomeMessage:
    'Welcome to Harbour Grocers Victoria Island. Scan as you shop and skip the queue.',
  receiptHeader: 'Harbour Grocers · Victoria Island',
  receiptFooter: 'Thank you for shopping at Harbour Grocers.',
  socialLinks: { instagram: 'https://instagram.com/harbourgrocers' },
};

export const ORG = {
  adunni: fixtures.checkIn.branch.organisationId,
  harbour: '0193a1f2-0000-7000-8000-00000000000b',
} as const;

const lekki: BranchPublic = fixtures.checkIn.branch;
const ikeja: BranchPublic = {
  ...lekki,
  branchId: '0193a1f2-0000-7000-8000-0000000000a2',
  branchName: 'Ikeja GRA',
  area: 'Ikeja',
  address: '9 Isaac John Street, Ikeja GRA, Lagos',
  latitude: 6.5806,
  longitude: 3.3561,
  brand: { ...adunniBrand, receiptHeader: 'Adunni Mart · Ikeja GRA' },
  phone: '+234 803 000 1181',
};
const victoriaIsland: BranchPublic = {
  ...lekki,
  branchId: '0193a1f2-0000-7000-8000-0000000000b1',
  organisationId: ORG.harbour,
  storeName: 'Harbour Grocers',
  branchName: 'Victoria Island',
  area: 'Victoria Island',
  address: '27 Adetokunbo Ademola Street, Victoria Island, Lagos',
  latitude: 6.4281,
  longitude: 3.4219,
  brand: harbourBrand,
  serviceDesk: 'Help desk next to the bakery',
  phone: '+234 803 000 2210',
};

export interface SeedBranch {
  code: 'LK' | 'IK' | 'VI';
  /** Entrance QR code (CheckInRequest.qrCode pattern). */
  qrCode: string;
  branch: BranchPublic;
  plan: 'pilot' | 'paid';
}

export const BRANCHES: readonly SeedBranch[] = [
  { code: 'LK', qrCode: 'QR-ADU-LKI-01', branch: lekki, plan: 'pilot' },
  { code: 'IK', qrCode: 'QR-ADU-IKJ-01', branch: ikeja, plan: 'pilot' },
  { code: 'VI', qrCode: 'QR-HBR-VIC-01', branch: victoriaIsland, plan: 'paid' },
];

export const branchById = (id: string): SeedBranch | undefined =>
  BRANCHES.find((b) => b.branch.branchId === id);

export const SKIPA_DEFAULT_BRAND = { primary: '#23336B', accent: '#E8A317' } as const;

export type Surface = 'shopper' | 'exit' | 'store' | 'admin';

export const STAFF = {
  exit: {
    id: '0193a1f2-0000-7000-8000-00000000c001',
    name: 'Chidi O.',
    email: 'chidi.o@adunnimart.example',
    role: 'exit_checker',
    organisationId: ORG.adunni,
    branchIds: [lekki.branchId],
    permissions: ['exit.check'],
    plan: 'pilot',
  },
  store: {
    id: '0193a1f2-0000-7000-8000-00000000c002',
    name: 'Bisi Kalu',
    email: 'bisi.kalu@adunnimart.example',
    role: 'store_manager',
    organisationId: ORG.adunni,
    branchIds: [lekki.branchId],
    permissions: [
      'live.view',
      'receipts.view',
      'refunds.decide',
      'refunds.record',
      'support.reply',
    ],
    plan: 'pilot',
  },
  admin: {
    id: '0193a1f2-0000-7000-8000-00000000c003',
    name: 'Tolu Adebayo',
    email: 'tolu@skipa.example',
    role: 'super_admin',
    organisationId: null,
    branchIds: [],
    permissions: ['platform.all'],
  },
} as const;

export const SHOPPER = {
  id: '0193a1f2-0000-7000-8000-00000000d001',
  name: 'Ada Nwosu',
  phoneMasked: '+234 *** *** 4471',
  email: 'ada.n@mail.example',
  avatar: 'tomi',
  emailReceipts: true,
  starsTotal: 42,
  marketingConsent: false,
} as const;
