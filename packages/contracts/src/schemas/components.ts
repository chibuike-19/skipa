// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import { z } from 'zod';

import { named } from '../openapi/registry.ts';
import { kobo } from './primitives.ts';

export const ErrorSchema = named(
  'Error',
  z.strictObject({
    error: z.strictObject({
      code: z
        .string()
        .regex(new RegExp('^[A-Z]{3,6}-[0-9]{3}$'))
        .meta({ examples: ['PAY-007'] }),
      message: z.string(),
      userMessage: z.string().meta({ description: 'Plain-English message safe to show (ER-07).' }),
      requestId: z.string().meta({ description: 'Short reference shown to users (ER-08).' }),
      details: z.looseObject({}).optional(),
    }),
  }),
);

export const DeviceSchema = named(
  'Device',
  z.strictObject({
    deviceId: z.uuid(),
    deviceToken: z.string().meta({ description: 'Signed token; send as X-Skipa-Device.' }),
  }),
);

export const DeviceRegistrationSchema = named(
  'DeviceRegistration',
  z.strictObject({
    platform: z.enum(['web', 'ios', 'android']),
    appVersion: z.string(),
    browser: z.string().optional(),
  }),
);

export const OtpRequestSchema = named(
  'OtpRequest',
  z.strictObject({
    destination: z
      .string()
      .meta({ description: 'E.164 phone (+234…) for shoppers, email for staff.' }),
    purpose: z.enum(['shopper_register', 'shopper_sign_in', 'staff_sign_in', 'admin_sign_in']),
    surface: z.enum(['exit', 'store', 'admin']).optional(),
    inviteToken: z.string().optional(),
  }),
);

export const OtpChallengeSchema = named(
  'OtpChallenge',
  z.strictObject({
    challengeId: z.uuid(),
    destinationMasked: z.string(),
    expiresAt: z.iso.datetime(),
    resendAfter: z.iso.datetime(),
  }),
);

export const OtpVerifySchema = named(
  'OtpVerify',
  z.strictObject({
    challengeId: z.uuid(),
    code: z.string().regex(new RegExp('^[0-9]{6}$')),
    exitDeviceLabel: z.string().optional(),
  }),
);

export const SessionSchema = named(
  'Session',
  z.strictObject({
    token: z
      .string()
      .meta({ description: 'Opaque token. Web apps also receive it as an httpOnly cookie.' }),
    expiresAt: z.iso.datetime(),
    surface: z.enum(['shopper', 'exit', 'store', 'admin']),
    secondStepRequired: z.boolean().optional(),
  }),
);

export const ShopperRegistrationSchema = named(
  'ShopperRegistration',
  z.strictObject({
    registrationToken: z.string(),
    name: z.string().min(2).max(80),
    email: z.email().optional(),
    privacyNoticeVersion: z.string(),
    marketingConsent: z.boolean(),
    emailReceipts: z.boolean().optional(),
    claimGuestStars: z.boolean().optional(),
  }),
);

export const ShopperProfileSchema = named(
  'ShopperProfile',
  z.strictObject({
    id: z.uuid(),
    name: z.string(),
    phoneMasked: z.string(),
    email: z.email().nullable().optional(),
    avatar: z.enum(['tomi', 'mimi', 'ata', 'lubo', 'sardi']),
    emailReceipts: z.boolean(),
    starsTotal: z.int(),
    marketingConsent: z.boolean().optional(),
  }),
);

export const ShopperPatchSchema = named(
  'ShopperPatch',
  z.strictObject({
    name: z.string().optional(),
    email: z.email().nullable().optional(),
    avatar: z.enum(['tomi', 'mimi', 'ata', 'lubo', 'sardi']).optional(),
    emailReceipts: z.boolean().optional(),
    marketingConsent: z.boolean().optional(),
  }),
);

export const StaffMeSchema = named(
  'StaffMe',
  z.strictObject({
    id: z.uuid(),
    name: z.string(),
    email: z.string(),
    role: z.enum([
      'exit_checker',
      'store_manager',
      'head_office_admin',
      'super_admin',
      'support_agent',
    ]),
    organisationId: z.uuid().nullable(),
    branchIds: z.array(z.uuid()),
    permissions: z.array(z.string()),
    plan: z.enum(['pilot', 'paid']).optional(),
  }),
);

export const BrandTokensSchema = named(
  'BrandTokens',
  z.strictObject({
    displayName: z.string(),
    logoSquareUrl: z.string().nullable().optional(),
    logoWideUrl: z.string().nullable().optional(),
    coverUrl: z.string().nullable().optional(),
    primary: z.string(),
    primaryHover: z.string().optional(),
    primaryPressed: z.string().optional(),
    onPrimary: z.string(),
    primaryText: z.string(),
    primarySubtle: z.string().optional(),
    accent: z.string(),
    onAccent: z.string(),
    accentSubtle: z.string().optional(),
    welcomeMessage: z.string().optional(),
    receiptHeader: z.string().optional(),
    receiptFooter: z.string().optional(),
    socialLinks: z.looseObject({}).optional(),
  }),
);

export const BranchPublicSchema = named(
  'BranchPublic',
  z.strictObject({
    branchId: z.uuid(),
    organisationId: z.uuid(),
    storeName: z.string(),
    branchName: z.string(),
    area: z.string(),
    address: z.string().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    openingHours: z.looseObject({}).optional(),
    skipaStatus: z.enum(['on', 'off', 'payments_unavailable']),
    brand: BrandTokensSchema,
    serviceDesk: z.string().optional(),
    phone: z.string().optional(),
  }),
);

export const CheckInRequestSchema = named(
  'CheckInRequest',
  z.strictObject({
    qrCode: z.string().regex(new RegExp('^QR-[A-Z]{2,4}-[A-Z]{3}-[0-9]{2}$')),
    entryPoint: z.enum(['store_qr', 'skipa_home_scan', 'resume']).optional(),
  }),
);

export const ShoppingSessionSchema = named(
  'ShoppingSession',
  z.strictObject({
    sessionId: z.uuid(),
    branch: BranchPublicSchema,
    status: z.enum(['active', 'switched_off', 'payments_unavailable']),
    catalogueVersion: z.int(),
    limits: z.strictObject({
      maxValueKobo: kobo,
      maxItems: z.int(),
    }),
    paymentChannels: z.array(z.enum(['card', 'bank_transfer', 'ussd'])),
    exitWindowMinutes: z.int(),
    sessionTimeoutMinutes: z.int().optional(),
  }),
);

export const CatalogueProductSchema = named(
  'CatalogueProduct',
  z.strictObject({
    id: z.uuid(),
    barcode: z.string(),
    name: z.string(),
    priceKobo: kobo,
    categoryId: z.uuid(),
    status: z.enum(['available', 'till_only', 'category_off', 'price_updating', 'not_ready']),
  }),
);

export const CatalogueSchema = named(
  'Catalogue',
  z.strictObject({
    branchId: z.uuid(),
    version: z.int(),
    generatedAt: z.iso.datetime(),
    categories: z.array(
      z.strictObject({
        id: z.uuid(),
        name: z.string(),
        active: z.boolean(),
      }),
    ),
    products: z.array(CatalogueProductSchema),
  }),
);

