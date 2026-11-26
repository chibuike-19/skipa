// Drizzle schema: mirrors db/migrations (0000_init = db/schema.sql) table for table.
// Generated with `drizzle-kit pull` from the migrated database, then post-processed:
// citext/bytea/tsvector custom types, timestamps as Date, default operator classes.
// test/int/db/drizzle-schema.int.test.ts fails if this file drifts from the database.
// Triggers, RLS policies' behaviour and partitions live only in the SQL migrations.
import { bytea, citext, tsvector } from './types.ts';
import {
  pgTable,
  text,
  jsonb,
  uuid,
  timestamp,
  boolean,
  uniqueIndex,
  unique,
  check,
  integer,
  date,
  index,
  foreignKey,
  smallint,
  bigint,
  pgPolicy,
  numeric,
  char,
  pgSchema,
  inet,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const pii = pgSchema('pii');
export const audit = pgSchema('audit');
export const analytics = pgSchema('analytics');

export const platformSettings = pgTable('platform_settings', {
  key: text().primaryKey().notNull(),
  value: jsonb().notNull(),
  updatedBy: uuid('updated_by'),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const featureFlags = pgTable('feature_flags', {
  key: text().primaryKey().notNull(),
  description: text().notNull(),
  enabled: boolean().default(false).notNull(),
  rollout: jsonb().default({}).notNull(),
  updatedBy: uuid('updated_by'),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const notificationTemplates = pgTable(
  'notification_templates',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    key: text().notNull(),
    channel: text().notNull(),
    locale: text().default('en').notNull(),
    version: integer().notNull(),
    subject: text(),
    body: text().notNull(),
    active: boolean().default(false).notNull(),
    updatedBy: uuid('updated_by'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('notification_templates_one_active')
      .using(
        'btree',
        table.key.asc().nullsLast(),
        table.channel.asc().nullsLast(),
        table.locale.asc().nullsLast(),
      )
      .where(sql`active`),
    unique('notification_templates_key_channel_locale_version_key').on(
      table.channel,
      table.key,
      table.locale,
      table.version,
    ),
    check(
      'notification_templates_channel_check',
      sql`channel = ANY (ARRAY['email'::text, 'sms'::text, 'telegram'::text, 'in_app'::text])`,
    ),
  ],
);

export const starRules = pgTable(
  'star_rules',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    version: integer().notNull(),
    rules: jsonb().notNull(),
    effectiveFrom: timestamp('effective_from', { withTimezone: true, mode: 'date' }).notNull(),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [unique('star_rules_version_key').on(table.version)],
);

export const organisations = pgTable(
  'organisations',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    name: text().notNull(),
    legalName: text('legal_name').notNull(),
    status: text().default('onboarding').notNull(),
    plan: text().default('pilot').notNull(),
    pilotEndsOn: date('pilot_ends_on'),
    platformFeeBps: integer('platform_fee_bps').default(200).notNull(),
    paystackSubaccountCode: text('paystack_subaccount_code'),
    paystackSubaccountStatus: text('paystack_subaccount_status').default('not_created').notNull(),
    settlementBankName: text('settlement_bank_name'),
    settlementAccountLast4: text('settlement_account_last4'),
    posMode: text('pos_mode'),
    posConnectorKey: text('pos_connector_key'),
    headOfficeEmail: citext('head_office_email'),
    agreementSignedOn: date('agreement_signed_on'),
    endedAt: timestamp('ended_at', { withTimezone: true, mode: 'date' }),
    dataDeletionDueOn: date('data_deletion_due_on'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    unique('organisations_paystack_subaccount_code_key').on(table.paystackSubaccountCode),
    check(
      'organisations_check',
      sql`(plan = 'paid'::text) OR (pilot_ends_on IS NOT NULL) OR (status = 'onboarding'::text)`,
    ),
    check(
      'organisations_paystack_subaccount_status_check',
      sql`paystack_subaccount_status = ANY (ARRAY['not_created'::text, 'active'::text, 'inactive'::text])`,
    ),
    check('organisations_plan_check', sql`plan = ANY (ARRAY['pilot'::text, 'paid'::text])`),
    check(
      'organisations_platform_fee_bps_check',
      sql`(platform_fee_bps >= 0) AND (platform_fee_bps <= 2000)`,
    ),
    check('organisations_pos_mode_check', sql`pos_mode = ANY (ARRAY['api'::text, 'file'::text])`),
    check(
      'organisations_settlement_account_last4_check',
      sql`settlement_account_last4 ~ '^[0-9]{4}$'::text`,
    ),
    check(
      'organisations_status_check',
      sql`status = ANY (ARRAY['onboarding'::text, 'pilot'::text, 'live'::text, 'paused'::text, 'ended'::text])`,
    ),
  ],
);

export const users = pgTable(
  'users',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id'),
    email: citext('email').notNull(),
    name: text().notNull(),
    role: text().notNull(),
    status: text().default('pending').notNull(),
    invitedBy: uuid('invited_by'),
    invitedAt: timestamp('invited_at', { withTimezone: true, mode: 'date' }),
    activatedAt: timestamp('activated_at', { withTimezone: true, mode: 'date' }),
    lastSignInAt: timestamp('last_sign_in_at', { withTimezone: true, mode: 'date' }),
    totpSecretEnc: bytea('totp_secret_enc'),
    totpEnrolledAt: timestamp('totp_enrolled_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('users_org_idx').using('btree', table.organisationId.asc().nullsLast()),
    foreignKey({
      columns: [table.invitedBy],
      foreignColumns: [table.id],
      name: 'users_invited_by_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'users_organisation_id_fkey',
    }),
    unique('users_email_key').on(table.email),
    check(
      'users_check',
      sql`(role = ANY (ARRAY['super_admin'::text, 'support_agent'::text])) = (organisation_id IS NULL)`,
    ),
    check(
      'users_role_check',
      sql`role = ANY (ARRAY['exit_checker'::text, 'store_manager'::text, 'head_office_admin'::text, 'super_admin'::text, 'support_agent'::text])`,
    ),
    check(
      'users_status_check',
      sql`status = ANY (ARRAY['pending'::text, 'active'::text, 'suspended'::text, 'removed'::text])`,
    ),
  ],
);

export const staffInvites = pgTable(
  'staff_invites',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id'),
    userId: uuid('user_id').notNull(),
    email: citext('email').notNull(),
    tokenHash: bytea('token_hash').notNull(),
    status: text().default('pending').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    invitedBy: uuid('invited_by').notNull(),
    resendCount: integer('resend_count').default(0).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('staff_invites_user_idx').using('btree', table.userId.asc().nullsLast()),
    foreignKey({
      columns: [table.invitedBy],
      foreignColumns: [users.id],
      name: 'staff_invites_invited_by_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'staff_invites_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'staff_invites_user_id_fkey',
    }),
    unique('staff_invites_token_hash_key').on(table.tokenHash),
    check(
      'staff_invites_status_check',
      sql`status = ANY (ARRAY['pending'::text, 'accepted'::text, 'cancelled'::text, 'expired'::text])`,
    ),
  ],
);

export const devices = pgTable(
  'devices',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    platform: text().notNull(),
    appVersion: text('app_version').notNull(),
    browser: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  () => [
    check(
      'devices_platform_check',
      sql`platform = ANY (ARRAY['web'::text, 'ios'::text, 'android'::text])`,
    ),
  ],
);

export const otpChallenges = pgTable(
  'otp_challenges',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    channel: text().notNull(),
    purpose: text().notNull(),
    destinationHmac: bytea('destination_hmac').notNull(),
    destinationMasked: text('destination_masked').notNull(),
    codeHash: bytea('code_hash').notNull(),
    attempts: smallint().default(0).notNull(),
    maxAttempts: smallint('max_attempts').default(5).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true, mode: 'date' }),
    deviceId: uuid('device_id'),
    ipHash: bytea('ip_hash'),
    inviteId: uuid('invite_id'),
    provider: text(),
    providerMessageId: text('provider_message_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('otp_dest_recent_idx').using(
      'btree',
      table.destinationHmac.asc().nullsLast(),
      table.createdAt.desc().nullsFirst(),
    ),
    foreignKey({
      columns: [table.deviceId],
      foreignColumns: [devices.id],
      name: 'otp_challenges_device_id_fkey',
    }),
    foreignKey({
      columns: [table.inviteId],
      foreignColumns: [staffInvites.id],
      name: 'otp_challenges_invite_id_fkey',
    }),
    check('otp_challenges_channel_check', sql`channel = ANY (ARRAY['sms'::text, 'email'::text])`),
    check(
      'otp_challenges_purpose_check',
      sql`purpose = ANY (ARRAY['shopper_register'::text, 'shopper_sign_in'::text, 'staff_sign_in'::text, 'admin_sign_in'::text])`,
    ),
  ],
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    tokenHash: bytea('token_hash').notNull(),
    subjectType: text('subject_type').notNull(),
    subjectId: uuid('subject_id').notNull(),
    surface: text().notNull(),
    deviceId: uuid('device_id'),
    branchId: uuid('branch_id'),
    exitDeviceId: uuid('exit_device_id'),
    secondStepPassed: boolean('second_step_passed').default(false).notNull(),
    idleTimeoutSeconds: integer('idle_timeout_seconds').notNull(),
    absoluteExpiresAt: timestamp('absolute_expires_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    ipHash: bytea('ip_hash'),
    userAgent: text('user_agent'),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
    revokedReason: text('revoked_reason'),
  },
  (table) => [
    index('sessions_subject_idx')
      .using('btree', table.subjectType.asc().nullsLast(), table.subjectId.asc().nullsLast())
      .where(sql`(revoked_at IS NULL)`),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'sessions_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.deviceId],
      foreignColumns: [devices.id],
      name: 'sessions_device_id_fkey',
    }),
    unique('sessions_token_hash_key').on(table.tokenHash),
    check(
      'sessions_subject_type_check',
      sql`subject_type = ANY (ARRAY['shopper'::text, 'user'::text])`,
    ),
    check(
      'sessions_surface_check',
      sql`surface = ANY (ARRAY['shopper'::text, 'exit'::text, 'store'::text, 'admin'::text])`,
    ),
  ],
);

export const standardCategories = pgTable(
  'standard_categories',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    key: text().notNull(),
    name: text().notNull(),
    description: text().default('').notNull(),
    defaultCheckLevel: text('default_check_level').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    active: boolean().default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    unique('standard_categories_key_key').on(table.key),
    check(
      'standard_categories_default_check_level_check',
      sql`default_check_level = ANY (ARRAY['standard'::text, 'extra'::text])`,
    ),
  ],
);