export const CartLineInputSchema = named(
  'CartLineInput',
  z.strictObject({
    productId: z.uuid(),
    quantity: z.int().min(1).max(99),
    expectedUnitPriceKobo: kobo.optional(),
  }),
);

export const CartSnapshotSchema = named(
  'CartSnapshot',
  z.strictObject({
    items: z.array(CartLineInputSchema),
    clientUpdatedAt: z.iso.datetime(),
    lastScreen: z.string().optional(),
  }),
);

export const CartQuoteSchema = named(
  'CartQuote',
  z.strictObject({
    lines: z.array(
      z.strictObject({
        productId: z.uuid(),
        name: z.string(),
        quantity: z.int(),
        unitPriceKobo: kobo,
        lineTotalKobo: kobo,
      }),
    ),
    itemCount: z.int(),
    totalKobo: kobo,
    priceChanges: z.array(
      z.strictObject({
        productId: z.uuid(),
        oldPriceKobo: kobo,
        newPriceKobo: kobo,
      }),
    ),
    blocked: z.array(
      z.strictObject({
        productId: z.uuid(),
        reason: z.enum(['till_only', 'category_off', 'price_updating', 'not_ready']),
      }),
    ),
    limitExceeded: z.enum(['value', 'items']).nullable(),
  }),
);

export const UnknownBarcodeBatchSchema = named(
  'UnknownBarcodeBatch',
  z.strictObject({
    items: z.array(
      z.strictObject({
        clientEventId: z.uuid(),
        barcode: z.string(),
        reason: z.enum(['not_found', 'category_off', 'till_only', 'price_stale', 'missing_weight']),
        typed: z.boolean(),
        scannedAt: z.iso.datetime(),
      }),
    ),
  }),
);

export const CreateOrderSchema = named(
  'CreateOrder',
  z.strictObject({
    sessionId: z.uuid(),
    items: z.array(CartLineInputSchema),
    channel: z.enum(['card', 'bank_transfer', 'ussd']),
  }),
);

export const OrderItemSchema = named(
  'OrderItem',
  z.strictObject({
    id: z.uuid(),
    name: z.string(),
    barcode: z.string().optional(),
    quantity: z.int(),
    unitPriceKobo: kobo,
    lineTotalKobo: kobo,
    categoryName: z.string(),
  }),
);

export const OrderSchema = named(
  'Order',
  z.strictObject({
    id: z.uuid(),
    orderNumber: z.string(),
    status: z.enum([
      'created',
      'pending',
      'paid',
      'failed',
      'exited',
      'refund_requested',
      'awaiting_head_office',
      'refunded',
      'partially_refunded',
      'disputed',
      'chargeback_won',
      'chargeback_lost',
    ]),
    branchId: z.uuid(),
    items: z.array(OrderItemSchema),
    itemCount: z.int(),
    totalKobo: kobo,
    createdAt: z.iso.datetime(),
    paidAt: z.iso.datetime().nullable().optional(),
    exitValidUntil: z.iso.datetime().nullable().optional(),
    receiptId: z.uuid().nullable().optional(),
    pendingSince: z.iso.datetime().nullable().optional(),
    pendingTooLong: z
      .boolean()
      .meta({ description: 'True after 2 minutes pending (SH-19, PAY-007).' })
      .optional(),
  }),
);

export const StartPaymentSchema = named(
  'StartPayment',
  z.strictObject({
    channel: z.enum(['card', 'bank_transfer', 'ussd']),
  }),
);

export const PaymentAttemptSchema = named(
  'PaymentAttempt',
  z.strictObject({
    attemptId: z.uuid(),
    reference: z.string(),
    accessCode: z.string().meta({ description: 'Pass to PaystackPop.resumeTransaction().' }),
    authorizationUrl: z.string().meta({ description: 'Redirect fallback (Q09).' }),
    publicKey: z.string(),
    amountKobo: kobo,
  }),
);

export const RefundSchema = named(
  'Refund',
  z.strictObject({
    id: z.uuid(),
    orderId: z.uuid(),
    receiptNumber: z.string().optional(),
    amountKobo: kobo,
    status: z.enum(['requested', 'awaiting_head_office', 'approved', 'declined', 'paid']),
    reason: z.string(),
    note: z.string().nullable().optional(),
    createdAt: z.iso.datetime(),
    needsHeadOffice: z.boolean().optional(),
    declineReason: z.string().nullable().optional(),
    paymentMethod: z
      .enum(['cash', 'bank_transfer', 'card_reversal', 'other'])
      .nullable()
      .optional(),
    paidAt: z.iso.datetime().nullable().optional(),
    recordedByName: z.string().nullable().optional(),
    ticketId: z.uuid().nullable().optional(),
  }),
);

export const ReceiptSchema = named(
  'Receipt',
  z.strictObject({
    id: z.uuid(),
    receiptNumber: z.string(),
    orderId: z.uuid(),
    store: BrandTokensSchema,
    branchName: z.string(),
    issuedAt: z.iso.datetime(),
    items: z.array(OrderItemSchema),
    itemCount: z.int().optional(),
    totalKobo: kobo,
    paymentMethod: z.string(),
    cardLast4: z.string().nullable().optional(),
    exit: z.strictObject({
      status: z.enum(['valid', 'used', 'expired', 'refunded']),
      validUntil: z.iso.datetime(),
      usedAt: z.iso.datetime().nullable().optional(),
      qrPayload: z
        .string()
        .meta({ description: 'Signed token rendered as the exit QR (NF-10).' })
        .nullable()
        .optional(),
    }),
    refund: RefundSchema.nullable().optional(),
    rating: z.int().nullable().optional(),
    ratingPrompt: z.boolean().optional(),
  }),
);

export const ReceiptListItemSchema = named(
  'ReceiptListItem',
  z.strictObject({
    id: z.uuid(),
    receiptNumber: z.string(),
    storeName: z.string(),
    branchName: z.string(),
    issuedAt: z.iso.datetime(),
    totalKobo: kobo,
    status: z.enum([
      'created',
      'pending',
      'paid',
      'failed',
      'exited',
      'refund_requested',
      'awaiting_head_office',
      'refunded',
      'partially_refunded',
      'disputed',
      'chargeback_won',
      'chargeback_lost',
    ]),
    itemCount: z.int().optional(),
    channel: z.string().optional(),
    flagged: z.boolean().optional(),
    phoneMasked: z.string().nullable().optional(),
  }),
);

export const EmailReceiptSchema = named(
  'EmailReceipt',
  z.strictObject({
    email: z.email().optional(),
  }),
);

export const RatingSchema = named(
  'Rating',
  z.strictObject({
    score: z.int().min(1).max(5),
    comment: z.string().max(500).optional(),
  }),
);

export const ExitLookupSchema = named(
  'ExitLookup',
  z.strictObject({
    qrPayload: z.string().optional(),
    receiptNumber: z.string().regex(new RegExp('^[A-Z]{2,4}-[0-9]{5,}$')).optional(),
  }),
);