export const paystackEvents = pgTable(
  'paystack_events',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    dedupeKey: text('dedupe_key').notNull(),
    eventType: text('event_type').notNull(),
    reference: text(),
    signatureValid: boolean('signature_valid').notNull(),
    payload: jsonb().notNull(),
    requestId: text('request_id'),
    receivedAt: timestamp('received_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true, mode: 'date' }),
    processError: text('process_error'),
  },
  (table) => [
    index('paystack_events_reference_idx').using('btree', table.reference.asc().nullsLast()),
    unique('paystack_events_dedupe_key_key').on(table.dedupeKey),
  ],
);

export const chargebackReserveLedger = pgTable(
  'chargeback_reserve_ledger',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    entryType: text('entry_type').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    amountKobo: bigint('amount_kobo', { mode: 'number' }).notNull(),
    disputeId: uuid('dispute_id'),
    note: text().notNull(),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.disputeId],
      foreignColumns: [disputes.id],
      name: 'chargeback_reserve_ledger_dispute_id_fkey',
    }),
    check(
      'chargeback_reserve_ledger_entry_type_check',
      sql`entry_type = ANY (ARRAY['top_up'::text, 'chargeback_debit'::text, 'recovery_credit'::text, 'adjustment'::text])`,
    ),
  ],
);

export const faqs = pgTable(
  'faqs',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    scope: text().notNull(),
    organisationId: uuid('organisation_id'),
    question: text().notNull(),
    answer: text().notNull(),
    keywords: text().array().default(['']).notNull(),
    screens: text().array().default(['']).notNull(),
    orderStates: text('order_states').array().default(['']).notNull(),
    offerSupport: boolean('offer_support').default(false).notNull(),
    active: boolean().default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    searchVector: tsvector('search_vector').generatedAlwaysAs(
      sql`((setweight(to_tsvector('english'::regconfig, question), 'A'::"char") || setweight(to_tsvector('english'::regconfig, immutable_join(keywords)), 'B'::"char")) || setweight(to_tsvector('english'::regconfig, answer), 'C'::"char"))`,
    ),
    updatedBy: uuid('updated_by'),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('faqs_search_idx').using('gin', table.searchVector.asc().nullsLast()),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'faqs_organisation_id_fkey',
    }),
    check('faqs_check', sql`(scope = 'organisation'::text) = (organisation_id IS NOT NULL)`),
    check('faqs_scope_check', sql`scope = ANY (ARRAY['platform'::text, 'organisation'::text])`),
  ],
);

export const faqSynonyms = pgTable('faq_synonyms', {
  term: text().primaryKey().notNull(),
  synonyms: text().array().notNull(),
});

export const notifications = pgTable(
  'notifications',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id'),
    recipientType: text('recipient_type').notNull(),
    recipientId: uuid('recipient_id'),
    channel: text().notNull(),
    templateKey: text('template_key').notNull(),
    templateVersion: integer('template_version'),
    priority: text().default('normal').notNull(),
    destinationMasked: text('destination_masked'),
    status: text().default('queued').notNull(),
    provider: text(),
    providerMessageId: text('provider_message_id'),
    errorCode: text('error_code'),
    attempts: integer().default(0).notNull(),
    relatedType: text('related_type'),
    relatedId: uuid('related_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true, mode: 'date' }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    index('notifications_daily_email_idx')
      .using('btree', table.channel.asc().nullsLast(), table.sentAt.asc().nullsLast())
      .where(sql`(channel = 'email'::text)`),
    index('notifications_status_idx')
      .using('btree', table.status.asc().nullsLast(), table.createdAt.asc().nullsLast())
      .where(sql`(status = ANY (ARRAY['queued'::text, 'held_quota'::text]))`),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'notifications_organisation_id_fkey',
    }),
    check(
      'notifications_channel_check',
      sql`channel = ANY (ARRAY['sms'::text, 'email'::text, 'telegram'::text, 'in_app'::text])`,
    ),
    check(
      'notifications_priority_check',
      sql`priority = ANY (ARRAY['critical'::text, 'normal'::text, 'bulk'::text])`,
    ),
    check(
      'notifications_recipient_type_check',
      sql`recipient_type = ANY (ARRAY['shopper'::text, 'guest'::text, 'user'::text, 'platform_group'::text])`,
    ),
    check(
      'notifications_status_check',
      sql`status = ANY (ARRAY['queued'::text, 'held_quota'::text, 'sent'::text, 'delivered'::text, 'failed'::text, 'fallback_sent'::text])`,
    ),
  ],
);

export const alerts = pgTable(
  'alerts',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    scope: text().notNull(),
    organisationId: uuid('organisation_id'),
    branchId: uuid('branch_id'),
    severity: text().notNull(),
    code: text().notNull(),
    title: text().notNull(),
    body: text().notNull(),
    linkPath: text('link_path'),
    dedupeKey: text('dedupe_key').notNull(),
    status: text().default('open').notNull(),
    telegramStatus: text('telegram_status'),
    emailFallbackSent: boolean('email_fallback_sent').default(false).notNull(),
    occurrences: integer().default(1).notNull(),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    acknowledgedBy: uuid('acknowledged_by'),
    resolvedAt: timestamp('resolved_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    uniqueIndex('alerts_open_dedupe')
      .using('btree', table.dedupeKey.asc().nullsLast())
      .where(sql`(status <> 'resolved'::text)`),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'alerts_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'alerts_organisation_id_fkey',
    }),
    check(
      'alerts_scope_check',
      sql`scope = ANY (ARRAY['platform'::text, 'organisation'::text, 'branch'::text])`,
    ),
    check(
      'alerts_severity_check',
      sql`severity = ANY (ARRAY['critical'::text, 'high'::text, 'medium'::text, 'low'::text, 'store'::text])`,
    ),
    check(
      'alerts_status_check',
      sql`status = ANY (ARRAY['open'::text, 'acknowledged'::text, 'resolved'::text])`,
    ),
    check(
      'alerts_telegram_status_check',
      sql`telegram_status = ANY (ARRAY['sent'::text, 'failed'::text, 'not_applicable'::text])`,
    ),
  ],
);

export const exports = pgTable(
  'exports',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id'),
    requestedBy: uuid('requested_by').notNull(),
    dataset: text().notNull(),
    filters: jsonb().notNull(),
    format: text().notNull(),
    status: text().default('queued').notNull(),
    storageKey: text('storage_key'),
    rowCount: integer('row_count'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'exports_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.requestedBy],
      foreignColumns: [users.id],
      name: 'exports_requested_by_fkey',
    }),
    check('exports_format_check', sql`format = ANY (ARRAY['csv'::text, 'xlsx'::text])`),
    check(
      'exports_status_check',
      sql`status = ANY (ARRAY['queued'::text, 'running'::text, 'ready'::text, 'failed'::text, 'expired'::text])`,
    ),
  ],
);

export const errorEvents = pgTable(
  'error_events',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    code: text().notNull(),
    severity: text().notNull(),
    app: text().notNull(),
    release: text().notNull(),
    environment: text().notNull(),
    organisationId: uuid('organisation_id'),
    branchId: uuid('branch_id'),
    routeOrScreen: text('route_or_screen'),
    browser: text(),
    requestId: text('request_id'),
    glitchtipUrl: text('glitchtip_url'),
    occurredAt: timestamp('occurred_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('error_events_code_time_idx').using(
      'btree',
      table.code.asc().nullsLast(),
      table.occurredAt.desc().nullsFirst(),
    ),
    index('error_events_time_idx').using('btree', table.occurredAt.desc().nullsFirst()),
    check(
      'error_events_app_check',
      sql`app = ANY (ARRAY['api'::text, 'worker'::text, 'shopper'::text, 'exit'::text, 'store'::text, 'admin'::text])`,
    ),
    check(
      'error_events_severity_check',
      sql`severity = ANY (ARRAY['critical'::text, 'high'::text, 'medium'::text, 'low'::text])`,
    ),
  ],
);

export const branches = pgTable(
  'branches',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    code: text().notNull(),
    name: text().notNull(),
    addressLine: text('address_line').notNull(),
    area: text().notNull(),
    city: text().default('Lagos').notNull(),
    latitude: numeric({ precision: 9, scale: 6 }),
    longitude: numeric({ precision: 9, scale: 6 }),
    phone: text(),
    serviceDeskNote: text('service_desk_note'),
    openingHours: jsonb('opening_hours').default({}).notNull(),
    status: text().default('onboarding').notNull(),
    skipaEnabled: boolean('skipa_enabled').default(false).notNull(),
    switchedOffReason: text('switched_off_reason'),
    switchedOffAt: timestamp('switched_off_at', { withTimezone: true, mode: 'date' }),
    switchedOffBy: uuid('switched_off_by'),
    randomCheckRatePct: smallint('random_check_rate_pct').default(5).notNull(),
    welcomeMessageOverride: text('welcome_message_override'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('branches_org_idx').using('btree', table.organisationId.asc().nullsLast()),
    index('branches_search_idx').using(
      'gin',
      sql`(((((name || ' '::text) || area) || ' '::text) || city))`,
    ),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'branches_organisation_id_fkey',
    }),
    unique('branches_organisation_id_code_key').on(table.code, table.organisationId),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('branches_code_check', sql`code ~ '^[A-Z]{2,4}$'::text`),
    check(
      'branches_random_check_rate_pct_check',
      sql`random_check_rate_pct = ANY (ARRAY[1, 2, 5, 10, 15, 20])`,
    ),
    check(
      'branches_status_check',
      sql`status = ANY (ARRAY['onboarding'::text, 'live'::text, 'paused'::text, 'ended'::text])`,
    ),
    check(
      'branches_welcome_message_override_check',
      sql`char_length(welcome_message_override) <= 140`,
    ),
  ],
);

export const branchSettings = pgTable(
  'branch_settings',
  {
    branchId: uuid('branch_id').primaryKey().notNull(),
    organisationId: uuid('organisation_id').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    cartMaxValueKobo: bigint('cart_max_value_kobo', { mode: 'number' }).default(15000000).notNull(),
    cartMaxItems: integer('cart_max_items').default(30).notNull(),
    ruleExtraChecksEnabled: boolean('rule_extra_checks_enabled').default(true).notNull(),
    rulePriceThresholdEnabled: boolean('rule_price_threshold_enabled').default(true).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    priceThresholdKobo: bigint('price_threshold_kobo', { mode: 'number' })
      .default(2500000)
      .notNull(),
    ruleItemCountEnabled: boolean('rule_item_count_enabled').default(true).notNull(),
    largeBasketItems: integer('large_basket_items').default(15).notNull(),
    ruleBasketValueEnabled: boolean('rule_basket_value_enabled').default(true).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    basketValueThresholdKobo: bigint('basket_value_threshold_kobo', { mode: 'number' })
      .default(10000000)
      .notNull(),
    rulePreviousMismatchEnabled: boolean('rule_previous_mismatch_enabled').default(true).notNull(),
    previousMismatchDays: integer('previous_mismatch_days').default(90).notNull(),
    weightToleranceBps: integer('weight_tolerance_bps').default(300).notNull(),
    exitWindowMinutes: integer('exit_window_minutes').default(30).notNull(),
    sessionTimeoutMinutes: integer('session_timeout_minutes').default(60).notNull(),
    savedCartHours: integer('saved_cart_hours').default(24).notNull(),
    exitSessionIdleHours: integer('exit_session_idle_hours').default(12).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    refundHeadOfficeThresholdKobo: bigint('refund_head_office_threshold_kobo', { mode: 'number' })
      .default(2000000)
      .notNull(),
    refundRecordReminderHours: integer('refund_record_reminder_hours').default(24).notNull(),
    supportFirstReplyMinutes: integer('support_first_reply_minutes').default(15).notNull(),
    stalePriceHours: integer('stale_price_hours').default(24).notNull(),
    channelCardEnabled: boolean('channel_card_enabled').default(true).notNull(),
    channelTransferEnabled: boolean('channel_transfer_enabled').default(true).notNull(),
    channelUssdEnabled: boolean('channel_ussd_enabled').default(true).notNull(),
    updatedBy: uuid('updated_by'),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'branch_settings_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'branch_settings_organisation_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('branch_settings_check', sql`(cart_max_value_kobo > 0) AND (cart_max_items > 0)`),
    check(
      'branch_settings_weight_tolerance_bps_check',
      sql`(weight_tolerance_bps >= 50) AND (weight_tolerance_bps <= 2000)`,
    ),
  ],
);

export const qrCodes = pgTable(
  'qr_codes',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    code: text().notNull(),
    locationLabel: text('location_label').notNull(),
    active: boolean().default(true).notNull(),
    signsPrinted: integer('signs_printed').default(0).notNull(),
    lastPrintedAt: timestamp('last_printed_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('qr_codes_branch_idx').using('btree', table.branchId.asc().nullsLast()),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'qr_codes_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'qr_codes_organisation_id_fkey',
    }),
    unique('qr_codes_code_key').on(table.code),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('qr_codes_code_check', sql`code ~ '^QR-[A-Z]{2,4}-[A-Z]{3}-[0-9]{2}$'::text`),
  ],
);

export const categories = pgTable(
  'categories',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    standardCategoryId: uuid('standard_category_id'),
    kind: text().notNull(),
    name: text().notNull(),
    checkLevel: text('check_level').notNull(),
    checkLevelFloor: text('check_level_floor').default('standard').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'categories_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.standardCategoryId],
      foreignColumns: [standardCategories.id],
      name: 'categories_standard_category_id_fkey',
    }),
    unique('categories_organisation_id_name_key').on(table.name, table.organisationId),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'categories_check',
      sql`NOT ((check_level_floor = 'extra'::text) AND (check_level = 'standard'::text))`,
    ),
    check(
      'categories_check_level_check',
      sql`check_level = ANY (ARRAY['standard'::text, 'extra'::text])`,
    ),
    check(
      'categories_check_level_floor_check',
      sql`check_level_floor = ANY (ARRAY['standard'::text, 'extra'::text])`,
    ),
    check('categories_kind_check', sql`kind = ANY (ARRAY['standard'::text, 'custom'::text])`),
  ],
);

export const products = pgTable(
  'products',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    posProductId: text('pos_product_id').notNull(),
    barcode: text(),
    name: text().notNull(),
    posDepartment: text('pos_department'),
    categoryId: uuid('category_id'),
    weightGrams: integer('weight_grams'),
    weightSource: text('weight_source'),
    soldByWeight: boolean('sold_by_weight').default(false).notNull(),
    variablePrice: boolean('variable_price').default(false).notNull(),
    extraChecks: boolean('extra_checks').default(false).notNull(),
    soldThroughSkipa: boolean('sold_through_skipa').default(true).notNull(),
    deletedInPos: boolean('deleted_in_pos').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('products_name_trgm').using('gin', table.name.asc().nullsLast().op('gin_trgm_ops')),
    uniqueIndex('products_org_barcode_uq')
      .using('btree', table.organisationId.asc().nullsLast(), table.barcode.asc().nullsLast())
      .where(sql`((barcode IS NOT NULL) AND (NOT deleted_in_pos))`),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: 'products_category_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'products_organisation_id_fkey',
    }),
    unique('products_organisation_id_pos_product_id_key').on(
      table.organisationId,
      table.posProductId,
    ),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('products_barcode_check', sql`barcode ~ '^[0-9]{8}$|^[0-9]{12,13}$'::text`),
    check('products_weight_grams_check', sql`weight_grams > 0`),
    check(
      'products_weight_source_check',
      sql`weight_source = ANY (ARRAY['store'::text, 'skipa'::text, 'import'::text, 'sample'::text])`,
    ),
  ],
);

export const productPriceHistory = pgTable(
  'product_price_history',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    branchId: uuid('branch_id').notNull(),
    productId: uuid('product_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    priceKobo: bigint('price_kobo', { mode: 'number' }).notNull(),
    source: text().notNull(),
    syncRunId: uuid('sync_run_id'),
    recordedAt: timestamp('recorded_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('price_history_product_idx').using(
      'btree',
      table.productId.asc().nullsLast(),
      table.recordedAt.desc().nullsFirst(),
    ),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'product_price_history_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'product_price_history_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: 'product_price_history_product_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'product_price_history_source_check',
      sql`source = ANY (ARRAY['pos_api'::text, 'pos_push'::text, 'pos_file'::text])`,
    ),
  ],
);

export const lossBaselines = pgTable(
  'loss_baselines',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    categoryId: uuid('category_id').notNull(),
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    salesKobo: bigint('sales_kobo', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    lossKobo: bigint('loss_kobo', { mode: 'number' }).notNull(),
    agreedMarginBps: integer('agreed_margin_bps').default(300).notNull(),
    recordedBy: uuid('recorded_by'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'loss_baselines_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: 'loss_baselines_category_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'loss_baselines_organisation_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('loss_baselines_loss_kobo_check', sql`loss_kobo >= 0`),
    check('loss_baselines_sales_kobo_check', sql`sales_kobo >= 0`),
  ],
);

export const lossCounts = pgTable(
  'loss_counts',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    categoryId: uuid('category_id').notNull(),
    weekStart: date('week_start').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    skipaSalesKobo: bigint('skipa_sales_kobo', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    lossKobo: bigint('loss_kobo', { mode: 'number' }).notNull(),
    source: text().notNull(),
    recordedBy: uuid('recorded_by'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'loss_counts_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: 'loss_counts_category_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'loss_counts_organisation_id_fkey',
    }),
    unique('loss_counts_branch_id_category_id_week_start_key').on(
      table.branchId,
      table.categoryId,
      table.weekStart,
    ),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'loss_counts_source_check',
      sql`source = ANY (ARRAY['store_entry'::text, 'pos_import'::text])`,
    ),
  ],
);

export const shoppingSessions = pgTable(
  'shopping_sessions',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    deviceId: uuid('device_id').notNull(),
    shopperId: uuid('shopper_id'),
    qrCodeId: uuid('qr_code_id'),
    entryPoint: text('entry_point').notNull(),
    status: text().default('active').notNull(),
    cartItemCount: integer('cart_item_count').default(0).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    cartValueKobo: bigint('cart_value_kobo', { mode: 'number' }).default(0).notNull(),
    lastScreen: text('last_screen'),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    lastActivityAt: timestamp('last_activity_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true, mode: 'date' }),
    endReason: text('end_reason'),
  },
  (table) => [
    index('sessions_branch_active_idx')
      .using('btree', table.branchId.asc().nullsLast(), table.lastActivityAt.asc().nullsLast())
      .where(sql`(status = ANY (ARRAY['active'::text, 'checkout'::text]))`),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'shopping_sessions_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.deviceId],
      foreignColumns: [devices.id],
      name: 'shopping_sessions_device_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'shopping_sessions_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.qrCodeId],
      foreignColumns: [qrCodes.id],
      name: 'shopping_sessions_qr_code_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'shopping_sessions_end_reason_check',
      sql`end_reason = ANY (ARRAY['paid'::text, 'timeout'::text, 'left'::text, 'switched_off'::text])`,
    ),
    check(
      'shopping_sessions_entry_point_check',
      sql`entry_point = ANY (ARRAY['store_qr'::text, 'skipa_home_scan'::text, 'resume'::text])`,
    ),
    check(
      'shopping_sessions_status_check',
      sql`status = ANY (ARRAY['active'::text, 'checkout'::text, 'paid'::text, 'abandoned'::text, 'ended'::text])`,
    ),
  ],
);

export const unknownBarcodes = pgTable(
  'unknown_barcodes',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    sessionId: uuid('session_id'),
    barcode: text().notNull(),
    reason: text().notNull(),
    typed: boolean().default(false).notNull(),
    scannedAt: timestamp('scanned_at', { withTimezone: true, mode: 'date' }).notNull(),
    clientEventId: uuid('client_event_id').notNull(),
  },
  (table) => [
    index('unknown_barcodes_branch_idx').using(
      'btree',
      table.branchId.asc().nullsLast(),
      table.scannedAt.desc().nullsFirst(),
    ),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'unknown_barcodes_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'unknown_barcodes_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [shoppingSessions.id],
      name: 'unknown_barcodes_session_id_fkey',
    }),
    unique('unknown_barcodes_client_event_id_key').on(table.clientEventId),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'unknown_barcodes_reason_check',
      sql`reason = ANY (ARRAY['not_found'::text, 'category_off'::text, 'till_only'::text, 'price_stale'::text, 'missing_weight'::text])`,
    ),
  ],
);