export const ExitDecisionSchema = named(
  'ExitDecision',
  z.strictObject({
    checkId: z.uuid(),
    decision: z.enum(['clear', 'flagged', 'invalid']),
    invalidReason: z
      .enum(['not_paid', 'already_used', 'expired', 'other_branch', 'not_found', 'refunded'])
      .nullable()
      .optional(),
    usedAt: z.iso.datetime().nullable().optional(),
    randomCheck: z.boolean().optional(),
    largeBasket: z.boolean().optional(),
    expectedWeightGrams: z.int().nullable().optional(),
    weightRangeGrams: z
      .strictObject({
        min: z.int(),
        max: z.int(),
      })
      .nullable()
      .optional(),
    receipt: z
      .strictObject({
        receiptNumber: z.string(),
        paidAt: z.iso.datetime(),
        itemCount: z.int(),
      })
      .nullable(),
    items: z
      .array(
        z.strictObject({
          orderItemId: z.uuid(),
          name: z.string(),
          quantity: z.int(),
          flagged: z.boolean(),
          flagReason: z.string().nullable().optional(),
        }),
      )
      .optional(),
  }),
);

export const WeightEntrySchema = named(
  'WeightEntry',
  z.strictObject({
    actualWeightGrams: z.int().min(1),
  }),
);

export const WeightResultSchema = named(
  'WeightResult',
  z.strictObject({
    withinTolerance: z.boolean(),
    deltaBps: z.int(),
    requiresFullCheck: z.boolean(),
  }),
);

export const ExitCompleteSchema = named(
  'ExitComplete',
  z.strictObject({
    result: z.enum(['match', 'mismatch']),
    tickedOrderItemIds: z.array(z.uuid()),
    mismatchReasons: z
      .array(
        z.enum(['item_missing', 'extra_item', 'wrong_item', 'weight_out_of_tolerance', 'other']),
      )
      .optional(),
    notes: z.string().max(1000).optional(),
  }),
);

export const ExitCheckSchema = named(
  'ExitCheck',
  z.strictObject({
    id: z.uuid(),
    branchId: z.uuid(),
    receiptNumber: z.string().nullable().optional(),
    decision: z.enum(['clear', 'flagged', 'invalid']).optional(),
    result: z.enum(['clear', 'match', 'mismatch', 'invalid', 'abandoned']).nullable(),
    randomCheck: z.boolean().optional(),
    flagReasons: z.array(z.string()).optional(),
    expectedWeightGrams: z.int().nullable().optional(),
    actualWeightGrams: z.int().nullable().optional(),
    notes: z.string().nullable().optional(),
    checkerName: z.string(),
    startedAt: z.iso.datetime(),
    completedAt: z.iso.datetime().nullable().optional(),
    durationMs: z.int().nullable().optional(),
  }),
);

export const HeartbeatSchema = named(
  'Heartbeat',
  z.strictObject({
    sentAt: z.iso.datetime(),
    appVersion: z.string().optional(),
    networkType: z.string().optional(),
  }),
);

export const ShiftSummarySchema = named(
  'ShiftSummary',
  z.strictObject({
    checks: z.int(),
    flagged: z.int(),
    mismatches: z.int(),
    invalid: z.int(),
    clear: z.int().optional(),
    medianPaymentToExitSeconds: z.int().nullable(),
    startedAt: z.iso.datetime(),
  }),
);

export const RefundRequestSchema = named(
  'RefundRequest',
  z.strictObject({
    reason: z.enum([
      'charged_twice',
      'wrong_price',
      'item_missing',
      'changed_mind',
      'did_not_leave',
      'other',
    ]),
    note: z.string().max(1000).optional(),
    clientRequestId: z.uuid(),
    contactEmail: z.email().optional(),
  }),
);

export const RefundDecisionSchema = named(
  'RefundDecision',
  z.strictObject({
    note: z.string().max(500).optional(),
  }),
);

export const RefundDeclineSchema = named(
  'RefundDecline',
  z.strictObject({
    reason: z.string().min(5).max(500),
  }),
);

export const StoreRefundCreateSchema = named(
  'StoreRefundCreate',
  z.strictObject({
    orderId: z.uuid(),
    reason: z.enum([
      'charged_twice',
      'wrong_price',
      'item_missing',
      'changed_mind',
      'did_not_leave',
      'other',
    ]),
    note: z.string().optional(),
  }),
);

export const RefundPaymentRecordSchema = named(
  'RefundPaymentRecord',
  z.strictObject({
    method: z.enum(['cash', 'bank_transfer', 'card_reversal', 'other']),
    paidAt: z.iso.datetime(),
    reference: z.string().max(100).meta({ description: 'Required for bank_transfer.' }).optional(),
    note: z.string().max(500).optional(),
  }),
);

export const DisputeSchema = named(
  'Dispute',
  z.strictObject({
    id: z.uuid(),
    orderId: z.uuid(),
    orderNumber: z.string().optional(),
    amountKobo: kobo,
    status: z.enum(['open', 'evidence_submitted', 'awaiting_bank', 'won', 'lost', 'accepted']),
    dueAt: z.iso.datetime(),
    evidenceSubmittedAt: z.iso.datetime().nullable().optional(),
    liability: z.enum(['store', 'skipa']).optional(),
    category: z.string().nullable().optional(),
  }),
);

export const FaqMatchRequestSchema = named(
  'FaqMatchRequest',
  z.strictObject({
    query: z.string().max(300),
    screen: z.string(),
    branchId: z.uuid().nullable().optional(),
    orderId: z.uuid().nullable().optional(),
  }),
);

export const FaqMatchSchema = named(
  'FaqMatch',
  z.strictObject({
    matched: z.boolean(),
    faqId: z.uuid().nullable().optional(),
    answer: z.string().nullable().optional(),
    confidence: z.number(),
    offerSupport: z.boolean(),
    paymentState: z
      .enum([
        'created',
        'pending',
        'paid',
        'failed',
        'exited',
        'refund_requested',
        'awaiting_head_office',
        'refunded',
        'partially_refunded',
        'disputed',
        'chargeback_won',
        'chargeback_lost',
      ])
      .nullable()
      .optional(),
  }),
);

export const FaqSchema = named(
  'Faq',
  z.strictObject({
    id: z.uuid(),
    question: z.string(),
    answer: z.string(),
    keywords: z.array(z.string()).optional(),
    screens: z.array(z.string()).optional(),
    orderStates: z.array(z.string()).optional(),
    offerSupport: z.boolean().optional(),
    active: z.boolean().optional(),
  }),
);

export const FaqInputSchema = named(
  'FaqInput',
  z.strictObject({
    question: z.string(),
    answer: z.string(),
    keywords: z.array(z.string()).optional(),
    screens: z.array(z.string()).optional(),
    orderStates: z.array(z.string()).optional(),
    offerSupport: z.boolean().optional(),
    active: z.boolean().optional(),
  }),
);