export const orders = pgTable(
  'orders',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    sessionId: uuid('session_id'),
    deviceId: uuid('device_id').notNull(),
    shopperId: uuid('shopper_id'),
    orderNumber: text('order_number').notNull(),
    status: text().default('created').notNull(),
    itemCount: integer('item_count').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    totalKobo: bigint('total_kobo', { mode: 'number' }).notNull(),
    currency: char({ length: 3 }).default('NGN').notNull(),
    platformFeeBps: integer('platform_fee_bps').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    platformFeeKobo: bigint('platform_fee_kobo', { mode: 'number' }).notNull(),
    idempotencyKey: text('idempotency_key').notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true, mode: 'date' }),
    exitValidUntil: timestamp('exit_valid_until', { withTimezone: true, mode: 'date' }),
    exitedAt: timestamp('exited_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('orders_branch_created_idx').using(
      'btree',
      table.branchId.asc().nullsLast(),
      table.createdAt.desc().nullsFirst(),
    ),
    index('orders_device_idx').using(
      'btree',
      table.deviceId.asc().nullsLast(),
      table.createdAt.desc().nullsFirst(),
    ),
    index('orders_org_status_idx').using(
      'btree',
      table.organisationId.asc().nullsLast(),
      table.status.asc().nullsLast(),
    ),
    index('orders_shopper_idx')
      .using('btree', table.shopperId.asc().nullsLast(), table.createdAt.desc().nullsFirst())
      .where(sql`(shopper_id IS NOT NULL)`),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'orders_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.deviceId],
      foreignColumns: [devices.id],
      name: 'orders_device_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'orders_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [shoppingSessions.id],
      name: 'orders_session_id_fkey',
    }),
    unique('orders_order_number_key').on(table.orderNumber),
    unique('orders_device_id_idempotency_key_key').on(table.deviceId, table.idempotencyKey),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'orders_check',
      sql`(status <> ALL (ARRAY['paid'::text, 'exited'::text])) OR (paid_at IS NOT NULL)`,
    ),
    check('orders_currency_check', sql`currency = 'NGN'::bpchar`),
    check('orders_item_count_check', sql`item_count > 0`),
    check('orders_platform_fee_kobo_check', sql`platform_fee_kobo >= 0`),
    check(
      'orders_status_check',
      sql`status = ANY (ARRAY['created'::text, 'pending'::text, 'paid'::text, 'failed'::text, 'exited'::text, 'refund_requested'::text, 'awaiting_head_office'::text, 'refunded'::text, 'partially_refunded'::text, 'disputed'::text, 'chargeback_won'::text, 'chargeback_lost'::text])`,
    ),
    check('orders_total_kobo_check', sql`total_kobo > 0`),
  ],
);

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    orderId: uuid('order_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    productId: uuid('product_id').notNull(),
    barcode: text(),
    name: text().notNull(),
    categoryId: uuid('category_id'),
    categoryName: text('category_name').notNull(),
    checkLevel: text('check_level').notNull(),
    extraChecks: boolean('extra_checks').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    unitPriceKobo: bigint('unit_price_kobo', { mode: 'number' }).notNull(),
    quantity: integer().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    lineTotalKobo: bigint('line_total_kobo', { mode: 'number' }).notNull(),
    weightGrams: integer('weight_grams').notNull(),
  },
  (table) => [
    index('order_items_order_idx').using('btree', table.orderId.asc().nullsLast()),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: 'order_items_category_id_fkey',
    }),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: 'order_items_order_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'order_items_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: 'order_items_product_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('order_items_check', sql`line_total_kobo = (unit_price_kobo * quantity)`),
    check(
      'order_items_check_level_check',
      sql`check_level = ANY (ARRAY['standard'::text, 'extra'::text])`,
    ),
    check('order_items_quantity_check', sql`quantity > 0`),
    check('order_items_unit_price_kobo_check', sql`unit_price_kobo > 0`),
    check('order_items_weight_grams_check', sql`weight_grams > 0`),
  ],
);

export const orderStatusHistory = pgTable(
  'order_status_history',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    orderId: uuid('order_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    fromStatus: text('from_status'),
    toStatus: text('to_status').notNull(),
    actorType: text('actor_type').notNull(),
    actorId: uuid('actor_id'),
    reason: text(),
    requestId: text('request_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('order_history_order_idx').using(
      'btree',
      table.orderId.asc().nullsLast(),
      table.createdAt.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: 'order_status_history_order_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'order_status_history_organisation_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'order_status_history_actor_type_check',
      sql`actor_type = ANY (ARRAY['shopper'::text, 'user'::text, 'paystack'::text, 'job'::text, 'system'::text])`,
    ),
  ],
);

export const paymentAttempts = pgTable(
  'payment_attempts',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    orderId: uuid('order_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    reference: text().notNull(),
    idempotencyKey: text('idempotency_key').notNull(),
    channelRequested: text('channel_requested').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    amountKobo: bigint('amount_kobo', { mode: 'number' }).notNull(),
    subaccountCode: text('subaccount_code').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    transactionChargeKobo: bigint('transaction_charge_kobo', { mode: 'number' }).notNull(),
    status: text().default('initialized').notNull(),
    paystackAccessCode: text('paystack_access_code'),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    paystackTransactionId: bigint('paystack_transaction_id', { mode: 'number' }),
    channelPaid: text('channel_paid'),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    paystackFeesKobo: bigint('paystack_fees_kobo', { mode: 'number' }),
    gatewayResponse: text('gateway_response'),
    cardBin: text('card_bin'),
    cardLast4: text('card_last4'),
    cardBrand: text('card_brand'),
    paidAt: timestamp('paid_at', { withTimezone: true, mode: 'date' }),
    verifiedAt: timestamp('verified_at', { withTimezone: true, mode: 'date' }),
    verifiedVia: text('verified_via'),
    verifyAttempts: integer('verify_attempts').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('one_successful_attempt_per_order')
      .using('btree', table.orderId.asc().nullsLast())
      .where(sql`(status = 'success'::text)`),
    index('payment_attempts_pending_idx')
      .using('btree', table.createdAt.asc().nullsLast())
      .where(sql`(status = ANY (ARRAY['initialized'::text, 'pending'::text]))`),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: 'payment_attempts_order_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'payment_attempts_organisation_id_fkey',
    }),
    unique('payment_attempts_reference_key').on(table.reference),
    unique('payment_attempts_paystack_transaction_id_key').on(table.paystackTransactionId),
    unique('payment_attempts_order_id_idempotency_key_key').on(table.idempotencyKey, table.orderId),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('payment_attempts_amount_kobo_check', sql`amount_kobo > 0`),
    check('payment_attempts_card_bin_check', sql`card_bin ~ '^[0-9]{6}$'::text`),
    check('payment_attempts_card_last4_check', sql`card_last4 ~ '^[0-9]{4}$'::text`),
    check(
      'payment_attempts_channel_requested_check',
      sql`channel_requested = ANY (ARRAY['card'::text, 'bank_transfer'::text, 'ussd'::text])`,
    ),
    check('payment_attempts_paystack_fees_kobo_check', sql`paystack_fees_kobo >= 0`),
    check(
      'payment_attempts_status_check',
      sql`status = ANY (ARRAY['initialized'::text, 'pending'::text, 'success'::text, 'failed'::text, 'abandoned'::text, 'superseded'::text])`,
    ),
    check('payment_attempts_transaction_charge_kobo_check', sql`transaction_charge_kobo >= 0`),
    check(
      'payment_attempts_verified_via_check',
      sql`verified_via = ANY (ARRAY['webhook'::text, 'poll'::text, 'client_nudge'::text, 'reconciliation'::text])`,
    ),
  ],
);

export const strayCharges = pgTable(
  'stray_charges',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    orderId: uuid('order_id'),
    paymentAttemptId: uuid('payment_attempt_id'),
    reference: text().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    amountKobo: bigint('amount_kobo', { mode: 'number' }).notNull(),
    cause: text().notNull(),
    status: text().default('open').notNull(),
    refundId: uuid('refund_id'),
    detectedAt: timestamp('detected_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: 'stray_charges_order_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'stray_charges_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.paymentAttemptId],
      foreignColumns: [paymentAttempts.id],
      name: 'stray_charges_payment_attempt_id_fkey',
    }),
    unique('stray_charges_reference_key').on(table.reference),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'stray_charges_cause_check',
      sql`cause = ANY (ARRAY['duplicate_charge'::text, 'superseded_attempt'::text, 'amount_mismatch'::text, 'order_not_payable'::text])`,
    ),
    check(
      'stray_charges_status_check',
      sql`status = ANY (ARRAY['open'::text, 'refund_recorded'::text, 'resolved'::text])`,
    ),
  ],
);

export const receipts = pgTable(
  'receipts',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    orderId: uuid('order_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    receiptNumber: text('receipt_number').notNull(),
    issuedAt: timestamp('issued_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    exitTokenId: uuid('exit_token_id').notNull(),
    exitValidUntil: timestamp('exit_valid_until', { withTimezone: true, mode: 'date' }).notNull(),
    exitTokenUsedAt: timestamp('exit_token_used_at', { withTimezone: true, mode: 'date' }),
    exitTokenUsedByCheck: uuid('exit_token_used_by_check'),
    disputeEvidence: jsonb('dispute_evidence').notNull(),
    rating: smallint(),
    ratingComment: text('rating_comment'),
    ratedAt: timestamp('rated_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    index('receipts_org_issued_idx').using(
      'btree',
      table.organisationId.asc().nullsLast(),
      table.issuedAt.desc().nullsFirst(),
    ),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'receipts_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: 'receipts_order_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'receipts_organisation_id_fkey',
    }),
    unique('receipts_order_id_key').on(table.orderId),
    unique('receipts_exit_token_id_key').on(table.exitTokenId),
    unique('receipts_branch_id_receipt_number_key').on(table.branchId, table.receiptNumber),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('receipts_rating_check', sql`(rating >= 1) AND (rating <= 5)`),
    check('receipts_rating_comment_check', sql`char_length(rating_comment) <= 500`),
  ],
);

export const receiptDeliveries = pgTable(
  'receipt_deliveries',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    receiptId: uuid('receipt_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    destinationMasked: text('destination_masked').notNull(),
    trigger: text().notNull(),
    notificationId: uuid('notification_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'receipt_deliveries_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.receiptId],
      foreignColumns: [receipts.id],
      name: 'receipt_deliveries_receipt_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'receipt_deliveries_trigger_check',
      sql`trigger = ANY (ARRAY['auto_opt_in'::text, 'shopper_request'::text])`,
    ),
  ],
);

export const exitPlans = pgTable(
  'exit_plans',
  {
    orderId: uuid('order_id').primaryKey().notNull(),
    organisationId: uuid('organisation_id').notNull(),
    flagged: boolean().notNull(),
    randomCheck: boolean('random_check').notNull(),
    randomRatePct: smallint('random_rate_pct').notNull(),
    reasons: jsonb().notNull(),
    expectedWeightGrams: integer('expected_weight_grams').notNull(),
    decidedAt: timestamp('decided_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: 'exit_plans_order_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'exit_plans_organisation_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
  ],
);

export const exitDevices = pgTable(
  'exit_devices',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    deviceId: uuid('device_id').notNull(),
    label: text().notNull(),
    status: text().default('offline').notNull(),
    lastHeartbeatAt: timestamp('last_heartbeat_at', { withTimezone: true, mode: 'date' }),
    offlineSince: timestamp('offline_since', { withTimezone: true, mode: 'date' }),
    offlineAlertedAt: timestamp('offline_alerted_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'exit_devices_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.deviceId],
      foreignColumns: [devices.id],
      name: 'exit_devices_device_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'exit_devices_organisation_id_fkey',
    }),
    unique('exit_devices_device_id_key').on(table.deviceId),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('exit_devices_status_check', sql`status = ANY (ARRAY['online'::text, 'offline'::text])`),
  ],
);

export const randomCheckBlocks = pgTable(
  'random_check_blocks',
  {
    branchId: uuid('branch_id').primaryKey().notNull(),
    organisationId: uuid('organisation_id').notNull(),
    ratePct: smallint('rate_pct').notNull(),
    blockSize: smallint('block_size').notNull(),
    selectedPositions: smallint('selected_positions').array().notNull(),
    nextPosition: smallint('next_position').default(0).notNull(),
    blockStartedAt: timestamp('block_started_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'random_check_blocks_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'random_check_blocks_organisation_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('random_check_blocks_rate_pct_check', sql`rate_pct = ANY (ARRAY[1, 2, 5, 10, 15, 20])`),
  ],
);

export const exitChecks = pgTable(
  'exit_checks',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    orderId: uuid('order_id'),
    receiptId: uuid('receipt_id'),
    checkerUserId: uuid('checker_user_id').notNull(),
    exitDeviceId: uuid('exit_device_id'),
    lookupMethod: text('lookup_method').notNull(),
    lookupValueMasked: text('lookup_value_masked').notNull(),
    decision: text().notNull(),
    invalidReason: text('invalid_reason'),
    randomCheck: boolean('random_check').default(false).notNull(),
    flagReasons: jsonb('flag_reasons').default([]).notNull(),
    expectedWeightGrams: integer('expected_weight_grams'),
    actualWeightGrams: integer('actual_weight_grams'),
    weightDeltaBps: integer('weight_delta_bps'),
    weightWithinTolerance: boolean('weight_within_tolerance'),
    result: text(),
    mismatchReasons: text('mismatch_reasons').array().default(['']).notNull(),
    notes: text(),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    durationMs: integer('duration_ms'),
  },
  (table) => [
    index('exit_checks_branch_idx').using(
      'btree',
      table.branchId.asc().nullsLast(),
      table.startedAt.desc().nullsFirst(),
    ),
    index('exit_checks_checker_idx').using(
      'btree',
      table.checkerUserId.asc().nullsLast(),
      table.startedAt.desc().nullsFirst(),
    ),
    uniqueIndex('one_open_check_per_order')
      .using('btree', table.orderId.asc().nullsLast())
      .where(sql`((completed_at IS NULL) AND (order_id IS NOT NULL))`),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'exit_checks_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.checkerUserId],
      foreignColumns: [users.id],
      name: 'exit_checks_checker_user_id_fkey',
    }),
    foreignKey({
      columns: [table.exitDeviceId],
      foreignColumns: [exitDevices.id],
      name: 'exit_checks_exit_device_id_fkey',
    }),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: 'exit_checks_order_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'exit_checks_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.receiptId],
      foreignColumns: [receipts.id],
      name: 'exit_checks_receipt_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('exit_checks_check', sql`(decision <> 'invalid'::text) OR (invalid_reason IS NOT NULL)`),
    check('exit_checks_check1', sql`(result IS NULL) OR (completed_at IS NOT NULL)`),
    check(
      'exit_checks_decision_check',
      sql`decision = ANY (ARRAY['clear'::text, 'flagged'::text, 'invalid'::text])`,
    ),
    check(
      'exit_checks_invalid_reason_check',
      sql`invalid_reason = ANY (ARRAY['not_paid'::text, 'already_used'::text, 'expired'::text, 'other_branch'::text, 'not_found'::text, 'refunded'::text])`,
    ),
    check(
      'exit_checks_lookup_method_check',
      sql`lookup_method = ANY (ARRAY['qr'::text, 'receipt_number'::text])`,
    ),
    check('exit_checks_notes_check', sql`char_length(notes) <= 1000`),
    check(
      'exit_checks_result_check',
      sql`result = ANY (ARRAY['clear'::text, 'match'::text, 'mismatch'::text, 'invalid'::text, 'abandoned'::text])`,
    ),
  ],
);

export const checkerSignals = pgTable(
  'checker_signals',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    userId: uuid('user_id').notNull(),
    signal: text().notNull(),
    windowStart: timestamp('window_start', { withTimezone: true, mode: 'date' }).notNull(),
    windowEnd: timestamp('window_end', { withTimezone: true, mode: 'date' }).notNull(),
    metrics: jsonb().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'checker_signals_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'checker_signals_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'checker_signals_user_id_fkey',
    }),
    unique('checker_signals_user_id_signal_window_end_key').on(
      table.signal,
      table.userId,
      table.windowEnd,
    ),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'checker_signals_signal_check',
      sql`signal = ANY (ARRAY['low_mismatch_rate'::text, 'fast_flagged_checks'::text, 'large_basket_not_weighed'::text])`,
    ),
  ],
);

export const refunds = pgTable(
  'refunds',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    orderId: uuid('order_id').notNull(),
    origin: text().notNull(),
    requestedByShopperId: uuid('requested_by_shopper_id'),
    requestedByDeviceId: uuid('requested_by_device_id'),
    requestedByUserId: uuid('requested_by_user_id'),
    reason: text().notNull(),
    note: text(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    amountKobo: bigint('amount_kobo', { mode: 'number' }).notNull(),
    status: text().default('requested').notNull(),
    needsHeadOffice: boolean('needs_head_office').notNull(),
    approvedBy: uuid('approved_by'),
    approvedAt: timestamp('approved_at', { withTimezone: true, mode: 'date' }),
    headOfficeApprovedBy: uuid('head_office_approved_by'),
    declinedBy: uuid('declined_by'),
    declineReason: text('decline_reason'),
    paymentMethod: text('payment_method'),
    paymentReference: text('payment_reference'),
    paidAt: timestamp('paid_at', { withTimezone: true, mode: 'date' }),
    recordedBy: uuid('recorded_by'),
    recordedAt: timestamp('recorded_at', { withTimezone: true, mode: 'date' }),
    liability: text().default('store').notNull(),
    supportTicketId: uuid('support_ticket_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('one_live_refund_per_order')
      .using('btree', table.orderId.asc().nullsLast())
      .where(sql`(status <> 'declined'::text)`),
    index('refunds_org_status_idx').using(
      'btree',
      table.organisationId.asc().nullsLast(),
      table.status.asc().nullsLast(),
      table.createdAt.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.approvedBy],
      foreignColumns: [users.id],
      name: 'refunds_approved_by_fkey',
    }),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'refunds_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.declinedBy],
      foreignColumns: [users.id],
      name: 'refunds_declined_by_fkey',
    }),
    foreignKey({
      columns: [table.headOfficeApprovedBy],
      foreignColumns: [users.id],
      name: 'refunds_head_office_approved_by_fkey',
    }),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: 'refunds_order_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'refunds_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.recordedBy],
      foreignColumns: [users.id],
      name: 'refunds_recorded_by_fkey',
    }),
    foreignKey({
      columns: [table.requestedByDeviceId],
      foreignColumns: [devices.id],
      name: 'refunds_requested_by_device_id_fkey',
    }),
    foreignKey({
      columns: [table.requestedByUserId],
      foreignColumns: [users.id],
      name: 'refunds_requested_by_user_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('refunds_amount_kobo_check', sql`amount_kobo > 0`),
    check(
      'refunds_check',
      sql`(status <> 'paid'::text) OR ((payment_method IS NOT NULL) AND (paid_at IS NOT NULL) AND (recorded_by IS NOT NULL))`,
    ),
    check(
      'refunds_check1',
      sql`(payment_method IS DISTINCT FROM 'bank_transfer'::text) OR (payment_reference IS NOT NULL)`,
    ),
    check('refunds_liability_check', sql`liability = ANY (ARRAY['store'::text, 'skipa'::text])`),
    check('refunds_note_check', sql`char_length(note) <= 1000`),
    check(
      'refunds_origin_check',
      sql`origin = ANY (ARRAY['shopper_request'::text, 'store_initiated'::text, 'stray_charge'::text])`,
    ),
    check(
      'refunds_payment_method_check',
      sql`payment_method = ANY (ARRAY['cash'::text, 'bank_transfer'::text, 'card_reversal'::text, 'other'::text])`,
    ),
    check(
      'refunds_reason_check',
      sql`reason = ANY (ARRAY['charged_twice'::text, 'wrong_price'::text, 'item_missing'::text, 'changed_mind'::text, 'did_not_leave'::text, 'other'::text])`,
    ),
    check(
      'refunds_status_check',
      sql`status = ANY (ARRAY['requested'::text, 'awaiting_head_office'::text, 'approved'::text, 'declined'::text, 'paid'::text])`,
    ),
  ],
);

export const refundStatusHistory = pgTable(
  'refund_status_history',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    refundId: uuid('refund_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    fromStatus: text('from_status'),
    toStatus: text('to_status').notNull(),
    actorType: text('actor_type').notNull(),
    actorId: uuid('actor_id'),
    note: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'refund_status_history_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.refundId],
      foreignColumns: [refunds.id],
      name: 'refund_status_history_refund_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
  ],
);

export const disputes = pgTable(
  'disputes',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    orderId: uuid('order_id').notNull(),
    paymentAttemptId: uuid('payment_attempt_id').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    paystackDisputeId: bigint('paystack_dispute_id', { mode: 'number' }).notNull(),
    category: text(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    amountKobo: bigint('amount_kobo', { mode: 'number' }).notNull(),
    status: text().notNull(),
    dueAt: timestamp('due_at', { withTimezone: true, mode: 'date' }).notNull(),
    evidenceSubmittedAt: timestamp('evidence_submitted_at', { withTimezone: true, mode: 'date' }),
    evidenceFiles: jsonb('evidence_files').default([]).notNull(),
    liability: text().default('store').notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('disputes_due_idx')
      .using('btree', table.dueAt.asc().nullsLast())
      .where(sql`(status = 'open'::text)`),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: 'disputes_order_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'disputes_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.paymentAttemptId],
      foreignColumns: [paymentAttempts.id],
      name: 'disputes_payment_attempt_id_fkey',
    }),
    unique('disputes_paystack_dispute_id_key').on(table.paystackDisputeId),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('disputes_liability_check', sql`liability = ANY (ARRAY['store'::text, 'skipa'::text])`),
    check(
      'disputes_status_check',
      sql`status = ANY (ARRAY['open'::text, 'evidence_submitted'::text, 'awaiting_bank'::text, 'won'::text, 'lost'::text, 'accepted'::text])`,
    ),
  ],
);

export const financialAdjustments = pgTable(
  'financial_adjustments',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id'),
    orderId: uuid('order_id'),
    kind: text().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    amountKobo: bigint('amount_kobo', { mode: 'number' }).notNull(),
    reason: text().notNull(),
    referencesId: uuid('references_id'),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('financial_adjustments_org_idx').using(
      'btree',
      table.organisationId.asc().nullsLast(),
      table.createdAt.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'financial_adjustments_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: 'financial_adjustments_order_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'financial_adjustments_organisation_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'financial_adjustments_kind_check',
      sql`kind = ANY (ARRAY['manual_correction'::text, 'chargeback_receivable'::text, 'receivable_payment'::text, 'skipa_liability'::text, 'skipa_liability_payment'::text, 'reconciliation_fix'::text])`,
    ),
  ],
);