export const TicketCreateSchema = named(
  'TicketCreate',
  z.strictObject({
    branchId: z.uuid(),
    orderId: z.uuid().nullable().optional(),
    category: z.enum(['payment', 'refund', 'wrong_price', 'exit', 'app', 'other']),
    message: z.string().max(4000),
    guestEmail: z.email().meta({ description: 'Optional (HP-09 v2).' }).optional(),
    chatTranscript: z
      .array(
        z.strictObject({
          from: z.enum(['shopper', 'bot']),
          text: z.string(),
        }),
      )
      .optional(),
    recentRequestIds: z.array(z.string()).optional(),
    clientRequestId: z.uuid(),
  }),
);

export const TicketSchema = named(
  'Ticket',
  z.strictObject({
    id: z.uuid(),
    ticketNumber: z.string(),
    status: z.enum(['new', 'in_progress', 'waiting_for_shopper', 'resolved']),
    category: z.string(),
    branchId: z.uuid(),
    storeName: z.string().optional(),
    orderId: z.uuid().nullable().optional(),
    context: z
      .looseObject({})
      .meta({ description: 'HP-08 snapshot (store view only).' })
      .optional(),
    firstReplyDueAt: z.iso.datetime().optional(),
    lastMessageAt: z.iso.datetime().optional(),
    unreadForShopper: z.boolean().optional(),
    createdAt: z.iso.datetime(),
    resolvedAt: z.iso.datetime().nullable().optional(),
    rating: z.int().nullable().optional(),
  }),
);

export const TicketMessageSchema = named(
  'TicketMessage',
  z.strictObject({
    id: z.uuid(),
    authorType: z.enum(['shopper', 'store', 'skipa', 'bot', 'system']),
    authorName: z.string().optional(),
    body: z.string(),
    internalNote: z.boolean().optional(),
    createdAt: z.iso.datetime(),
  }),
);

export const MessageCreateSchema = named(
  'MessageCreate',
  z.strictObject({
    body: z.string().max(4000),
    clientMessageId: z.uuid(),
    internalNote: z.boolean().optional(),
  }),
);

export const TicketPatchSchema = named(
  'TicketPatch',
  z.strictObject({
    status: z.enum(['in_progress', 'waiting_for_shopper', 'resolved']),
  }),
);

export const StarsSchema = named(
  'Stars',
  z.strictObject({
    total: z.int(),
    byStore: z.array(
      z.strictObject({
        organisationId: z.uuid(),
        storeName: z.string(),
        stars: z.int(),
      }),
    ),
    recent: z.array(
      z.strictObject({
        delta: z.int(),
        reason: z.string(),
        storeName: z.string(),
        createdAt: z.iso.datetime(),
      }),
    ),
  }),
);

export const VisitedStoreSchema = named(
  'VisitedStore',
  z.strictObject({
    organisationId: z.uuid(),
    storeName: z.string(),
    logoUrl: z.string().nullable().optional(),
    lastVisitAt: z.iso.datetime(),
    lastBranchId: z.uuid().optional(),
  }),
);

export const DataRequestSchema = named(
  'DataRequest',
  z.strictObject({
    id: z.uuid(),
    type: z.enum(['export', 'delete']),
    status: z.enum(['received', 'in_progress', 'completed', 'rejected']),
    dueAt: z.iso.datetime(),
    downloadUrl: z.string().nullable().optional(),
  }),
);

export const TourProgressSchema = named(
  'TourProgress',
  z.strictObject({
    status: z.enum(['seen', 'skipped', 'completed']),
    stepReached: z.int(),
    replay: z.boolean().optional(),
  }),
);

export const ClientEventSchema = named(
  'ClientEvent',
  z.strictObject({
    clientEventId: z.uuid(),
    name: z.string().regex(new RegExp('^[a-z]+(_[a-z]+)+$')),
    occurredAt: z.iso.datetime(),
    sessionId: z.uuid().nullable().optional(),
    branchId: z.uuid().nullable().optional(),
    screen: z.string().optional(),
    networkType: z.string().optional(),
    properties: z.looseObject({}),
  }),
);

export const EventBatchSchema = named(
  'EventBatch',
  z.strictObject({
    events: z.array(ClientEventSchema).max(100),
  }),
);