export const starLedger = pgTable(
  'star_ledger',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    shopperId: uuid('shopper_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    orderId: uuid('order_id'),
    delta: integer().notNull(),
    reason: text().notNull(),
    ruleVersion: integer('rule_version').notNull(),
    awardDateWat: date('award_date_wat').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('star_ledger_shopper_idx').using(
      'btree',
      table.shopperId.asc().nullsLast(),
      table.organisationId.asc().nullsLast(),
    ),
    uniqueIndex('star_once_per_order_reason')
      .using('btree', table.orderId.asc().nullsLast(), table.reason.asc().nullsLast())
      .where(sql`(order_id IS NOT NULL)`),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: 'star_ledger_order_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'star_ledger_organisation_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('star_ledger_delta_check', sql`delta <> 0`),
    check(
      'star_ledger_reason_check',
      sql`reason = ANY (ARRAY['visit'::text, 'bonus'::text, 'refund_reversal'::text, 'chargeback_reversal'::text, 'guest_claim'::text, 'adjustment'::text])`,
    ),
  ],
);

export const posConnections = pgTable(
  'pos_connections',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    connectorKey: text('connector_key').notNull(),
    mode: text().notNull(),
    configEnc: bytea('config_enc'),
    skipaTillId: text('skipa_till_id'),
    status: text().default('testing').notNull(),
    lastSyncAt: timestamp('last_sync_at', { withTimezone: true, mode: 'date' }),
    lastSuccessAt: timestamp('last_success_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'pos_connections_organisation_id_fkey',
    }),
    unique('pos_connections_organisation_id_key').on(table.organisationId),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('pos_connections_mode_check', sql`mode = ANY (ARRAY['api'::text, 'file'::text])`),
    check(
      'pos_connections_status_check',
      sql`status = ANY (ARRAY['testing'::text, 'live'::text, 'failing'::text, 'disabled'::text])`,
    ),
  ],
);

export const posSyncRuns = pgTable(
  'pos_sync_runs',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id'),
    kind: text().notNull(),
    status: text().notNull(),
    productsSeen: integer('products_seen').default(0).notNull(),
    productsChanged: integer('products_changed').default(0).notNull(),
    errorCode: text('error_code'),
    errorDetail: text('error_detail'),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    finishedAt: timestamp('finished_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    index('pos_sync_runs_org_idx').using(
      'btree',
      table.organisationId.asc().nullsLast(),
      table.startedAt.desc().nullsFirst(),
    ),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'pos_sync_runs_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'pos_sync_runs_organisation_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'pos_sync_runs_kind_check',
      sql`kind = ANY (ARRAY['catalogue_pull'::text, 'catalogue_push'::text, 'file_import'::text])`,
    ),
    check(
      'pos_sync_runs_status_check',
      sql`status = ANY (ARRAY['running'::text, 'succeeded'::text, 'failed'::text])`,
    ),
  ],
);

export const posFiles = pgTable(
  'pos_files',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id'),
    direction: text().notNull(),
    kind: text().notNull(),
    businessDate: date('business_date'),
    storageKey: text('storage_key').notNull(),
    sha256: bytea('sha256').notNull(),
    rowCount: integer('row_count').notNull(),
    status: text().notNull(),
    errorDetail: text('error_detail'),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'pos_files_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'pos_files_organisation_id_fkey',
    }),
    unique('pos_files_organisation_id_sha256_key').on(table.organisationId, table.sha256),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'pos_files_direction_check',
      sql`direction = ANY (ARRAY['inbound'::text, 'outbound'::text])`,
    ),
    check(
      'pos_files_kind_check',
      sql`kind = ANY (ARRAY['products'::text, 'sales_refunds'::text, 'shift_close'::text, 'weights'::text])`,
    ),
    check(
      'pos_files_status_check',
      sql`status = ANY (ARRAY['received'::text, 'processed'::text, 'rejected'::text, 'generated'::text, 'downloaded'::text, 'confirmed'::text])`,
    ),
  ],
);

export const posPostings = pgTable(
  'pos_postings',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    kind: text().notNull(),
    sourceId: uuid('source_id').notNull(),
    idempotencyKey: text('idempotency_key').notNull(),
    payload: jsonb().notNull(),
    status: text().default('pending').notNull(),
    attempts: integer().default(0).notNull(),
    nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true, mode: 'date' }),
    lastErrorCode: text('last_error_code'),
    lastError: text('last_error'),
    posReference: text('pos_reference'),
    postedAt: timestamp('posted_at', { withTimezone: true, mode: 'date' }),
    posFileId: uuid('pos_file_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('pos_postings_due_idx')
      .using('btree', table.nextAttemptAt.asc().nullsLast())
      .where(sql`(status = ANY (ARRAY['pending'::text, 'failed'::text]))`),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'pos_postings_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'pos_postings_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.posFileId],
      foreignColumns: [posFiles.id],
      name: 'pos_postings_pos_file_id_fkey',
    }),
    unique('pos_postings_idempotency_key_key').on(table.idempotencyKey),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'pos_postings_kind_check',
      sql`kind = ANY (ARRAY['sale'::text, 'refund'::text, 'chargeback'::text])`,
    ),
    check(
      'pos_postings_status_check',
      sql`status = ANY (ARRAY['pending'::text, 'posted'::text, 'failed'::text, 'dead'::text, 'exported'::text, 'confirmed'::text])`,
    ),
  ],
);

export const paystackSettlements = pgTable(
  'paystack_settlements',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    paystackSettlementId: bigint('paystack_settlement_id', { mode: 'number' }).notNull(),
    subaccountCode: text('subaccount_code').notNull(),
    settlementDate: date('settlement_date').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    totalAmountKobo: bigint('total_amount_kobo', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    totalFeesKobo: bigint('total_fees_kobo', { mode: 'number' }).notNull(),
    status: text().notNull(),
    raw: jsonb().notNull(),
    fetchedAt: timestamp('fetched_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'paystack_settlements_organisation_id_fkey',
    }),
    unique('paystack_settlements_paystack_settlement_id_key').on(table.paystackSettlementId),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
  ],
);

export const reconciliationRuns = pgTable(
  'reconciliation_runs',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    businessDate: date('business_date').notNull(),
    trigger: text().notNull(),
    status: text().notNull(),
    ordersTotal: integer('orders_total').default(0).notNull(),
    matched: integer().default(0).notNull(),
    unmatched: integer().default(0).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    finishedAt: timestamp('finished_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    index('recon_runs_org_date_idx').using(
      'btree',
      table.organisationId.asc().nullsLast(),
      table.businessDate.desc().nullsFirst(),
    ),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'reconciliation_runs_organisation_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'reconciliation_runs_status_check',
      sql`status = ANY (ARRAY['running'::text, 'completed'::text, 'failed'::text])`,
    ),
    check(
      'reconciliation_runs_trigger_check',
      sql`trigger = ANY (ARRAY['schedule'::text, 'payout_arrived'::text, 'manual'::text])`,
    ),
  ],
);

export const reconciliationItems = pgTable(
  'reconciliation_items',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    runId: uuid('run_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id'),
    subjectType: text('subject_type').notNull(),
    subjectId: uuid('subject_id').notNull(),
    receiptOk: boolean('receipt_ok').notNull(),
    posOk: boolean('pos_ok').notNull(),
    paystackOk: boolean('paystack_ok').notNull(),
    cause: text().notNull(),
    detail: text().notNull(),
    status: text().default('open').notNull(),
    resolutionReason: text('resolution_reason'),
    resolvedBy: uuid('resolved_by'),
    resolvedAt: timestamp('resolved_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('recon_items_open_idx')
      .using('btree', table.organisationId.asc().nullsLast(), table.status.asc().nullsLast())
      .where(sql`(status = 'open'::text)`),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'reconciliation_items_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'reconciliation_items_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.runId],
      foreignColumns: [reconciliationRuns.id],
      name: 'reconciliation_items_run_id_fkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'reconciliation_items_cause_check',
      sql`cause = ANY (ARRAY['pos_missing'::text, 'pos_amount_mismatch'::text, 'payout_missing'::text, 'payout_amount_mismatch'::text, 'fee_split_mismatch'::text, 'duplicate_charge'::text, 'price_mismatch'::text, 'refund_not_recorded'::text, 'refund_not_posted'::text, 'unknown_settlement_line'::text])`,
    ),
    check(
      'reconciliation_items_status_check',
      sql`status = ANY (ARRAY['open'::text, 'resolved'::text])`,
    ),
    check(
      'reconciliation_items_subject_type_check',
      sql`subject_type = ANY (ARRAY['order'::text, 'refund'::text, 'dispute'::text, 'stray_charge'::text, 'settlement'::text])`,
    ),
  ],
);

export const payoutReports = pgTable(
  'payout_reports',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    settlementId: uuid('settlement_id'),
    businessDate: date('business_date').notNull(),
    receiptsCount: integer('receipts_count').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    salesKobo: bigint('sales_kobo', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    paystackFeesKobo: bigint('paystack_fees_kobo', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    skipaFeeKobo: bigint('skipa_fee_kobo', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    chargebacksKobo: bigint('chargebacks_kobo', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    payoutKobo: bigint('payout_kobo', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    refundsPaidByStoreKobo: bigint('refunds_paid_by_store_kobo', { mode: 'number' }).notNull(),
    status: text().notNull(),
    generatedAt: timestamp('generated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'payout_reports_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.settlementId],
      foreignColumns: [paystackSettlements.id],
      name: 'payout_reports_settlement_id_fkey',
    }),
    unique('payout_reports_organisation_id_business_date_key').on(
      table.businessDate,
      table.organisationId,
    ),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'payout_reports_status_check',
      sql`status = ANY (ARRAY['tied'::text, 'mismatch'::text, 'awaiting_payout'::text])`,
    ),
  ],
);

export const billingStatements = pgTable(
  'billing_statements',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    month: date().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    settledSalesKobo: bigint('settled_sales_kobo', { mode: 'number' }).notNull(),
    feeRateBps: integer('fee_rate_bps').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    feeExpectedKobo: bigint('fee_expected_kobo', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    feeSplitByPaystackKobo: bigint('fee_split_by_paystack_kobo', { mode: 'number' }).notNull(),
    status: text().notNull(),
    generatedAt: timestamp('generated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'billing_statements_organisation_id_fkey',
    }),
    unique('billing_statements_organisation_id_month_key').on(table.month, table.organisationId),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'billing_statements_month_check',
      sql`(date_trunc('month'::text, (month)::timestamp with time zone))::date = month`,
    ),
    check(
      'billing_statements_status_check',
      sql`status = ANY (ARRAY['matched'::text, 'mismatch'::text, 'pilot_no_fee'::text])`,
    ),
  ],
);

export const supportTickets = pgTable(
  'support_tickets',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    ticketNumber: text('ticket_number').notNull(),
    orderId: uuid('order_id'),
    refundId: uuid('refund_id'),
    shopperId: uuid('shopper_id'),
    deviceId: uuid('device_id'),
    guestContactId: uuid('guest_contact_id'),
    category: text().notNull(),
    status: text().default('new').notNull(),
    contextSnapshot: jsonb('context_snapshot').notNull(),
    firstReplyDueAt: timestamp('first_reply_due_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    firstRepliedAt: timestamp('first_replied_at', { withTimezone: true, mode: 'date' }),
    escalatedToHeadOfficeAt: timestamp('escalated_to_head_office_at', {
      withTimezone: true,
      mode: 'date',
    }),
    escalatedToPlatformAt: timestamp('escalated_to_platform_at', {
      withTimezone: true,
      mode: 'date',
    }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true, mode: 'date' }),
    rating: smallint(),
    clientRequestId: uuid('client_request_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('support_tickets_inbox_idx').using(
      'btree',
      table.branchId.asc().nullsLast(),
      table.status.asc().nullsLast(),
      table.createdAt.desc().nullsFirst(),
    ),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'support_tickets_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.deviceId],
      foreignColumns: [devices.id],
      name: 'support_tickets_device_id_fkey',
    }),
    foreignKey({
      columns: [table.guestContactId],
      foreignColumns: [contactDetailsInPii.id],
      name: 'support_tickets_guest_contact_id_fkey',
    }),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: 'support_tickets_order_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'support_tickets_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.refundId],
      foreignColumns: [refunds.id],
      name: 'support_tickets_refund_id_fkey',
    }),
    unique('support_tickets_ticket_number_key').on(table.ticketNumber),
    unique('support_tickets_client_request_id_key').on(table.clientRequestId),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'support_tickets_category_check',
      sql`category = ANY (ARRAY['payment'::text, 'refund'::text, 'wrong_price'::text, 'exit'::text, 'app'::text, 'other'::text])`,
    ),
    check('support_tickets_rating_check', sql`(rating >= 1) AND (rating <= 5)`),
    check(
      'support_tickets_status_check',
      sql`status = ANY (ARRAY['new'::text, 'in_progress'::text, 'waiting_for_shopper'::text, 'resolved'::text])`,
    ),
  ],
);

export const supportMessages = pgTable(
  'support_messages',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    ticketId: uuid('ticket_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    authorType: text('author_type').notNull(),
    authorId: uuid('author_id'),
    body: text().notNull(),
    internalNote: boolean('internal_note').default(false).notNull(),
    clientMessageId: uuid('client_message_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('support_messages_ticket_idx').using(
      'btree',
      table.ticketId.asc().nullsLast(),
      table.createdAt.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'support_messages_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.ticketId],
      foreignColumns: [supportTickets.id],
      name: 'support_messages_ticket_id_fkey',
    }),
    unique('support_messages_client_message_id_key').on(table.clientMessageId),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check(
      'support_messages_author_type_check',
      sql`author_type = ANY (ARRAY['shopper'::text, 'store'::text, 'skipa'::text, 'bot'::text, 'system'::text])`,
    ),
    check('support_messages_body_check', sql`char_length(body) <= 4000`),
  ],
);

export const brandingVersions = pgTable(
  'branding_versions',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    organisationId: uuid('organisation_id').notNull(),
    version: integer().notNull(),
    status: text().notNull(),
    displayName: text('display_name').notNull(),
    logoSquareKey: text('logo_square_key'),
    logoWideKey: text('logo_wide_key'),
    coverKey: text('cover_key'),
    primaryColor: text('primary_color').notNull(),
    accentColor: text('accent_color').notNull(),
    derivedTokens: jsonb('derived_tokens').notNull(),
    contrastReport: jsonb('contrast_report').notNull(),
    welcomeMessage: text('welcome_message'),
    receiptHeader: text('receipt_header'),
    receiptFooter: text('receipt_footer'),
    socialLinks: jsonb('social_links').default({}).notNull(),
    qrSignDesign: jsonb('qr_sign_design').default({}).notNull(),
    createdBy: uuid('created_by'),
    publishedBy: uuid('published_by'),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('branding_one_draft')
      .using('btree', table.organisationId.asc().nullsLast())
      .where(sql`(status = 'draft'::text)`),
    uniqueIndex('branding_one_published')
      .using('btree', table.organisationId.asc().nullsLast())
      .where(sql`(status = 'published'::text)`),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'branding_versions_organisation_id_fkey',
    }),
    unique('branding_versions_organisation_id_version_key').on(table.organisationId, table.version),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('branding_versions_accent_color_check', sql`accent_color ~ '^#[0-9A-F]{6}$'::text`),
    check('branding_versions_primary_color_check', sql`primary_color ~ '^#[0-9A-F]{6}$'::text`),
    check('branding_versions_receipt_footer_check', sql`char_length(receipt_footer) <= 300`),
    check('branding_versions_receipt_header_check', sql`char_length(receipt_header) <= 200`),
    check(
      'branding_versions_status_check',
      sql`status = ANY (ARRAY['draft'::text, 'published'::text, 'superseded'::text])`,
    ),
    check('branding_versions_welcome_message_check', sql`char_length(welcome_message) <= 140`),
  ],
);

export const shoppersInPii = pii.table(
  'shoppers',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    phoneHmac: bytea('phone_hmac').notNull(),
    phoneEnc: bytea('phone_enc').notNull(),
    phoneMasked: text('phone_masked').notNull(),
    name: text().notNull(),
    emailEnc: bytea('email_enc'),
    emailHmac: bytea('email_hmac'),
    emailReceipts: boolean('email_receipts').default(false).notNull(),
    avatar: text().default('tomi').notNull(),
    status: text().default('active').notNull(),
    suspendedReason: text('suspended_reason'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    unique('shoppers_phone_hmac_key').on(table.phoneHmac),
    check(
      'shoppers_avatar_check',
      sql`avatar = ANY (ARRAY['tomi'::text, 'mimi'::text, 'ata'::text, 'lubo'::text, 'sardi'::text])`,
    ),
    check(
      'shoppers_status_check',
      sql`status = ANY (ARRAY['active'::text, 'suspended'::text, 'deleted'::text])`,
    ),
  ],
);

export const consentsInPii = pii.table(
  'consents',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    shopperId: uuid('shopper_id').notNull(),
    kind: text().notNull(),
    organisationId: uuid('organisation_id'),
    noticeVersion: text('notice_version').notNull(),
    granted: boolean().notNull(),
    deviceId: uuid('device_id'),
    recordedAt: timestamp('recorded_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('consents_shopper_idx').using(
      'btree',
      table.shopperId.asc().nullsLast(),
      table.kind.asc().nullsLast(),
      table.recordedAt.desc().nullsFirst(),
    ),
    foreignKey({
      columns: [table.deviceId],
      foreignColumns: [devices.id],
      name: 'consents_device_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'consents_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.shopperId],
      foreignColumns: [shoppersInPii.id],
      name: 'consents_shopper_id_fkey',
    }),
    check(
      'consents_kind_check',
      sql`kind = ANY (ARRAY['privacy_notice'::text, 'marketing'::text, 'store_profile_sharing'::text])`,
    ),
  ],
);

export const dataRequestsInPii = pii.table(
  'data_requests',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    shopperId: uuid('shopper_id'),
    organisationId: uuid('organisation_id'),
    type: text().notNull(),
    status: text().default('received').notNull(),
    dueAt: timestamp('due_at', { withTimezone: true, mode: 'date' }).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    fileKey: text('file_key'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'data_requests_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.shopperId],
      foreignColumns: [shoppersInPii.id],
      name: 'data_requests_shopper_id_fkey',
    }),
    check(
      'data_requests_status_check',
      sql`status = ANY (ARRAY['received'::text, 'in_progress'::text, 'completed'::text, 'rejected'::text])`,
    ),
    check(
      'data_requests_type_check',
      sql`type = ANY (ARRAY['export'::text, 'delete'::text, 'store_offboarding'::text])`,
    ),
  ],
);

export const contactDetailsInPii = pii.table(
  'contact_details',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    deviceId: uuid('device_id'),
    emailEnc: bytea('email_enc').notNull(),
    emailMasked: text('email_masked').notNull(),
    purpose: text().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.deviceId],
      foreignColumns: [devices.id],
      name: 'contact_details_device_id_fkey',
    }),
    check(
      'contact_details_purpose_check',
      sql`purpose = ANY (ARRAY['support_reply'::text, 'receipt'::text])`,
    ),
  ],
);

export const auditLogInAudit = audit.table(
  'audit_log',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    actorType: text('actor_type').notNull(),
    actorId: uuid('actor_id'),
    actorRole: text('actor_role'),
    organisationId: uuid('organisation_id'),
    branchId: uuid('branch_id'),
    action: text().notNull(),
    targetType: text('target_type').notNull(),
    targetId: uuid('target_id'),
    before: jsonb(),
    after: jsonb(),
    reason: text(),
    requestId: text('request_id'),
    ipHash: bytea('ip_hash'),
  },
  (table) => [
    index('audit_action_idx').using(
      'btree',
      table.action.asc().nullsLast(),
      table.occurredAt.desc().nullsFirst(),
    ),
    index('audit_org_time_idx').using(
      'btree',
      table.organisationId.asc().nullsLast(),
      table.occurredAt.desc().nullsFirst(),
    ),
    check(
      'audit_log_actor_type_check',
      sql`actor_type = ANY (ARRAY['user'::text, 'shopper'::text, 'system'::text, 'job'::text])`,
    ),
  ],
);

export const personalDataAccessInAudit = audit.table(
  'personal_data_access',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    adminUserId: uuid('admin_user_id').notNull(),
    organisationId: uuid('organisation_id'),
    subjectType: text('subject_type').notNull(),
    subjectId: uuid('subject_id'),
    reason: text().notNull(),
    grantTokenHash: bytea('grant_token_hash').notNull(),
    grantedAt: timestamp('granted_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.adminUserId],
      foreignColumns: [users.id],
      name: 'personal_data_access_admin_user_id_fkey',
    }),
    unique('personal_data_access_grant_token_hash_key').on(table.grantTokenHash),
    check('personal_data_access_reason_check', sql`char_length(reason) >= 10`),
    check(
      'personal_data_access_subject_type_check',
      sql`subject_type = ANY (ARRAY['shopper'::text, 'organisation_shoppers'::text, 'order'::text])`,
    ),
  ],
);