export const StoreSearchResultSchema = named(
  'StoreSearchResult',
  z.strictObject({
    branchId: z.uuid(),
    organisationId: z.uuid().optional(),
    storeName: z.string(),
    branchName: z.string(),
    area: z.string(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    openNow: z.boolean().optional(),
    openingHoursToday: z.string().optional(),
    skipaStatus: z.enum(['on', 'off']),
    logoUrl: z.string().nullable().optional(),
  }),
);

export const AlertSchema = named(
  'Alert',
  z.strictObject({
    id: z.uuid(),
    severity: z.enum(['critical', 'high', 'medium', 'low', 'store']),
    code: z.string(),
    title: z.string(),
    body: z.string(),
    linkPath: z.string().nullable().optional(),
    status: z.enum(['open', 'acknowledged', 'resolved']),
    occurrences: z.int().optional(),
    firstSeenAt: z.iso.datetime(),
    lastSeenAt: z.iso.datetime().optional(),
  }),
);

export const LiveSnapshotSchema = named(
  'LiveSnapshot',
  z.strictObject({
    needsAction: z.array(AlertSchema),
    today: z.strictObject({
      salesKobo: kobo,
      receipts: z.int(),
      shoppers: z.int(),
      exitChecks: z.int(),
      mismatches: z.int(),
    }),
    shoppersInStore: z.int(),
    paymentsConfirming: z.int(),
    exitDevices: z.array(
      z.strictObject({
        id: z.uuid(),
        label: z.string(),
        status: z.enum(['online', 'offline']),
        lastHeartbeatAt: z.iso.datetime().nullable().optional(),
      }),
    ),
  }),
);

export const ReceiptTraceSchema = named(
  'ReceiptTrace',
  z.strictObject({
    receipt: ReceiptSchema,
    order: OrderSchema,
    timeline: z.array(
      z.strictObject({
        at: z.iso.datetime(),
        label: z.string(),
        actor: z.string(),
      }),
    ),
    payment: z.strictObject({
      reference: z.string(),
      channel: z.string(),
      amountKobo: kobo,
      paystackFeesKobo: kobo.nullable().optional(),
      skipaFeeKobo: kobo.optional(),
      cardBin: z.string().nullable().optional(),
      cardLast4: z.string().nullable().optional(),
    }),
    exitChecks: z.array(ExitCheckSchema),
    posPosting: z.strictObject({
      status: z.string(),
      posReference: z.string().nullable().optional(),
      postedAt: z.iso.datetime().nullable().optional(),
    }),
    refund: RefundSchema.nullable().optional(),
    disputes: z.array(DisputeSchema).optional(),
    payout: z
      .strictObject({
        date: z.iso.date(),
        payoutKobo: kobo,
      })
      .nullable()
      .optional(),
  }),
);

export const CheckerSignalSchema = named(
  'CheckerSignal',
  z.strictObject({
    userId: z.uuid(),
    name: z.string(),
    signal: z.enum(['low_mismatch_rate', 'fast_flagged_checks', 'large_basket_not_weighed']),
    metrics: z.looseObject({}),
    windowEnd: z.iso.datetime(),
  }),
);

export const CategorySchema = named(
  'Category',
  z.strictObject({
    id: z.uuid(),
    name: z.string(),
    kind: z.enum(['standard', 'custom']),
    checkLevel: z.enum(['standard', 'extra']),
    checkLevelFloor: z.enum(['standard', 'extra']),
    branches: z.array(
      z.strictObject({
        branchId: z.uuid(),
        active: z.boolean(),
        activatedAt: z.iso.datetime().nullable().optional(),
      }),
    ),
    readiness: z
      .strictObject({
        ready: z.int(),
        missingWeight: z.int(),
        missingBarcode: z.int(),
        outOfStock: z.int(),
        tillOnly: z.int(),
      })
      .optional(),
  }),
);

export const CategoryCreateSchema = named(
  'CategoryCreate',
  z.strictObject({
    name: z.string(),
    checkLevel: z.enum(['standard', 'extra']).optional(),
    productIds: z.array(z.uuid()).optional(),
    barcodes: z.array(z.string()).optional(),
    posDepartments: z.array(z.string()).optional(),
  }),
);

export const CategoryPatchSchema = named(
  'CategoryPatch',
  z.strictObject({
    name: z.string().optional(),
    checkLevel: z.enum(['standard', 'extra']).optional(),
    addProductIds: z.array(z.uuid()).optional(),
    removeProductIds: z.array(z.uuid()).optional(),
  }),
);

export const BranchCategoryToggleSchema = named(
  'BranchCategoryToggle',
  z.strictObject({
    active: z.boolean(),
    reason: z.string(),
  }),
);

export const ProductSchema = named(
  'Product',
  z.strictObject({
    id: z.uuid(),
    name: z.string(),
    barcode: z.string().nullable(),
    categoryId: z.uuid().nullable(),
    posDepartment: z.string().nullable().optional(),
    weightGrams: z.int().nullable().optional(),
    extraChecks: z.boolean(),
    soldThroughSkipa: z.boolean(),
    readiness: z.enum([
      'ready',
      'missing_weight',
      'missing_barcode',
      'variable_price',
      'sold_by_weight',
      'category_off',
      'till_only',
      'price_stale',
    ]),
    branchPrices: z
      .array(
        z.strictObject({
          branchId: z.uuid(),
          priceKobo: kobo,
          priceSyncedAt: z.iso.datetime(),
          stockQty: z.int().nullable().optional(),
        }),
      )
      .optional(),
  }),
);

export const ProductPatchSchema = named(
  'ProductPatch',
  z.strictObject({
    extraChecks: z.boolean().optional(),
    soldThroughSkipa: z.boolean().optional(),
    weightGrams: z.int().min(1).optional(),
    categoryId: z.uuid().optional(),
    reason: z.string(),
  }),
);

export const BaselineSchema = named(
  'Baseline',
  z.strictObject({
    branchId: z.uuid(),
    categoryId: z.uuid(),
    periodStart: z.iso.date(),
    periodEnd: z.iso.date(),
    salesKobo: kobo,
    lossKobo: kobo,
    agreedMarginBps: z.int().optional(),
  }),
);

export const LossCountSchema = named(
  'LossCount',
  z.strictObject({
    branchId: z.uuid(),
    categoryId: z.uuid(),
    weekStart: z.iso.date(),
    lossKobo: kobo,
  }),
);

export const StaffMemberSchema = named(
  'StaffMember',
  z.strictObject({
    id: z.uuid(),
    name: z.string(),
    email: z.string(),
    role: z.enum([
      'exit_checker',
      'store_manager',
      'head_office_admin',
      'super_admin',
      'support_agent',
    ]),
    status: z.enum(['pending', 'active', 'suspended', 'removed']),
    branchIds: z.array(z.uuid()),
    invitedAt: z.iso.datetime().nullable().optional(),
    lastSignInAt: z.iso.datetime().nullable().optional(),
    activeSessions: z.int().optional(),
  }),
);

export const StaffInviteSchema = named(
  'StaffInvite',
  z.strictObject({
    name: z.string(),
    email: z.email(),
    role: z.enum(['exit_checker', 'store_manager', 'head_office_admin']),
    branchIds: z.array(z.uuid()),
  }),
);

export const StaffPatchSchema = named(
  'StaffPatch',
  z.strictObject({
    status: z.enum(['active', 'suspended']).optional(),
    role: z.enum(['exit_checker', 'store_manager', 'head_office_admin']).optional(),
    branchIds: z.array(z.uuid()).optional(),
    reason: z.string(),
  }),
);

export const BranchSettingsSchema = named(
  'BranchSettings',
  z.strictObject({
    cartMaxValueKobo: kobo.optional(),
    cartMaxItems: z.int().optional(),
    ruleExtraChecksEnabled: z.boolean().optional(),
    rulePriceThresholdEnabled: z.boolean().optional(),
    priceThresholdKobo: kobo.optional(),
    ruleItemCountEnabled: z.boolean().optional(),
    largeBasketItems: z.int().optional(),
    ruleBasketValueEnabled: z.boolean().optional(),
    basketValueThresholdKobo: kobo.optional(),
    rulePreviousMismatchEnabled: z.boolean().optional(),
    randomCheckRatePct: z.literal([1, 2, 5, 10, 15, 20]).optional(),
    weightToleranceBps: z.int().optional(),
    exitWindowMinutes: z.int().optional(),
    sessionTimeoutMinutes: z.int().optional(),
    exitSessionIdleHours: z.int().optional(),
    refundHeadOfficeThresholdKobo: kobo.optional(),
    supportFirstReplyMinutes: z.int().optional(),
    stalePriceHours: z.int().optional(),
    channelCardEnabled: z.boolean().optional(),
    channelTransferEnabled: z.boolean().optional(),
    channelUssdEnabled: z.boolean().optional(),
  }),
);

export const SettingsPatchSchema = named(
  'SettingsPatch',
  z.strictObject({
    settings: BranchSettingsSchema,
    reason: z.string().min(3),
  }),
);

export const SwitchOffSchema = named(
  'SwitchOff',
  z.strictObject({
    reason: z.string().min(3).max(300),
  }),
);

export const QrCodeSchema = named(
  'QrCode',
  z.strictObject({
    id: z.uuid(),
    code: z.string(),
    locationLabel: z.string(),
    active: z.boolean(),
    scans7d: z.int(),
    signsPrinted: z.int().optional(),
    lastPrintedAt: z.iso.datetime().nullable().optional(),
  }),
);

export const QrCodeCreateSchema = named(
  'QrCodeCreate',
  z.strictObject({
    locationLabel: z.string(),
  }),
);

export const NotificationPreferenceSchema = named(
  'NotificationPreference',
  z.strictObject({
    alertKey: z.string(),
    inApp: z.boolean(),
    email: z.boolean(),
    critical: z.boolean(),
  }),
);

export const BrandingDraftSchema = named(
  'BrandingDraft',
  z.strictObject({
    displayName: z.string(),
    primaryColor: z.string().regex(new RegExp('^#[0-9A-F]{6}$')),
    accentColor: z.string().regex(new RegExp('^#[0-9A-F]{6}$')),
    logoSquareAssetId: z.uuid().nullable().optional(),
    logoWideAssetId: z.uuid().nullable().optional(),
    coverAssetId: z.uuid().nullable().optional(),
    welcomeMessage: z.string().max(140).optional(),
    receiptHeader: z.string().optional(),
    receiptFooter: z.string().optional(),
    socialLinks: z.looseObject({}).optional(),
    qrSignDesign: z.looseObject({}).optional(),
  }),
);

export const ContrastReportSchema = named(
  'ContrastReport',
  z.strictObject({
    passes: z.boolean(),
    pairs: z.array(
      z.strictObject({
        name: z.string(),
        ratio: z.number(),
        required: z.number(),
        passes: z.boolean(),
        suggested: z.string().nullable().optional(),
      }),
    ),
  }),
);

export const BrandingVersionSchema = named(
  'BrandingVersion',
  z.strictObject({
    id: z.uuid(),
    version: z.int(),
    status: z.enum(['draft', 'published', 'superseded']),
    draft: BrandingDraftSchema,
    tokens: BrandTokensSchema,
    contrast: ContrastReportSchema,
    publishedAt: z.iso.datetime().nullable().optional(),
    publishedByName: z.string().nullable().optional(),
  }),
);

export const UploadedAssetSchema = named(
  'UploadedAsset',
  z.strictObject({
    assetId: z.uuid(),
    url: z.string(),
    bytes: z.int(),
    width: z.int().optional(),
    height: z.int().optional(),
  }),
);

export const ReconDaySchema = named(
  'ReconDay',
  z.strictObject({
    date: z.iso.date(),
    receipts: z.int(),
    salesKobo: kobo,
    posSalesKobo: kobo,
    payoutKobo: kobo.nullable(),
    unmatched: z.int(),
    status: z.enum(['matched', 'mismatch', 'awaiting_payout', 'resolved']),
  }),
);

export const ReconItemSchema = named(
  'ReconItem',
  z.strictObject({
    id: z.uuid(),
    subjectType: z.string(),
    subjectId: z.uuid(),
    reference: z.string().optional(),
    amountKobo: kobo.optional(),
    cause: z.string(),
    detail: z.string(),
    status: z.enum(['open', 'resolved']),
    receiptOk: z.boolean(),
    posOk: z.boolean(),
    paystackOk: z.boolean(),
    liability: z.enum(['store', 'skipa']).nullable().optional(),
  }),
);

export const ReconResolveSchema = named(
  'ReconResolve',
  z.strictObject({
    reason: z.string().min(10),
  }),
);

export const PayoutReportSchema = named(
  'PayoutReport',
  z.strictObject({
    date: z.iso.date(),
    receipts: z.int(),
    salesKobo: kobo,
    paystackFeesKobo: kobo,
    skipaFeeKobo: kobo,
    chargebacksKobo: kobo,
    payoutKobo: kobo,
    refundsPaidByStoreKobo: kobo,
    status: z.enum(['tied', 'mismatch', 'awaiting_payout']),
    bankLast4: z.string().nullable().optional(),
  }),
);

export const ShiftCloseSchema = named(
  'ShiftClose',
  z.strictObject({
    date: z.iso.date(),
    branchId: z.uuid(),
    sales: z.strictObject({
      count: z.int(),
      amountKobo: kobo,
    }),
    byChannel: z.array(
      z.strictObject({
        channel: z.string(),
        count: z.int(),
        amountKobo: kobo,
      }),
    ),
    refunds: z.strictObject({
      count: z.int(),
      amountKobo: kobo,
    }),
    itemsSold: z.int(),
  }),
);

export const PosHealthSchema = named(
  'PosHealth',
  z.strictObject({
    mode: z.enum(['api', 'file']),
    connector: z.string().optional(),
    status: z.enum(['testing', 'live', 'failing', 'disabled']),
    lastSyncAt: z.iso.datetime().nullable(),
    lastSuccessAt: z.iso.datetime().nullable().optional(),
    failures24h: z.int(),
    pendingPostings: z.int().optional(),
  }),
);

export const PosFileSchema = named(
  'PosFile',
  z.strictObject({
    id: z.uuid(),
    kind: z.enum(['products', 'sales_refunds', 'shift_close', 'weights']),
    direction: z.enum(['inbound', 'outbound']),
    businessDate: z.iso.date().nullable().optional(),
    status: z.string(),
    rowCount: z.int().optional(),
    createdAt: z.iso.datetime(),
    downloadUrl: z.string().nullable().optional(),
  }),
);

export const ReportSchema = named(
  'Report',
  z.strictObject({
    report: z.string(),
    from: z.iso.date(),
    to: z.iso.date(),
    branchId: z.uuid().nullable().optional(),
    series: z.array(
      z.strictObject({
        key: z.string(),
        points: z.array(
          z.strictObject({
            x: z.string(),
            y: z.number(),
          }),
        ),
      }),
    ),
    totals: z.looseObject({}),
    definitions: z
      .looseObject({})
      .meta({ description: 'Metric dictionary entries (AN-08).' })
      .optional(),
  }),
);

export const ShopperForStoreSchema = named(
  'ShopperForStore',
  z.strictObject({
    shopperRef: z.string(),
    name: z.string(),
    phoneMasked: z.string().optional(),
    visits: z.int(),
    stars: z.int(),
    lastVisitAt: z.iso.datetime(),
  }),
);

export const ExportCreateSchema = named(
  'ExportCreate',
  z.strictObject({
    dataset: z.enum([
      'receipts',
      'exit_checks',
      'refunds',
      'disputes',
      'support_tickets',
      'shoppers',
      'reconciliation',
      'audit_log',
      'transactions',
      'stores',
    ]),
    format: z.enum(['csv', 'xlsx']),
    filters: z.looseObject({}),
  }),
);

export const ExportSchema = named(
  'Export',
  z.strictObject({
    id: z.uuid(),
    status: z.enum(['queued', 'running', 'ready', 'failed', 'expired']),
    dataset: z.string(),
    format: z.string(),
    rowCount: z.int().nullable().optional(),
    downloadUrl: z.string().nullable().optional(),
    createdAt: z.iso.datetime(),
  }),
);

export const AuditEntrySchema = named(
  'AuditEntry',
  z.strictObject({
    id: z.uuid(),
    occurredAt: z.iso.datetime(),
    actorName: z.string(),
    actorRole: z.string(),
    action: z.string(),
    targetType: z.string(),
    targetId: z.uuid().nullable().optional(),
    branchId: z.uuid().nullable().optional(),
    before: z.looseObject({}).nullable().optional(),
    after: z.looseObject({}).nullable().optional(),
    reason: z.string().nullable().optional(),
  }),
);

export const AdminAccessEntrySchema = named(
  'AdminAccessEntry',
  z.strictObject({
    id: z.uuid(),
    adminName: z.string(),
    subjectType: z.string().optional(),
    reason: z.string(),
    grantedAt: z.iso.datetime(),
  }),
);

export const OrganisationSchema = named(
  'Organisation',
  z.strictObject({
    id: z.uuid(),
    name: z.string(),
    legalName: z.string().optional(),
    status: z.enum(['onboarding', 'pilot', 'live', 'paused', 'ended']),
    plan: z.enum(['pilot', 'paid']),
    pilotEndsOn: z.iso.date().nullable().optional(),
    platformFeeBps: z.int(),
    paystackSubaccountCode: z.string().nullable().optional(),
    posMode: z.enum(['api', 'file']).nullable().optional(),
    posConnector: z.string().nullable().optional(),
    branches: z.int().optional(),
    syncHealth: z.string().optional(),
    sales30dKobo: kobo.optional(),
    adoptionPct: z.number().nullable().optional(),
  }),
);

export const OrganisationCreateSchema = named(
  'OrganisationCreate',
  z.strictObject({
    name: z.string(),
    legalName: z.string(),
    plan: z.enum(['pilot', 'paid']),
    pilotEndsOn: z.iso.date().optional(),
    platformFeeBps: z.int().min(0).max(2000).optional(),
    headOfficeEmail: z.email(),
    headOfficeName: z.string().optional(),
  }),
);

export const OrganisationPatchSchema = named(
  'OrganisationPatch',
  z.strictObject({
    name: z.string().optional(),
    status: z.enum(['onboarding', 'pilot', 'live', 'paused', 'ended']).optional(),
    platformFeeBps: z.int().optional(),
    reason: z.string(),
  }),
);

export const PlanChangeSchema = named(
  'PlanChange',
  z.strictObject({
    plan: z.enum(['pilot', 'paid']),
    pilotEndsOn: z.iso.date().optional(),
    platformFeeBps: z.int().optional(),
    reason: z.string(),
  }),
);

export const SubaccountCreateSchema = named(
  'SubaccountCreate',
  z.strictObject({
    bankCode: z.string(),
    accountNumber: z.string().regex(new RegExp('^[0-9]{10}$')),
  }),
);

export const BranchCreateSchema = named(
  'BranchCreate',
  z.strictObject({
    code: z.string().regex(new RegExp('^[A-Z]{2,4}$')),
    name: z.string(),
    addressLine: z.string(),
    area: z.string(),
    city: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    phone: z.string().optional(),
    openingHours: z.looseObject({}).optional(),
  }),
);

export const OnboardingChecklistSchema = named(
  'OnboardingChecklist',
  z.strictObject({
    organisationId: z.uuid(),
    steps: z.array(
      z.strictObject({
        key: z.enum([
          'agreement_signed',
          'paystack_subaccount',
          'pos_connected',
          'catalogue_imported',
          'weights_complete',
          'baselines_collected',
          'staff_invited',
          'qr_printed',
          'go_live_approved',
        ]),
        label: z.string(),
        status: z.enum(['done', 'now', 'todo', 'not_applicable']),
        completedAt: z.iso.datetime().nullable().optional(),
        note: z.string().nullable().optional(),
      }),
    ),
  }),
);

export const OnboardingStepUpdateSchema = named(
  'OnboardingStepUpdate',
  z.strictObject({
    status: z.enum(['done', 'todo', 'not_applicable']),
    note: z.string().optional(),
  }),
);

export const PersonalDataAccessRequestSchema = named(
  'PersonalDataAccessRequest',
  z.strictObject({
    subjectType: z.enum(['shopper', 'organisation_shoppers', 'order']),
    subjectId: z.uuid().nullable().optional(),
    organisationId: z.uuid().nullable().optional(),
    reason: z.string().min(10),
  }),
);

export const PersonalDataAccessGrantSchema = named(
  'PersonalDataAccessGrant',
  z.strictObject({
    grantToken: z.string().meta({ description: 'Send as X-Skipa-Access-Grant.' }),
    expiresAt: z.iso.datetime(),
  }),
);

export const ShopperAdminSchema = named(
  'ShopperAdmin',
  z.strictObject({
    id: z.uuid(),
    name: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    phoneMasked: z.string(),
    email: z.string().nullable().optional(),
    status: z.enum(['active', 'suspended', 'deleted']),
    receipts: z.int(),
    stars: z.int(),
    storesVisited: z.int().optional(),
    createdAt: z.iso.datetime().optional(),
  }),
);

export const SuspendShopperSchema = named(
  'SuspendShopper',
  z.strictObject({
    reason: z.string().min(10),
  }),
);

export const BillingStatementSchema = named(
  'BillingStatement',
  z.strictObject({
    organisationId: z.uuid(),
    storeName: z.string().optional(),
    month: z.iso.date(),
    settledSalesKobo: kobo,
    feeRateBps: z.int(),
    feeExpectedKobo: kobo,
    feeSplitByPaystackKobo: kobo,
    status: z.enum(['matched', 'mismatch', 'pilot_no_fee']),
  }),
);

export const ReserveSummarySchema = named(
  'ReserveSummary',
  z.strictObject({
    balanceKobo: z.int(),
    lowWaterMarkKobo: kobo,
    entries: z.array(
      z.strictObject({
        id: z.uuid(),
        entryType: z.string(),
        amountKobo: z.int(),
        note: z.string(),
        createdAt: z.iso.datetime(),
      }),
    ),
  }),
);

export const ReserveEntryCreateSchema = named(
  'ReserveEntryCreate',
  z.strictObject({
    entryType: z.enum(['top_up', 'recovery_credit', 'adjustment']),
    amountKobo: z.int(),
    note: z.string(),
  }),
);

export const ReceivableSchema = named(
  'Receivable',
  z.strictObject({
    organisationId: z.uuid(),
    storeName: z.string().optional(),
    balanceKobo: z.int(),
    openItems: z.int().optional(),
  }),
);

export const FeatureFlagSchema = named(
  'FeatureFlag',
  z.strictObject({
    key: z.string(),
    description: z.string(),
    enabled: z.boolean(),
    rollout: z.strictObject({
      organisationIds: z.array(z.uuid()).optional(),
      branchIds: z.array(z.uuid()).optional(),
      percent: z.int().min(0).max(100).optional(),
    }),
    updatedAt: z.iso.datetime().optional(),
  }),
);

export const FeatureFlagPatchSchema = named(
  'FeatureFlagPatch',
  z.strictObject({
    enabled: z.boolean().optional(),
    rollout: z.looseObject({}).optional(),
    reason: z.string(),
  }),
);

export const PlatformSettingsSchema = named(
  'PlatformSettings',
  z.strictObject({
    defaults: z.looseObject({}).optional(),
    timeouts: z.looseObject({}).optional(),
    emailDailyReserve: z.int().optional(),
    chargebackReserveLowWaterKobo: kobo.optional(),
  }),
);

export const StandardCategorySchema = named(
  'StandardCategory',
  z.strictObject({
    id: z.uuid(),
    key: z.string(),
    name: z.string(),
    description: z.string().optional(),
    defaultCheckLevel: z.enum(['standard', 'extra']),
    active: z.boolean(),
  }),
);

export const TemplateSchema = named(
  'Template',
  z.strictObject({
    key: z.string(),
    channel: z.enum(['email', 'sms', 'telegram', 'in_app']),
    version: z.int(),
    subject: z.string().nullable().optional(),
    body: z.string(),
    active: z.boolean(),
  }),
);

export const TemplateInputSchema = named(
  'TemplateInput',
  z.strictObject({
    subject: z.string().optional(),
    body: z.string(),
    activate: z.boolean().optional(),
  }),
);

export const LoyaltyRulesSchema = named(
  'LoyaltyRules',
  z.strictObject({
    version: z.int(),
    perVisit: z.int(),
    dailyCapPerStore: z.int(),
    bonuses: z.array(z.looseObject({})).optional(),
    tiersEnabled: z.boolean(),
    effectiveFrom: z.iso.datetime().optional(),
  }),
);

export const ErrorSummarySchema = named(
  'ErrorSummary',
  z.strictObject({
    code: z.string(),
    message: z.string(),
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    count: z.int(),
    storeName: z.string().nullable().optional(),
    lastSeenAt: z.iso.datetime(),
    release: z.string().optional(),
    glitchtipUrl: z.string().nullable().optional(),
  }),
);

export const ServiceHealthSchema = named(
  'ServiceHealth',
  z.strictObject({
    service: z.string(),
    status: z.enum(['ok', 'warn', 'bad']),
    detail: z.string().optional(),
  }),
);

export const ViewAsRequestSchema = named(
  'ViewAsRequest',
  z.strictObject({
    organisationId: z.uuid(),
    branchId: z.uuid().nullable().optional(),
    reason: z.string().min(10),
  }),
);

export const ViewAsGrantSchema = named(
  'ViewAsGrant',
  z.strictObject({
    token: z.string(),
    expiresAt: z.iso.datetime(),
  }),
);

export const PlatformSwitchSchema = named(
  'PlatformSwitch',
  z.strictObject({
    enabled: z.boolean(),
    reason: z.string().min(10),
    confirmation: z
      .string()
      .meta({ description: "Must equal 'SWITCH OFF SKIPA' to switch off (SA-05)." }),
  }),
);

export const UserAdminSchema = named(
  'UserAdmin',
  z.strictObject({
    id: z.uuid(),
    name: z.string(),
    email: z.string(),
    role: z.enum([
      'exit_checker',
      'store_manager',
      'head_office_admin',
      'super_admin',
      'support_agent',
    ]),
    organisationName: z.string().nullable().optional(),
    status: z.string(),
    lastSignInAt: z.iso.datetime().nullable().optional(),
    activeSessions: z.int().optional(),
  }),
);

export const TotpEnrollmentSchema = named(
  'TotpEnrollment',
  z.strictObject({
    otpauthUrl: z.string(),
    secretBase32: z.string(),
  }),
);

export const TotpVerifySchema = named(
  'TotpVerify',
  z.strictObject({
    code: z.string().regex(new RegExp('^[0-9]{6}$')),
  }),
);

export const InviteInfoSchema = named(
  'InviteInfo',
  z.strictObject({
    email: z.string(),
    role: z.enum([
      'exit_checker',
      'store_manager',
      'head_office_admin',
      'super_admin',
      'support_agent',
    ]),
    organisationName: z.string().nullable(),
    status: z.enum(['pending', 'accepted', 'cancelled', 'expired']),
  }),
);

export const SessionInfoSchema = named(
  'SessionInfo',
  z.strictObject({
    id: z.uuid(),
    surface: z.string(),
    createdAt: z.iso.datetime(),
    lastSeenAt: z.iso.datetime(),
    userAgent: z.string().nullable().optional(),
    current: z.boolean(),
  }),
);

export const RealtimeEventSchema = named(
  'RealtimeEvent',
  z.strictObject({
    id: z.string(),
    type: z.enum([
      'order.updated',
      'receipt.issued',
      'exit.check_recorded',
      'exit.device_status',
      'refund.updated',
      'ticket.message',
      'ticket.updated',
      'alert.raised',
      'live.counters',
      'branch.status',
      'catalogue.updated',
    ]),
    at: z.iso.datetime(),
    data: z.looseObject({}),
  }),
);

export const HealthSchema = named(
  'Health',
  z.strictObject({
    status: z.enum(['ok', 'degraded', 'down']),
    checks: z.looseObject({}).optional(),
    release: z.string().optional(),
  }),
);

export const PageReceiptListItemSchema = named(
  'PageReceiptListItem',
  z.strictObject({
    data: z.array(ReceiptListItemSchema),
    nextCursor: z.string().nullable(),
  }),
);

export const PageTicketSchema = named(
  'PageTicket',
  z.strictObject({
    data: z.array(TicketSchema),
    nextCursor: z.string().nullable(),
  }),
);

export const PageAlertSchema = named(
  'PageAlert',
  z.strictObject({
    data: z.array(AlertSchema),
    nextCursor: z.string().nullable(),
  }),
);

export const PageExitCheckSchema = named(
  'PageExitCheck',
  z.strictObject({
    data: z.array(ExitCheckSchema),
    nextCursor: z.string().nullable(),
  }),
);

export const PageRefundSchema = named(
  'PageRefund',
  z.strictObject({
    data: z.array(RefundSchema),
    nextCursor: z.string().nullable(),
  }),
);

export const PageDisputeSchema = named(
  'PageDispute',
  z.strictObject({
    data: z.array(DisputeSchema),
    nextCursor: z.string().nullable(),
  }),
);

export const PageProductSchema = named(
  'PageProduct',
  z.strictObject({
    data: z.array(ProductSchema),
    nextCursor: z.string().nullable(),
  }),
);

export const PageReconItemSchema = named(
  'PageReconItem',
  z.strictObject({
    data: z.array(ReconItemSchema),
    nextCursor: z.string().nullable(),
  }),
);

export const PageShopperForStoreSchema = named(
  'PageShopperForStore',
  z.strictObject({
    data: z.array(ShopperForStoreSchema),
    nextCursor: z.string().nullable(),
  }),
);

export const PageAuditEntrySchema = named(
  'PageAuditEntry',
  z.strictObject({
    data: z.array(AuditEntrySchema),
    nextCursor: z.string().nullable(),
  }),
);

export const PageAdminAccessEntrySchema = named(
  'PageAdminAccessEntry',
  z.strictObject({
    data: z.array(AdminAccessEntrySchema),
    nextCursor: z.string().nullable(),
  }),
);

export const PageOrganisationSchema = named(
  'PageOrganisation',
  z.strictObject({
    data: z.array(OrganisationSchema),
    nextCursor: z.string().nullable(),
  }),
);

export const PageShopperAdminSchema = named(
  'PageShopperAdmin',
  z.strictObject({
    data: z.array(ShopperAdminSchema),
    nextCursor: z.string().nullable(),
  }),
);

export const PageUserAdminSchema = named(
  'PageUserAdmin',
  z.strictObject({
    data: z.array(UserAdminSchema),
    nextCursor: z.string().nullable(),
  }),
);