export const adminSignInsInAudit = audit.table(
  'admin_sign_ins',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey()
      .notNull(),
    userId: uuid('user_id').notNull(),
    ipAddress: inet('ip_address').notNull(),
    userAgent: text('user_agent').notNull(),
    newDevice: boolean('new_device').notNull(),
    succeeded: boolean().notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'admin_sign_ins_user_id_fkey',
    }),
  ],
);

export const branchCounters = pgTable(
  'branch_counters',
  {
    branchId: uuid('branch_id').notNull(),
    counter: text().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    nextValue: bigint('next_value', { mode: 'number' }).default(1).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'branch_counters_branch_id_fkey',
    }),
    primaryKey({ columns: [table.branchId, table.counter], name: 'branch_counters_pkey' }),
    check(
      'branch_counters_counter_check',
      sql`counter = ANY (ARRAY['order'::text, 'receipt'::text])`,
    ),
  ],
);

export const userBranches = pgTable(
  'user_branches',
  {
    userId: uuid('user_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'user_branches_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'user_branches_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'user_branches_user_id_fkey',
    }),
    primaryKey({ columns: [table.branchId, table.userId], name: 'user_branches_pkey' }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
  ],
);

export const shopperDevicesInPii = pii.table(
  'shopper_devices',
  {
    shopperId: uuid('shopper_id').notNull(),
    deviceId: uuid('device_id').notNull(),
    linkedAt: timestamp('linked_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.deviceId],
      foreignColumns: [devices.id],
      name: 'shopper_devices_device_id_fkey',
    }),
    foreignKey({
      columns: [table.shopperId],
      foreignColumns: [shoppersInPii.id],
      name: 'shopper_devices_shopper_id_fkey',
    }),
    primaryKey({ columns: [table.deviceId, table.shopperId], name: 'shopper_devices_pkey' }),
  ],
);

export const knownAdminDevices = pgTable(
  'known_admin_devices',
  {
    userId: uuid('user_id').notNull(),
    deviceKeyHash: bytea('device_key_hash').notNull(),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'known_admin_devices_user_id_fkey',
    }),
    primaryKey({ columns: [table.deviceKeyHash, table.userId], name: 'known_admin_devices_pkey' }),
  ],
);

export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    userId: uuid('user_id').notNull(),
    alertKey: text('alert_key').notNull(),
    inApp: boolean('in_app').default(true).notNull(),
    email: boolean().default(true).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'notification_preferences_user_id_fkey',
    }),
    primaryKey({ columns: [table.alertKey, table.userId], name: 'notification_preferences_pkey' }),
  ],
);

export const posDepartmentMappings = pgTable(
  'pos_department_mappings',
  {
    organisationId: uuid('organisation_id').notNull(),
    posDepartment: text('pos_department').notNull(),
    categoryId: uuid('category_id').notNull(),
    mappedBy: uuid('mapped_by'),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: 'pos_department_mappings_category_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'pos_department_mappings_organisation_id_fkey',
    }),
    primaryKey({
      columns: [table.organisationId, table.posDepartment],
      name: 'pos_department_mappings_pkey',
    }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
  ],
);

export const visitedStoresInPii = pii.table(
  'visited_stores',
  {
    shopperId: uuid('shopper_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    firstVisitAt: timestamp('first_visit_at', { withTimezone: true, mode: 'date' }).notNull(),
    lastVisitAt: timestamp('last_visit_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'visited_stores_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.shopperId],
      foreignColumns: [shoppersInPii.id],
      name: 'visited_stores_shopper_id_fkey',
    }),
    primaryKey({ columns: [table.organisationId, table.shopperId], name: 'visited_stores_pkey' }),
  ],
);

export const tourProgress = pgTable(
  'tour_progress',
  {
    subjectType: text('subject_type').notNull(),
    subjectId: uuid('subject_id').notNull(),
    tourKey: text('tour_key').notNull(),
    status: text().notNull(),
    stepReached: smallint('step_reached').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.subjectId, table.subjectType, table.tourKey],
      name: 'tour_progress_pkey',
    }),
    check(
      'tour_progress_status_check',
      sql`status = ANY (ARRAY['seen'::text, 'skipped'::text, 'completed'::text])`,
    ),
    check(
      'tour_progress_subject_type_check',
      sql`subject_type = ANY (ARRAY['device'::text, 'user'::text])`,
    ),
    check(
      'tour_progress_tour_key_check',
      sql`tour_key = ANY (ARRAY['skipa_home'::text, 'store_first_visit'::text, 'dashboard'::text, 'exit_first_shift'::text])`,
    ),
  ],
);

export const branchCategories = pgTable(
  'branch_categories',
  {
    branchId: uuid('branch_id').notNull(),
    categoryId: uuid('category_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    active: boolean().default(false).notNull(),
    activatedAt: timestamp('activated_at', { withTimezone: true, mode: 'date' }),
    activatedBy: uuid('activated_by'),
  },
  (table) => [
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'branch_categories_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: 'branch_categories_category_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'branch_categories_organisation_id_fkey',
    }),
    primaryKey({ columns: [table.branchId, table.categoryId], name: 'branch_categories_pkey' }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
  ],
);

export const branchProducts = pgTable(
  'branch_products',
  {
    branchId: uuid('branch_id').notNull(),
    productId: uuid('product_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    priceKobo: bigint('price_kobo', { mode: 'number' }).notNull(),
    stockQty: integer('stock_qty'),
    priceSyncedAt: timestamp('price_synced_at', { withTimezone: true, mode: 'date' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'branch_products_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'branch_products_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: 'branch_products_product_id_fkey',
    }),
    primaryKey({ columns: [table.branchId, table.productId], name: 'branch_products_pkey' }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
    check('branch_products_price_kobo_check', sql`price_kobo > 0`),
  ],
);

export const catalogueSnapshots = pgTable(
  'catalogue_snapshots',
  {
    branchId: uuid('branch_id').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    version: bigint({ mode: 'number' }).notNull(),
    organisationId: uuid('organisation_id').notNull(),
    etag: text().notNull(),
    productCount: integer('product_count').notNull(),
    payloadGzip: bytea('payload_gzip').notNull(),
    builtAt: timestamp('built_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: 'catalogue_snapshots_branch_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'catalogue_snapshots_organisation_id_fkey',
    }),
    primaryKey({ columns: [table.branchId, table.version], name: 'catalogue_snapshots_pkey' }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
  ],
);

export const exitCheckItems = pgTable(
  'exit_check_items',
  {
    exitCheckId: uuid('exit_check_id').notNull(),
    orderItemId: uuid('order_item_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    flagged: boolean().notNull(),
    flagReason: text('flag_reason'),
    ticked: boolean().default(false).notNull(),
    tickedAt: timestamp('ticked_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    foreignKey({
      columns: [table.exitCheckId],
      foreignColumns: [exitChecks.id],
      name: 'exit_check_items_exit_check_id_fkey',
    }),
    foreignKey({
      columns: [table.orderItemId],
      foreignColumns: [orderItems.id],
      name: 'exit_check_items_order_item_id_fkey',
    }),
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'exit_check_items_organisation_id_fkey',
    }),
    primaryKey({ columns: [table.exitCheckId, table.orderItemId], name: 'exit_check_items_pkey' }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
  ],
);

export const settlementLines = pgTable(
  'settlement_lines',
  {
    settlementId: uuid('settlement_id').notNull(),
    organisationId: uuid('organisation_id').notNull(),
    reference: text().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    amountKobo: bigint('amount_kobo', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    paystackFeeKobo: bigint('paystack_fee_kobo', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    skipaShareKobo: bigint('skipa_share_kobo', { mode: 'number' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    subaccountShareKobo: bigint('subaccount_share_kobo', { mode: 'number' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organisationId],
      foreignColumns: [organisations.id],
      name: 'settlement_lines_organisation_id_fkey',
    }),
    foreignKey({
      columns: [table.settlementId],
      foreignColumns: [paystackSettlements.id],
      name: 'settlement_lines_settlement_id_fkey',
    }),
    primaryKey({ columns: [table.reference, table.settlementId], name: 'settlement_lines_pkey' }),
    pgPolicy('tenant_isolation', {
      as: 'permissive',
      for: 'all',
      to: ['public'],
      using: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
      withCheck: sql`(organisation_id = ANY ((string_to_array(current_setting('app.org_ids'::text, true), ','::text))::uuid[]))`,
    }),
  ],
);

export const idempotencyKeys = pgTable(
  'idempotency_keys',
  {
    scope: text().notNull(),
    key: text().notNull(),
    requestHash: bytea('request_hash').notNull(),
    status: text().notNull(),
    responseStatus: integer('response_status'),
    responseBody: jsonb('response_body'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.key, table.scope], name: 'idempotency_keys_pkey' }),
    check(
      'idempotency_keys_status_check',
      sql`status = ANY (ARRAY['in_progress'::text, 'completed'::text])`,
    ),
  ],
);

// Parent of the monthly partitions (analytics.events_YYYY_MM, created by analytics.partitions_maintain).
export const events = analytics.table(
  'events',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .notNull(),
    eventName: text('event_name').notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true, mode: 'date' }).notNull(),
    receivedAt: timestamp('received_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    source: text().notNull(),
    deviceId: uuid('device_id'),
    shopperId: uuid('shopper_id'),
    userId: uuid('user_id'),
    sessionId: uuid('session_id'),
    organisationId: uuid('organisation_id'),
    branchId: uuid('branch_id'),
    app: text().notNull(),
    appVersion: text('app_version').notNull(),
    platform: text().notNull(),
    device: text(),
    browser: text(),
    networkType: text('network_type'),
    screen: text(),
    requestId: text('request_id'),
    properties: jsonb().default({}).notNull(),
    clientEventId: uuid('client_event_id'),
  },
  (table) => [
    index('events_branch_time_idx').using(
      'btree',
      table.branchId.asc().nullsLast(),
      table.occurredAt.asc().nullsLast(),
    ),
    index('events_name_time_idx').using(
      'btree',
      table.eventName.asc().nullsLast(),
      table.occurredAt.asc().nullsLast(),
    ),
    primaryKey({ columns: [table.id, table.occurredAt], name: 'events_pkey' }),
    check('events_event_name_check', sql`event_name ~ '^[a-z]+(_[a-z]+)+$'::text`),
    check('events_source_check', sql`source = ANY (ARRAY['client'::text, 'server'::text])`),
  ],
);

// db/migrations/0002_rate_limit_counters.sql (UNLOGGED; see ADR-34).
export const rateLimitCounters = pgTable(
  'rate_limit_counters',
  {
    key: text().primaryKey().notNull(),
    count: integer().notNull(),
    resetAt: timestamp('reset_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (table) => [
    index('rate_limit_counters_reset_idx').using('btree', table.resetAt.asc().nullsLast()),
  ],
);
