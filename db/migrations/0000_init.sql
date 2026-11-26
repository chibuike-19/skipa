-- =====================================================================
-- Skipa — PostgreSQL schema v1.0 (target: PostgreSQL 18.7)
-- Source of truth for the first Drizzle migration (0000_init).
-- Conventions
--   * Primary keys: uuid v7 (uuidv7(), built into PostgreSQL 18).
--   * Money: bigint kobo, never numeric/float (PY-05, DM-01).
--   * Time: timestamptz stored in UTC; displayed in West Africa Time (AN-08).
--   * Enums: text + CHECK constraint (cheap to change in a migration).
--   * Tenancy: every tenant row carries organisation_id (DM-04) and RLS.
--   * Financial and audit tables are append-only (CS-04, DM-03, ST-05):
--     UPDATE/DELETE blocked by trigger; corrections are new rows.
--   * Shopper personal data lives in schema `pii` (DM-05, DM-06).
-- Requirement IDs in comments trace back to PRD v2.0 (+ v1 where unchanged).
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS pii;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS analytics;

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION forbid_update_delete() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'table %.% is append-only (CS-04)', TG_TABLE_SCHEMA, TG_TABLE_NAME
    USING ERRCODE = 'restrict_violation';
END $$;

CREATE OR REPLACE FUNCTION immutable_join(text[]) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$ SELECT array_to_string($1, ' ') $$;

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;

-- ---------------------------------------------------------------------
-- 1. Platform configuration
-- ---------------------------------------------------------------------
CREATE TABLE platform_settings (            -- CS-06, SA config defaults
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  updated_by  uuid,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE feature_flags (                -- SA-04, D-23 second-step flag
  key          text PRIMARY KEY,            -- e.g. 'superadmin_second_step'
  description  text NOT NULL,
  enabled      boolean NOT NULL DEFAULT false,
  rollout      jsonb NOT NULL DEFAULT '{}'::jsonb,  -- {"organisationIds":[],"branchIds":[],"percent":0}
  updated_by   uuid,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE standard_categories (          -- 7.2, managed by super admin
  id                  uuid PRIMARY KEY DEFAULT uuidv7(),
  key                 text NOT NULL UNIQUE,
  name                text NOT NULL,
  description         text NOT NULL DEFAULT '',
  default_check_level text NOT NULL CHECK (default_check_level IN ('standard','extra')),
  sort_order          int  NOT NULL DEFAULT 0,
  active              boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notification_templates (       -- NT-03 (versioned, edited by super admin)
  id          uuid PRIMARY KEY DEFAULT uuidv7(),
  key         text NOT NULL,                -- e.g. 'staff_sign_in_code'
  channel     text NOT NULL CHECK (channel IN ('email','sms','telegram','in_app')),
  locale      text NOT NULL DEFAULT 'en',
  version     int  NOT NULL,
  subject     text,
  body        text NOT NULL,                -- Handlebars-style {{placeholders}}
  active      boolean NOT NULL DEFAULT false,
  updated_by  uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (key, channel, locale, version)
);
CREATE UNIQUE INDEX notification_templates_one_active
  ON notification_templates (key, channel, locale) WHERE active;

CREATE TABLE star_rules (                   -- ST-02, ST-03, ST-10 (versioned)
  id             uuid PRIMARY KEY DEFAULT uuidv7(),
  version        int NOT NULL UNIQUE,
  rules          jsonb NOT NULL,            -- {"perVisit":1,"dailyCapPerStore":1,"bonuses":[],"tiersEnabled":false}
  effective_from timestamptz NOT NULL,
  created_by     uuid,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 2. Organisations, branches, settings
-- ---------------------------------------------------------------------
CREATE TABLE organisations (
  id                        uuid PRIMARY KEY DEFAULT uuidv7(),
  name                      text NOT NULL,             -- display name
  legal_name                text NOT NULL,
  status                    text NOT NULL DEFAULT 'onboarding'
                            CHECK (status IN ('onboarding','pilot','live','paused','ended')),
  plan                      text NOT NULL DEFAULT 'pilot' CHECK (plan IN ('pilot','paid')),   -- CS-07, SA-09
  pilot_ends_on             date,
  platform_fee_bps          int  NOT NULL DEFAULT 200 CHECK (platform_fee_bps BETWEEN 0 AND 2000), -- 2% default
  paystack_subaccount_code  text UNIQUE,                                              -- PY-12
  paystack_subaccount_status text NOT NULL DEFAULT 'not_created'
                            CHECK (paystack_subaccount_status IN ('not_created','active','inactive')),
  settlement_bank_name      text,
  settlement_account_last4  text CHECK (settlement_account_last4 ~ '^[0-9]{4}$'),
  pos_mode                  text CHECK (pos_mode IN ('api','file')),                  -- 12.1
  pos_connector_key         text,                                                     -- e.g. 'generic_csv', 'tillwise_api'
  head_office_email         citext,
  agreement_signed_on       date,
  ended_at                  timestamptz,
  data_deletion_due_on      date,                                                     -- NF-17
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  CHECK (plan = 'paid' OR pilot_ends_on IS NOT NULL OR status = 'onboarding')
);
CREATE TRIGGER organisations_touch BEFORE UPDATE ON organisations
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE branches (
  id                     uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id        uuid NOT NULL REFERENCES organisations(id),
  code                   text NOT NULL CHECK (code ~ '^[A-Z]{2,4}$'),   -- 'LK' → receipt LK-04822
  name                   text NOT NULL,
  address_line           text NOT NULL,
  area                   text NOT NULL,                                 -- store search by area (SH-26)
  city                   text NOT NULL DEFAULT 'Lagos',
  latitude               numeric(9,6),                                  -- distance computed on the phone (NF-29)
  longitude              numeric(9,6),
  phone                  text,
  service_desk_note      text,
  opening_hours          jsonb NOT NULL DEFAULT '{}'::jsonb,            -- {"mon":[["08:00","21:00"]],...} WAT
  status                 text NOT NULL DEFAULT 'onboarding'
                         CHECK (status IN ('onboarding','live','paused','ended')),
  skipa_enabled          boolean NOT NULL DEFAULT false,                -- SD-03 switch-off
  switched_off_reason    text,
  switched_off_at        timestamptz,
  switched_off_by        uuid,
  random_check_rate_pct  smallint NOT NULL DEFAULT 5
                         CHECK (random_check_rate_pct IN (1,2,5,10,15,20)),  -- EX-11, D-20
  welcome_message_override text CHECK (char_length(welcome_message_override) <= 140), -- BR-01
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, code)
);
CREATE INDEX branches_org_idx ON branches (organisation_id);
CREATE INDEX branches_search_idx ON branches USING gin ((name || ' ' || area || ' ' || city) gin_trgm_ops);
CREATE TRIGGER branches_touch BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE branch_settings (               -- CS-06: values are settings, not code
  branch_id                         uuid PRIMARY KEY REFERENCES branches(id),
  organisation_id                   uuid NOT NULL REFERENCES organisations(id),
  cart_max_value_kobo               bigint NOT NULL DEFAULT 15000000,   -- ₦150,000 (Q08)
  cart_max_items                    int    NOT NULL DEFAULT 30,
  rule_extra_checks_enabled         boolean NOT NULL DEFAULT true,      -- 6.3
  rule_price_threshold_enabled      boolean NOT NULL DEFAULT true,
  price_threshold_kobo              bigint NOT NULL DEFAULT 2500000,    -- ₦25,000
  rule_item_count_enabled           boolean NOT NULL DEFAULT true,
  large_basket_items                int    NOT NULL DEFAULT 15,
  rule_basket_value_enabled         boolean NOT NULL DEFAULT true,
  basket_value_threshold_kobo       bigint NOT NULL DEFAULT 10000000,   -- ₦100,000 (design default)
  rule_previous_mismatch_enabled    boolean NOT NULL DEFAULT true,
  previous_mismatch_days            int    NOT NULL DEFAULT 90,
  weight_tolerance_bps              int    NOT NULL DEFAULT 300,        -- ±3% (EX-04)
  exit_window_minutes               int    NOT NULL DEFAULT 30,         -- SH-23
  session_timeout_minutes           int    NOT NULL DEFAULT 60,         -- SH-03
  saved_cart_hours                  int    NOT NULL DEFAULT 24,
  exit_session_idle_hours           int    NOT NULL DEFAULT 12,         -- RB-06 (design: idle)
  refund_head_office_threshold_kobo bigint NOT NULL DEFAULT 2000000,    -- ₦20,000 (PY-08, Q21)
  refund_record_reminder_hours      int    NOT NULL DEFAULT 24,         -- off-platform refunds
  support_first_reply_minutes       int    NOT NULL DEFAULT 15,         -- HP-12
  stale_price_hours                 int    NOT NULL DEFAULT 24,         -- 12.4
  channel_card_enabled              boolean NOT NULL DEFAULT true,      -- PY-11
  channel_transfer_enabled          boolean NOT NULL DEFAULT true,
  channel_ussd_enabled              boolean NOT NULL DEFAULT true,
  updated_by                        uuid,
  updated_at                        timestamptz NOT NULL DEFAULT now(),
  CHECK (cart_max_value_kobo > 0 AND cart_max_items > 0),
  CHECK (weight_tolerance_bps BETWEEN 50 AND 2000)
);

CREATE TABLE qr_codes (                      -- SH-01, SD-08
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  branch_id       uuid NOT NULL REFERENCES branches(id),
  code            text NOT NULL UNIQUE CHECK (code ~ '^QR-[A-Z]{2,4}-[A-Z]{3}-[0-9]{2}$'), -- QR-LK-ENT-01
  location_label  text NOT NULL,             -- 'Main entrance'
  active          boolean NOT NULL DEFAULT true,
  signs_printed   int NOT NULL DEFAULT 0,
  last_printed_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX qr_codes_branch_idx ON qr_codes (branch_id);

-- ---------------------------------------------------------------------
-- 3. Staff users, roles, invites, sign-in
-- ---------------------------------------------------------------------
CREATE TABLE users (                         -- store staff + Skipa team (RB-01..03)
  id                  uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id     uuid REFERENCES organisations(id),     -- NULL for Skipa team
  email               citext NOT NULL UNIQUE,
  name                text NOT NULL,
  role                text NOT NULL CHECK (role IN
                      ('exit_checker','store_manager','head_office_admin','super_admin','support_agent')),
  status              text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','active','suspended','removed')),
  invited_by          uuid REFERENCES users(id),
  invited_at          timestamptz,
  activated_at        timestamptz,
  last_sign_in_at     timestamptz,
  totp_secret_enc     bytea,                 -- second step (flag superadmin_second_step, D-23)
  totp_enrolled_at    timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CHECK ((role IN ('super_admin','support_agent')) = (organisation_id IS NULL))
);
CREATE INDEX users_org_idx ON users (organisation_id);
CREATE TRIGGER users_touch BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE user_branches (                 -- branch scope for managers and checkers
  user_id         uuid NOT NULL REFERENCES users(id),
  branch_id       uuid NOT NULL REFERENCES branches(id),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  PRIMARY KEY (user_id, branch_id)
);

CREATE TABLE staff_invites (                 -- 3.2, RB-03, NF-28 (7 days, single use)
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id uuid REFERENCES organisations(id),         -- NULL = Skipa team invite
  user_id         uuid NOT NULL REFERENCES users(id),        -- user row created as 'pending'
  email           citext NOT NULL,
  token_hash      bytea  NOT NULL UNIQUE,                    -- SHA-256 of the link token
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','accepted','cancelled','expired')),
  expires_at      timestamptz NOT NULL,
  invited_by      uuid NOT NULL REFERENCES users(id),
  resend_count    int NOT NULL DEFAULT 0,
  accepted_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX staff_invites_user_idx ON staff_invites (user_id);

CREATE TABLE devices (                       -- guest identity (IR-06); pseudonymous personal data
  id            uuid PRIMARY KEY DEFAULT uuidv7(),
  platform      text NOT NULL CHECK (platform IN ('web','ios','android')),
  app_version   text NOT NULL,
  browser       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE otp_challenges (                -- AUTH; SMS for shoppers, email for staff
  id                 uuid PRIMARY KEY DEFAULT uuidv7(),
  channel            text NOT NULL CHECK (channel IN ('sms','email')),
  purpose            text NOT NULL CHECK (purpose IN
                     ('shopper_register','shopper_sign_in','staff_sign_in','admin_sign_in')),
  destination_hmac   bytea NOT NULL,         -- HMAC-SHA256(phone|email) for rate limits & lookup
  destination_masked text  NOT NULL,         -- '+234 803 *** 1180' / 't***@skipa.ng'
  code_hash          bytea NOT NULL,         -- HMAC-SHA256(code, challenge id)
  attempts           smallint NOT NULL DEFAULT 0,
  max_attempts       smallint NOT NULL DEFAULT 5,
  expires_at         timestamptz NOT NULL,   -- 10 minutes
  consumed_at        timestamptz,
  device_id          uuid REFERENCES devices(id),
  ip_hash            bytea,
  invite_id          uuid REFERENCES staff_invites(id),
  provider           text,
  provider_message_id text,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX otp_dest_recent_idx ON otp_challenges (destination_hmac, created_at DESC);

CREATE TABLE sessions (                      -- opaque bearer/cookie sessions, all surfaces
  id                   uuid PRIMARY KEY DEFAULT uuidv7(),
  token_hash           bytea NOT NULL UNIQUE,      -- SHA-256 of the 32-byte random token
  subject_type         text NOT NULL CHECK (subject_type IN ('shopper','user')),
  subject_id           uuid NOT NULL,
  surface              text NOT NULL CHECK (surface IN ('shopper','exit','store','admin')),
  device_id            uuid REFERENCES devices(id),
  branch_id            uuid REFERENCES branches(id),   -- exit sessions are bound to a branch
  exit_device_id       uuid,
  second_step_passed   boolean NOT NULL DEFAULT false,
  idle_timeout_seconds int NOT NULL,              -- admin 1800 (SA-01), exit 43200 (RB-06)
  absolute_expires_at  timestamptz NOT NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  last_seen_at         timestamptz NOT NULL DEFAULT now(),
  ip_hash              bytea,
  user_agent           text,
  revoked_at           timestamptz,
  revoked_reason       text
);
CREATE INDEX sessions_subject_idx ON sessions (subject_type, subject_id) WHERE revoked_at IS NULL;

CREATE TABLE known_admin_devices (           -- NF-27 new-device notice
  user_id          uuid NOT NULL REFERENCES users(id),
  device_key_hash  bytea NOT NULL,
  first_seen_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, device_key_hash)
);

-- ---------------------------------------------------------------------
-- 4. Shoppers — personal data apart from orders (DM-05, DM-06)
-- ---------------------------------------------------------------------
CREATE TABLE pii.shoppers (
  id               uuid PRIMARY KEY DEFAULT uuidv7(),
  phone_hmac       bytea NOT NULL UNIQUE,      -- lookup key; phone itself encrypted
  phone_enc        bytea NOT NULL,             -- AES-256-GCM, key PII_ENCRYPTION_KEY
  phone_masked     text  NOT NULL,
  name             text  NOT NULL,
  email_enc        bytea,
  email_hmac       bytea,
  email_receipts   boolean NOT NULL DEFAULT false,   -- "Email my receipts" opt-in
  avatar           text NOT NULL DEFAULT 'tomi'
                   CHECK (avatar IN ('tomi','mimi','ata','lubo','sardi')),   -- SH-29
  status           text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deleted')),
  suspended_reason text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);
CREATE TRIGGER shoppers_touch BEFORE UPDATE ON pii.shoppers FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE pii.shopper_devices (
  shopper_id  uuid NOT NULL REFERENCES pii.shoppers(id),
  device_id   uuid NOT NULL REFERENCES devices(id),
  linked_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (shopper_id, device_id)
);

CREATE TABLE pii.consents (                  -- NF-15, SH-06, SH-07 (append-only)
  id               uuid PRIMARY KEY DEFAULT uuidv7(),
  shopper_id       uuid NOT NULL REFERENCES pii.shoppers(id),
  kind             text NOT NULL CHECK (kind IN ('privacy_notice','marketing','store_profile_sharing')),
  organisation_id  uuid REFERENCES organisations(id),       -- set for store_profile_sharing (ST-09)
  notice_version   text NOT NULL,
  granted          boolean NOT NULL,
  device_id        uuid REFERENCES devices(id),
  recorded_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX consents_shopper_idx ON pii.consents (shopper_id, kind, recorded_at DESC);
CREATE TRIGGER consents_append_only BEFORE UPDATE OR DELETE ON pii.consents
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

CREATE TABLE pii.visited_stores (            -- SH-30 store switcher, DM-06
  shopper_id       uuid NOT NULL REFERENCES pii.shoppers(id),
  organisation_id  uuid NOT NULL REFERENCES organisations(id),
  first_visit_at   timestamptz NOT NULL,
  last_visit_at    timestamptz NOT NULL,
  PRIMARY KEY (shopper_id, organisation_id)
);

CREATE TABLE pii.data_requests (             -- NF-16 (30 days), NF-17
  id            uuid PRIMARY KEY DEFAULT uuidv7(),
  shopper_id    uuid REFERENCES pii.shoppers(id),
  organisation_id uuid REFERENCES organisations(id),     -- store offboarding export (NF-17)
  type          text NOT NULL CHECK (type IN ('export','delete','store_offboarding')),
  status        text NOT NULL DEFAULT 'received' CHECK (status IN ('received','in_progress','completed','rejected')),
  due_at        timestamptz NOT NULL,
  completed_at  timestamptz,
  file_key      text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE pii.contact_details (           -- guest emails given for support/receipts (HP-09 v2)
  id          uuid PRIMARY KEY DEFAULT uuidv7(),
  device_id   uuid REFERENCES devices(id),
  email_enc   bytea NOT NULL,
  email_masked text NOT NULL,
  purpose     text NOT NULL CHECK (purpose IN ('support_reply','receipt')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL           -- purged with the ticket/receipt retention
);

-- ---------------------------------------------------------------------
-- 5. Catalogue (section 7, 12)
-- ---------------------------------------------------------------------
CREATE TABLE categories (                    -- CT-01..03; standard copies + custom
  id                    uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id       uuid NOT NULL REFERENCES organisations(id),
  standard_category_id  uuid REFERENCES standard_categories(id),
  kind                  text NOT NULL CHECK (kind IN ('standard','custom')),
  name                  text NOT NULL,
  check_level           text NOT NULL CHECK (check_level IN ('standard','extra')),
  check_level_floor     text NOT NULL DEFAULT 'standard' CHECK (check_level_floor IN ('standard','extra')), -- CT-03
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CHECK (NOT (check_level_floor = 'extra' AND check_level = 'standard')),
  UNIQUE (organisation_id, name)
);

CREATE TABLE branch_categories (             -- CT-01 on/off per branch; CT-08 activation date
  branch_id        uuid NOT NULL REFERENCES branches(id),
  category_id      uuid NOT NULL REFERENCES categories(id),
  organisation_id  uuid NOT NULL REFERENCES organisations(id),
  active           boolean NOT NULL DEFAULT false,
  activated_at     timestamptz,
  activated_by     uuid,
  PRIMARY KEY (branch_id, category_id)
);

CREATE TABLE pos_department_mappings (       -- 7.1 step 2
  organisation_id      uuid NOT NULL REFERENCES organisations(id),
  pos_department       text NOT NULL,
  category_id          uuid NOT NULL REFERENCES categories(id),
  mapped_by            uuid,
  PRIMARY KEY (organisation_id, pos_department)
);

CREATE TABLE products (                      -- org-level product identity (PO-01, PO-10)
  id                 uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id    uuid NOT NULL REFERENCES organisations(id),
  pos_product_id     text NOT NULL,
  barcode            text CHECK (barcode ~ '^[0-9]{8}$|^[0-9]{12,13}$'),   -- EAN-8, UPC-A, EAN-13 (UPC-E expanded)
  name               text NOT NULL,
  pos_department     text,
  category_id        uuid REFERENCES categories(id),
  weight_grams       int CHECK (weight_grams > 0),
  weight_source      text CHECK (weight_source IN ('store','skipa','import','sample')),  -- CT-07
  sold_by_weight     boolean NOT NULL DEFAULT false,                     -- CT-05 → never sellable
  variable_price     boolean NOT NULL DEFAULT false,
  extra_checks       boolean NOT NULL DEFAULT false,                     -- CT-04
  sold_through_skipa boolean NOT NULL DEFAULT true,                      -- CT-04 (false = till-only)
  deleted_in_pos     boolean NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, pos_product_id)
);
CREATE UNIQUE INDEX products_org_barcode_uq ON products (organisation_id, barcode) WHERE barcode IS NOT NULL AND NOT deleted_in_pos;
CREATE INDEX products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE TRIGGER products_touch BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE branch_products (               -- prices & stock come from the POS per branch (PO-01/02)
  branch_id        uuid NOT NULL REFERENCES branches(id),
  product_id       uuid NOT NULL REFERENCES products(id),
  organisation_id  uuid NOT NULL REFERENCES organisations(id),
  price_kobo       bigint NOT NULL CHECK (price_kobo > 0),
  stock_qty        int,
  price_synced_at  timestamptz NOT NULL,     -- stale after branch_settings.stale_price_hours → paused
  updated_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (branch_id, product_id)
);

CREATE TABLE product_price_history (         -- audit of POS prices (DM-02 support, disputes)
  id           uuid PRIMARY KEY DEFAULT uuidv7(),
  branch_id    uuid NOT NULL REFERENCES branches(id),
  product_id   uuid NOT NULL REFERENCES products(id),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  price_kobo   bigint NOT NULL,
  source       text NOT NULL CHECK (source IN ('pos_api','pos_push','pos_file')),
  sync_run_id  uuid,
  recorded_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX price_history_product_idx ON product_price_history (product_id, recorded_at DESC);
CREATE TRIGGER price_history_append_only BEFORE UPDATE OR DELETE ON product_price_history
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

CREATE TABLE catalogue_snapshots (           -- compact per-branch list cached on phones (SH-11)
  branch_id     uuid NOT NULL REFERENCES branches(id),
  version       bigint NOT NULL,
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  etag          text NOT NULL,
  product_count int  NOT NULL,
  payload_gzip  bytea NOT NULL,              -- gzip(JSON) served with Content-Encoding: gzip
  built_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (branch_id, version)
);

CREATE TABLE loss_baselines (                -- CT-08 (pilot organisations only, D-21)
  id               uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id  uuid NOT NULL REFERENCES organisations(id),
  branch_id        uuid NOT NULL REFERENCES branches(id),
  category_id      uuid NOT NULL REFERENCES categories(id),
  period_start     date NOT NULL,
  period_end       date NOT NULL,
  sales_kobo       bigint NOT NULL CHECK (sales_kobo >= 0),
  loss_kobo        bigint NOT NULL CHECK (loss_kobo >= 0),
  agreed_margin_bps int NOT NULL DEFAULT 300,     -- baseline + 3% (2.4)
  recorded_by      uuid,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE loss_counts (                   -- weekly stock-count loss per category (SD-07, SA loss)
  id               uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id  uuid NOT NULL REFERENCES organisations(id),
  branch_id        uuid NOT NULL REFERENCES branches(id),
  category_id      uuid NOT NULL REFERENCES categories(id),
  week_start       date NOT NULL,
  skipa_sales_kobo bigint NOT NULL,
  loss_kobo        bigint NOT NULL,
  source           text NOT NULL CHECK (source IN ('store_entry','pos_import')),
  recorded_by      uuid,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (branch_id, category_id, week_start)
);

-- ---------------------------------------------------------------------
-- 6. Shopping sessions, orders, payments, receipts
-- ---------------------------------------------------------------------
CREATE TABLE branch_counters (               -- gap-free per-branch numbers (receipt LK-04822)
  branch_id       uuid NOT NULL REFERENCES branches(id),
  counter         text NOT NULL CHECK (counter IN ('order','receipt')),
  next_value      bigint NOT NULL DEFAULT 1,
  PRIMARY KEY (branch_id, counter)
);

CREATE TABLE shopping_sessions (             -- SH-01..03; cart lives on the phone, snapshot here
  id                uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id   uuid NOT NULL REFERENCES organisations(id),
  branch_id         uuid NOT NULL REFERENCES branches(id),
  device_id         uuid NOT NULL REFERENCES devices(id),
  shopper_id        uuid,                    -- FK to pii.shoppers kept logical (DM-05)
  qr_code_id        uuid REFERENCES qr_codes(id),
  entry_point       text NOT NULL CHECK (entry_point IN ('store_qr','skipa_home_scan','resume')),
  status            text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','checkout','paid','abandoned','ended')),
  cart_item_count   int NOT NULL DEFAULT 0,
  cart_value_kobo   bigint NOT NULL DEFAULT 0,
  last_screen       text,
  started_at        timestamptz NOT NULL DEFAULT now(),
  last_activity_at  timestamptz NOT NULL DEFAULT now(),
  ended_at          timestamptz,
  end_reason        text CHECK (end_reason IN ('paid','timeout','left','switched_off'))
);
CREATE INDEX sessions_branch_active_idx ON shopping_sessions (branch_id, last_activity_at) WHERE status IN ('active','checkout');

CREATE TABLE unknown_barcodes (              -- SH-13, product_not_included (13.3)
  id               uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id  uuid NOT NULL REFERENCES organisations(id),
  branch_id        uuid NOT NULL REFERENCES branches(id),
  session_id       uuid REFERENCES shopping_sessions(id),
  barcode          text NOT NULL,
  reason           text NOT NULL CHECK (reason IN ('not_found','category_off','till_only','price_stale','missing_weight')),
  typed            boolean NOT NULL DEFAULT false,
  scanned_at       timestamptz NOT NULL,
  client_event_id  uuid NOT NULL UNIQUE      -- outbox idempotency
);
CREATE INDEX unknown_barcodes_branch_idx ON unknown_barcodes (branch_id, scanned_at DESC);

CREATE TABLE orders (                        -- CS-01, 8.2
  id                    uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id       uuid NOT NULL REFERENCES organisations(id),
  branch_id             uuid NOT NULL REFERENCES branches(id),
  session_id            uuid REFERENCES shopping_sessions(id),
  device_id             uuid NOT NULL REFERENCES devices(id),
  shopper_id            uuid,                                  -- logical ref to pii.shoppers
  order_number          text NOT NULL UNIQUE,                  -- SKP-LK-04815
  status                text NOT NULL DEFAULT 'created' CHECK (status IN
                        ('created','pending','paid','failed','exited','refund_requested',
                         'awaiting_head_office','refunded','partially_refunded','disputed',
                         'chargeback_won','chargeback_lost')),
  item_count            int    NOT NULL CHECK (item_count > 0),
  total_kobo            bigint NOT NULL CHECK (total_kobo > 0),
  currency              char(3) NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
  platform_fee_bps      int    NOT NULL,                       -- snapshot at creation (0 for pilot)
  platform_fee_kobo     bigint NOT NULL CHECK (platform_fee_kobo >= 0),
  idempotency_key       text   NOT NULL,
  paid_at               timestamptz,
  exit_valid_until      timestamptz,                           -- paid_at + exit window (Q02)
  exited_at             timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, idempotency_key),
  CHECK (status NOT IN ('paid','exited') OR paid_at IS NOT NULL)
);
CREATE INDEX orders_branch_created_idx ON orders (branch_id, created_at DESC);
CREATE INDEX orders_org_status_idx ON orders (organisation_id, status);
CREATE INDEX orders_shopper_idx ON orders (shopper_id, created_at DESC) WHERE shopper_id IS NOT NULL;
CREATE INDEX orders_device_idx ON orders (device_id, created_at DESC);
CREATE TRIGGER orders_touch BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE order_items (                   -- DM-02 snapshot at time of sale
  id                    uuid PRIMARY KEY DEFAULT uuidv7(),
  order_id              uuid NOT NULL REFERENCES orders(id),
  organisation_id       uuid NOT NULL REFERENCES organisations(id),
  product_id            uuid NOT NULL REFERENCES products(id),
  barcode               text,
  name                  text NOT NULL,
  category_id           uuid REFERENCES categories(id),
  category_name         text NOT NULL,
  check_level           text NOT NULL CHECK (check_level IN ('standard','extra')),
  extra_checks          boolean NOT NULL,
  unit_price_kobo       bigint NOT NULL CHECK (unit_price_kobo > 0),
  quantity              int    NOT NULL CHECK (quantity > 0),
  line_total_kobo       bigint NOT NULL,
  weight_grams          int    NOT NULL CHECK (weight_grams > 0),
  CHECK (line_total_kobo = unit_price_kobo * quantity)
);
CREATE INDEX order_items_order_idx ON order_items (order_id);
CREATE TRIGGER order_items_append_only BEFORE UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

CREATE TABLE order_status_history (          -- CS-01 timestamps per state change
  id             uuid PRIMARY KEY DEFAULT uuidv7(),
  order_id       uuid NOT NULL REFERENCES orders(id),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  from_status    text,
  to_status      text NOT NULL,
  actor_type     text NOT NULL CHECK (actor_type IN ('shopper','user','paystack','job','system')),
  actor_id       uuid,
  reason         text,
  request_id     text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_history_order_idx ON order_status_history (order_id, created_at);
CREATE TRIGGER order_history_append_only BEFORE UPDATE OR DELETE ON order_status_history
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

CREATE TABLE payment_attempts (              -- one order, many attempts (IR-03); PY-01..06
  id                     uuid PRIMARY KEY DEFAULT uuidv7(),
  order_id               uuid NOT NULL REFERENCES orders(id),
  organisation_id        uuid NOT NULL REFERENCES organisations(id),
  reference              text NOT NULL UNIQUE,        -- 'SKP-LK-04815-A2' sent to Paystack
  idempotency_key        text NOT NULL,
  channel_requested      text NOT NULL CHECK (channel_requested IN ('card','bank_transfer','ussd')),
  amount_kobo            bigint NOT NULL CHECK (amount_kobo > 0),
  subaccount_code        text NOT NULL,
  transaction_charge_kobo bigint NOT NULL CHECK (transaction_charge_kobo >= 0), -- Skipa fee (PY-12)
  status                 text NOT NULL DEFAULT 'initialized' CHECK (status IN
                         ('initialized','pending','success','failed','abandoned','superseded')),
  paystack_access_code   text,
  paystack_transaction_id bigint UNIQUE,
  channel_paid           text,
  paystack_fees_kobo     bigint CHECK (paystack_fees_kobo >= 0),     -- borne by the store (bearer=subaccount)
  gateway_response       text,
  card_bin               text CHECK (card_bin ~ '^[0-9]{6}$'),       -- PY-06 evidence
  card_last4             text CHECK (card_last4 ~ '^[0-9]{4}$'),
  card_brand             text,
  paid_at                timestamptz,
  verified_at            timestamptz,
  verified_via           text CHECK (verified_via IN ('webhook','poll','client_nudge','reconciliation')),
  verify_attempts        int NOT NULL DEFAULT 0,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, idempotency_key)
);
CREATE UNIQUE INDEX one_successful_attempt_per_order ON payment_attempts (order_id) WHERE status = 'success';
CREATE INDEX payment_attempts_pending_idx ON payment_attempts (created_at) WHERE status IN ('initialized','pending');
CREATE TRIGGER payment_attempts_touch BEFORE UPDATE ON payment_attempts FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE paystack_events (               -- raw webhook log; PY-04 de-duplication
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  dedupe_key      text NOT NULL UNIQUE,      -- sha256(event || data.id || data.status || data.reference)
  event_type      text NOT NULL,             -- charge.success, charge.dispute.create, ...
  reference       text,
  signature_valid boolean NOT NULL,
  payload         jsonb NOT NULL,            -- secrets/PAN never present; customer email scrubbed
  request_id      text,
  received_at     timestamptz NOT NULL DEFAULT now(),
  processed_at    timestamptz,
  process_error   text
);
CREATE INDEX paystack_events_reference_idx ON paystack_events (reference);

CREATE TABLE stray_charges (                 -- IR-02: money received with no Paid order to attach
  id                uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id   uuid NOT NULL REFERENCES organisations(id),
  order_id          uuid REFERENCES orders(id),
  payment_attempt_id uuid REFERENCES payment_attempts(id),
  reference         text NOT NULL UNIQUE,
  amount_kobo       bigint NOT NULL,
  cause             text NOT NULL CHECK (cause IN ('duplicate_charge','superseded_attempt','amount_mismatch','order_not_payable')),
  status            text NOT NULL DEFAULT 'open' CHECK (status IN ('open','refund_recorded','resolved')),
  refund_id         uuid,
  detected_at       timestamptz NOT NULL DEFAULT now(),
  resolved_at       timestamptz
);

CREATE TABLE receipts (                      -- SH-18..23, PY-06
  id                    uuid PRIMARY KEY DEFAULT uuidv7(),
  order_id              uuid NOT NULL UNIQUE REFERENCES orders(id),
  organisation_id       uuid NOT NULL REFERENCES organisations(id),
  branch_id             uuid NOT NULL REFERENCES branches(id),
  receipt_number        text NOT NULL,                 -- LK-04822
  issued_at             timestamptz NOT NULL DEFAULT now(),
  exit_token_id         uuid NOT NULL UNIQUE,          -- jti inside the signed QR token (NF-10)
  exit_valid_until      timestamptz NOT NULL,
  exit_token_used_at    timestamptz,                   -- single use (Q02, RCPT-002)
  exit_token_used_by_check uuid,
  dispute_evidence      jsonb NOT NULL,                -- amount, date, items, channel, bin, last4 (PY-06)
  rating                smallint CHECK (rating BETWEEN 1 AND 5),   -- SH-24
  rating_comment        text CHECK (char_length(rating_comment) <= 500),
  rated_at              timestamptz,
  UNIQUE (branch_id, receipt_number)
);
CREATE INDEX receipts_org_issued_idx ON receipts (organisation_id, issued_at DESC);

CREATE TABLE receipt_deliveries (            -- email receipts (SH-21 v2: app + email, no SMS)
  id                  uuid PRIMARY KEY DEFAULT uuidv7(),
  receipt_id          uuid NOT NULL REFERENCES receipts(id),
  organisation_id     uuid NOT NULL REFERENCES organisations(id),
  destination_masked  text NOT NULL,
  trigger             text NOT NULL CHECK (trigger IN ('auto_opt_in','shopper_request')),
  notification_id     uuid,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 7. Exit checks (section 6)
-- ---------------------------------------------------------------------
CREATE TABLE exit_plans (                    -- decided by the server when the order becomes Paid (EX-07)
  order_id         uuid PRIMARY KEY REFERENCES orders(id),
  organisation_id  uuid NOT NULL REFERENCES organisations(id),
  flagged          boolean NOT NULL,
  random_check     boolean NOT NULL,
  random_rate_pct  smallint NOT NULL,
  reasons          jsonb NOT NULL,           -- [{"rule":"price_threshold","orderItemId":"…"},…]
  expected_weight_grams int NOT NULL,
  decided_at       timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER exit_plans_append_only BEFORE UPDATE OR DELETE ON exit_plans
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

CREATE TABLE random_check_blocks (          -- EX-07, EX-11, 6.6 AC: stratified selection keeps the rate within 1 pp
  branch_id        uuid PRIMARY KEY REFERENCES branches(id),
  organisation_id  uuid NOT NULL REFERENCES organisations(id),
  rate_pct         smallint NOT NULL CHECK (rate_pct IN (1,2,5,10,15,20)),
  block_size       smallint NOT NULL,          -- 200/rate (k = 2) except 15% → 40 (k = 6)
  selected_positions smallint[] NOT NULL,      -- CSPRNG-chosen positions within the current block
  next_position    smallint NOT NULL DEFAULT 0,
  block_started_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE exit_devices (                  -- NF-26 heartbeat, EX-10
  id                uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id   uuid NOT NULL REFERENCES organisations(id),
  branch_id         uuid NOT NULL REFERENCES branches(id),
  device_id         uuid NOT NULL UNIQUE REFERENCES devices(id),
  label             text NOT NULL,           -- 'Exit phone 1'
  status            text NOT NULL DEFAULT 'offline' CHECK (status IN ('online','offline')),
  last_heartbeat_at timestamptz,
  offline_since     timestamptz,
  offline_alerted_at timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE exit_checks (                   -- EX-01..08, 6.5
  id                    uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id       uuid NOT NULL REFERENCES organisations(id),
  branch_id             uuid NOT NULL REFERENCES branches(id),
  order_id              uuid REFERENCES orders(id),     -- NULL when the receipt was not found
  receipt_id            uuid REFERENCES receipts(id),
  checker_user_id       uuid NOT NULL REFERENCES users(id),
  exit_device_id        uuid REFERENCES exit_devices(id),
  lookup_method         text NOT NULL CHECK (lookup_method IN ('qr','receipt_number')),
  lookup_value_masked   text NOT NULL,
  decision              text NOT NULL CHECK (decision IN ('clear','flagged','invalid')),
  invalid_reason        text CHECK (invalid_reason IN ('not_paid','already_used','expired','other_branch','not_found','refunded')),
  random_check          boolean NOT NULL DEFAULT false,
  flag_reasons          jsonb NOT NULL DEFAULT '[]'::jsonb,
  expected_weight_grams int,
  actual_weight_grams   int,
  weight_delta_bps      int,
  weight_within_tolerance boolean,
  result                text CHECK (result IN ('clear','match','mismatch','invalid','abandoned')),
  mismatch_reasons      text[] NOT NULL DEFAULT '{}',
  notes                 text CHECK (char_length(notes) <= 1000),
  started_at            timestamptz NOT NULL DEFAULT now(),
  completed_at          timestamptz,
  duration_ms           int,
  CHECK (decision <> 'invalid' OR invalid_reason IS NOT NULL),
  CHECK (result IS NULL OR completed_at IS NOT NULL)
);
CREATE UNIQUE INDEX one_open_check_per_order ON exit_checks (order_id) WHERE completed_at IS NULL AND order_id IS NOT NULL;
CREATE INDEX exit_checks_branch_idx ON exit_checks (branch_id, started_at DESC);
CREATE INDEX exit_checks_checker_idx ON exit_checks (checker_user_id, started_at DESC);

CREATE TABLE exit_check_items (              -- "tick each flagged item" (6.5 business rule)
  exit_check_id   uuid NOT NULL REFERENCES exit_checks(id),
  order_item_id   uuid NOT NULL REFERENCES order_items(id),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  flagged         boolean NOT NULL,
  flag_reason     text,
  ticked          boolean NOT NULL DEFAULT false,
  ticked_at       timestamptz,
  PRIMARY KEY (exit_check_id, order_item_id)
);

CREATE TABLE checker_signals (               -- EX-08, Q22 (signal, never accusation)
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  branch_id       uuid NOT NULL REFERENCES branches(id),
  user_id         uuid NOT NULL REFERENCES users(id),
  signal          text NOT NULL CHECK (signal IN ('low_mismatch_rate','fast_flagged_checks','large_basket_not_weighed')),
  window_start    timestamptz NOT NULL,
  window_end      timestamptz NOT NULL,
  metrics         jsonb NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, signal, window_end)
);

-- ---------------------------------------------------------------------
-- 8. Refunds (recorded, paid outside Skipa), disputes, adjustments
-- ---------------------------------------------------------------------
CREATE TABLE refunds (                       -- SH-22, SH-32, PY-07 (v2.1 off-platform), PY-08, PY-10
  id                        uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id           uuid NOT NULL REFERENCES organisations(id),
  branch_id                 uuid NOT NULL REFERENCES branches(id),
  order_id                  uuid NOT NULL REFERENCES orders(id),
  origin                    text NOT NULL CHECK (origin IN ('shopper_request','store_initiated','stray_charge')),
  requested_by_shopper_id   uuid,
  requested_by_device_id    uuid REFERENCES devices(id),
  requested_by_user_id      uuid REFERENCES users(id),
  reason                    text NOT NULL CHECK (reason IN
                            ('charged_twice','wrong_price','item_missing','changed_mind','did_not_leave','other')),
  note                      text CHECK (char_length(note) <= 1000),
  amount_kobo               bigint NOT NULL CHECK (amount_kobo > 0),       -- whole order (Q04)
  status                    text NOT NULL DEFAULT 'requested'
                            CHECK (status IN ('requested','awaiting_head_office','approved','declined','paid')),
  needs_head_office         boolean NOT NULL,
  approved_by               uuid REFERENCES users(id),
  approved_at               timestamptz,
  head_office_approved_by   uuid REFERENCES users(id),
  declined_by               uuid REFERENCES users(id),
  decline_reason            text,
  payment_method            text CHECK (payment_method IN ('cash','bank_transfer','card_reversal','other')),
  payment_reference         text,
  paid_at                   timestamptz,                -- when the store paid the shopper
  recorded_by               uuid REFERENCES users(id),
  recorded_at               timestamptz,
  liability                 text NOT NULL DEFAULT 'store' CHECK (liability IN ('store','skipa')),  -- 8.4
  support_ticket_id         uuid,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  CHECK (status <> 'paid' OR (payment_method IS NOT NULL AND paid_at IS NOT NULL AND recorded_by IS NOT NULL)),
  CHECK (payment_method IS DISTINCT FROM 'bank_transfer' OR payment_reference IS NOT NULL)
);
CREATE UNIQUE INDEX one_live_refund_per_order ON refunds (order_id) WHERE status <> 'declined';
CREATE INDEX refunds_org_status_idx ON refunds (organisation_id, status, created_at);
CREATE TRIGGER refunds_touch BEFORE UPDATE ON refunds FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE refund_status_history (
  id          uuid PRIMARY KEY DEFAULT uuidv7(),
  refund_id   uuid NOT NULL REFERENCES refunds(id),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  from_status text,
  to_status   text NOT NULL,
  actor_type  text NOT NULL,
  actor_id    uuid,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER refund_history_append_only BEFORE UPDATE OR DELETE ON refund_status_history
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

CREATE TABLE disputes (                      -- PY-09 (Paystack chargebacks; 16-hour response window)
  id                    uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id       uuid NOT NULL REFERENCES organisations(id),
  order_id              uuid NOT NULL REFERENCES orders(id),
  payment_attempt_id    uuid NOT NULL REFERENCES payment_attempts(id),
  paystack_dispute_id   bigint NOT NULL UNIQUE,
  category              text,
  amount_kobo           bigint NOT NULL,
  status                text NOT NULL CHECK (status IN
                        ('open','evidence_submitted','awaiting_bank','won','lost','accepted')),
  due_at                timestamptz NOT NULL,
  evidence_submitted_at timestamptz,
  evidence_files        jsonb NOT NULL DEFAULT '[]'::jsonb,
  liability             text NOT NULL DEFAULT 'store' CHECK (liability IN ('store','skipa')),
  resolved_at           timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX disputes_due_idx ON disputes (due_at) WHERE status = 'open';

CREATE TABLE financial_adjustments (         -- CS-04, DM-03: every correction is a new record
  id               uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id  uuid NOT NULL REFERENCES organisations(id),
  branch_id        uuid REFERENCES branches(id),
  order_id         uuid REFERENCES orders(id),
  kind             text NOT NULL CHECK (kind IN
                   ('manual_correction','chargeback_receivable','receivable_payment',
                    'skipa_liability','skipa_liability_payment','reconciliation_fix')),
  amount_kobo      bigint NOT NULL,          -- signed: + store owes Skipa, − Skipa owes store
  reason           text NOT NULL,
  references_id    uuid,                     -- dispute / refund / reconciliation item
  created_by       uuid,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX financial_adjustments_org_idx ON financial_adjustments (organisation_id, created_at);
CREATE TRIGGER financial_adjustments_append_only BEFORE UPDATE OR DELETE ON financial_adjustments
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

CREATE TABLE chargeback_reserve_ledger (     -- Skipa-held reserve for lost chargebacks (decision 24 Nov)
  id          uuid PRIMARY KEY DEFAULT uuidv7(),
  entry_type  text NOT NULL CHECK (entry_type IN ('top_up','chargeback_debit','recovery_credit','adjustment')),
  amount_kobo bigint NOT NULL,               -- signed
  dispute_id  uuid REFERENCES disputes(id),
  note        text NOT NULL,
  created_by  uuid,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER reserve_append_only BEFORE UPDATE OR DELETE ON chargeback_reserve_ledger
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

-- ---------------------------------------------------------------------
-- 9. Stars (5.10) — append-only ledger; balance = SUM(delta)
-- ---------------------------------------------------------------------
CREATE TABLE star_ledger (
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  shopper_id      uuid NOT NULL,             -- logical ref to pii.shoppers
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  order_id        uuid REFERENCES orders(id),
  delta           int  NOT NULL CHECK (delta <> 0),
  reason          text NOT NULL CHECK (reason IN ('visit','bonus','refund_reversal','chargeback_reversal','guest_claim','adjustment')),
  rule_version    int  NOT NULL,
  award_date_wat  date NOT NULL,             -- for daily cap per store (ST-03)
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX star_once_per_order_reason ON star_ledger (order_id, reason) WHERE order_id IS NOT NULL;
CREATE INDEX star_ledger_shopper_idx ON star_ledger (shopper_id, organisation_id);
CREATE TRIGGER star_ledger_append_only BEFORE UPDATE OR DELETE ON star_ledger
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

-- ---------------------------------------------------------------------
-- 10. POS integration & reconciliation (section 12)
-- ---------------------------------------------------------------------
CREATE TABLE pos_connections (
  id               uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id  uuid NOT NULL UNIQUE REFERENCES organisations(id),
  connector_key    text NOT NULL,
  mode             text NOT NULL CHECK (mode IN ('api','file')),
  config_enc       bytea,                    -- credentials, AES-256-GCM (NF-08)
  skipa_till_id    text,                     -- the "Skipa" till in the POS (PO-03)
  status           text NOT NULL DEFAULT 'testing' CHECK (status IN ('testing','live','failing','disabled')),
  last_sync_at     timestamptz,
  last_success_at  timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE pos_sync_runs (                 -- PO-02, PO-09 health
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  branch_id       uuid REFERENCES branches(id),
  kind            text NOT NULL CHECK (kind IN ('catalogue_pull','catalogue_push','file_import')),
  status          text NOT NULL CHECK (status IN ('running','succeeded','failed')),
  products_seen   int NOT NULL DEFAULT 0,
  products_changed int NOT NULL DEFAULT 0,
  error_code      text,
  error_detail    text,
  started_at      timestamptz NOT NULL DEFAULT now(),
  finished_at     timestamptz
);
CREATE INDEX pos_sync_runs_org_idx ON pos_sync_runs (organisation_id, started_at DESC);

CREATE TABLE pos_files (                     -- file-exchange mode (12.1), PO-06 shift close
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  branch_id       uuid REFERENCES branches(id),
  direction       text NOT NULL CHECK (direction IN ('inbound','outbound')),
  kind            text NOT NULL CHECK (kind IN ('products','sales_refunds','shift_close','weights')),
  business_date   date,
  storage_key     text NOT NULL,
  sha256          bytea NOT NULL,
  row_count       int NOT NULL,
  status          text NOT NULL CHECK (status IN ('received','processed','rejected','generated','downloaded','confirmed')),
  error_detail    text,
  created_by      uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, sha256)
);

CREATE TABLE pos_postings (                  -- PO-03..05, CS-03 (idempotent per source)
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  branch_id       uuid NOT NULL REFERENCES branches(id),
  kind            text NOT NULL CHECK (kind IN ('sale','refund','chargeback')),
  source_id       uuid NOT NULL,             -- order / refund / dispute id
  idempotency_key text NOT NULL UNIQUE,      -- 'sale:<orderId>' — also sent to the POS
  payload         jsonb NOT NULL,            -- shared internal format (PosSale/PosRefund)
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','posted','failed','dead','exported','confirmed')),
  attempts        int NOT NULL DEFAULT 0,
  next_attempt_at timestamptz,
  last_error_code text,
  last_error      text,
  pos_reference   text,
  posted_at       timestamptz,
  pos_file_id     uuid REFERENCES pos_files(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pos_postings_due_idx ON pos_postings (next_attempt_at) WHERE status IN ('pending','failed');

CREATE TABLE paystack_settlements (          -- payouts to the store subaccount (and Skipa share)
  id                     uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id        uuid NOT NULL REFERENCES organisations(id),
  paystack_settlement_id bigint NOT NULL UNIQUE,
  subaccount_code        text NOT NULL,
  settlement_date        date NOT NULL,
  total_amount_kobo      bigint NOT NULL,
  total_fees_kobo        bigint NOT NULL,
  status                 text NOT NULL,
  raw                    jsonb NOT NULL,
  fetched_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE settlement_lines (
  settlement_id          uuid NOT NULL REFERENCES paystack_settlements(id),
  organisation_id        uuid NOT NULL REFERENCES organisations(id),
  reference              text NOT NULL,
  amount_kobo            bigint NOT NULL,
  paystack_fee_kobo      bigint NOT NULL,
  skipa_share_kobo       bigint NOT NULL,
  subaccount_share_kobo  bigint NOT NULL,
  PRIMARY KEY (settlement_id, reference)
);

CREATE TABLE reconciliation_runs (           -- PO-07: daily 02:00 WAT + on payout arrival
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  business_date   date NOT NULL,
  trigger         text NOT NULL CHECK (trigger IN ('schedule','payout_arrived','manual')),
  status          text NOT NULL CHECK (status IN ('running','completed','failed')),
  orders_total    int NOT NULL DEFAULT 0,
  matched         int NOT NULL DEFAULT 0,
  unmatched       int NOT NULL DEFAULT 0,
  started_at      timestamptz NOT NULL DEFAULT now(),
  finished_at     timestamptz
);
CREATE INDEX recon_runs_org_date_idx ON reconciliation_runs (organisation_id, business_date DESC);

CREATE TABLE reconciliation_items (          -- one row per unmatched order/refund, with cause
  id               uuid PRIMARY KEY DEFAULT uuidv7(),
  run_id           uuid NOT NULL REFERENCES reconciliation_runs(id),
  organisation_id  uuid NOT NULL REFERENCES organisations(id),
  branch_id        uuid REFERENCES branches(id),
  subject_type     text NOT NULL CHECK (subject_type IN ('order','refund','dispute','stray_charge','settlement')),
  subject_id       uuid NOT NULL,
  receipt_ok       boolean NOT NULL,
  pos_ok           boolean NOT NULL,
  paystack_ok      boolean NOT NULL,
  cause            text NOT NULL CHECK (cause IN
                   ('pos_missing','pos_amount_mismatch','payout_missing','payout_amount_mismatch',
                    'fee_split_mismatch','duplicate_charge','price_mismatch','refund_not_recorded',
                    'refund_not_posted','unknown_settlement_line')),
  detail           text NOT NULL,
  status           text NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  resolution_reason text,                    -- required to resolve manually (12.4)
  resolved_by      uuid,
  resolved_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX recon_items_open_idx ON reconciliation_items (organisation_id, status) WHERE status = 'open';

CREATE TABLE payout_reports (                -- PO-08, PY-13 daily payout report
  id                    uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id       uuid NOT NULL REFERENCES organisations(id),
  settlement_id         uuid REFERENCES paystack_settlements(id),
  business_date         date NOT NULL,
  receipts_count        int NOT NULL,
  sales_kobo            bigint NOT NULL,
  paystack_fees_kobo    bigint NOT NULL,
  skipa_fee_kobo        bigint NOT NULL,
  chargebacks_kobo      bigint NOT NULL,
  payout_kobo           bigint NOT NULL,
  refunds_paid_by_store_kobo bigint NOT NULL,   -- shown outside the payout (off-platform refunds)
  status                text NOT NULL CHECK (status IN ('tied','mismatch','awaiting_payout')),
  generated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, business_date)
);

CREATE TABLE billing_statements (            -- SA-08: fee per store per month vs fees split by Paystack
  id                        uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id           uuid NOT NULL REFERENCES organisations(id),
  month                     date NOT NULL CHECK (date_trunc('month', month)::date = month),
  settled_sales_kobo        bigint NOT NULL,
  fee_rate_bps              int NOT NULL,
  fee_expected_kobo         bigint NOT NULL,
  fee_split_by_paystack_kobo bigint NOT NULL,
  status                    text NOT NULL CHECK (status IN ('matched','mismatch','pilot_no_fee')),
  generated_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, month)
);

-- ---------------------------------------------------------------------
-- 11. Support, FAQs, notifications, alerts (section 9)
-- ---------------------------------------------------------------------
CREATE TABLE support_tickets (               -- NT-02, HP-07..14
  id                     uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id        uuid NOT NULL REFERENCES organisations(id),
  branch_id              uuid NOT NULL REFERENCES branches(id),
  ticket_number          text NOT NULL UNIQUE,     -- 'T-LK-00231'
  order_id               uuid REFERENCES orders(id),
  refund_id              uuid REFERENCES refunds(id),
  shopper_id             uuid,
  device_id              uuid REFERENCES devices(id),
  guest_contact_id       uuid REFERENCES pii.contact_details(id),   -- optional guest email (HP-09 v2)
  category               text NOT NULL CHECK (category IN ('payment','refund','wrong_price','exit','app','other')),
  status                 text NOT NULL DEFAULT 'new'
                         CHECK (status IN ('new','in_progress','waiting_for_shopper','resolved')),
  context_snapshot       jsonb NOT NULL,       -- HP-08: order/payment state, Paystack ref, amount, device, chat, request IDs
  first_reply_due_at     timestamptz NOT NULL,
  first_replied_at       timestamptz,
  escalated_to_head_office_at timestamptz,
  escalated_to_platform_at    timestamptz,     -- HP-13
  resolved_at            timestamptz,
  rating                 smallint CHECK (rating BETWEEN 1 AND 5),   -- HP-14
  client_request_id      uuid NOT NULL UNIQUE, -- outbox idempotency
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX support_tickets_inbox_idx ON support_tickets (branch_id, status, created_at DESC);

CREATE TABLE support_messages (
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  ticket_id       uuid NOT NULL REFERENCES support_tickets(id),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  author_type     text NOT NULL CHECK (author_type IN ('shopper','store','skipa','bot','system')),
  author_id       uuid,
  body            text NOT NULL CHECK (char_length(body) <= 4000),
  internal_note   boolean NOT NULL DEFAULT false,
  client_message_id uuid UNIQUE,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX support_messages_ticket_idx ON support_messages (ticket_id, created_at);

CREATE TABLE faqs (                          -- HP-01..05, HP-15 (Postgres full-text search)
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  scope           text NOT NULL CHECK (scope IN ('platform','organisation')),
  organisation_id uuid REFERENCES organisations(id),
  question        text NOT NULL,
  answer          text NOT NULL,
  keywords        text[] NOT NULL DEFAULT '{}',
  screens         text[] NOT NULL DEFAULT '{}',      -- suggested on these screens (HP-03)
  order_states    text[] NOT NULL DEFAULT '{}',
  offer_support   boolean NOT NULL DEFAULT false,    -- payment/refund/exit topics (HP-07)
  active          boolean NOT NULL DEFAULT true,
  sort_order      int NOT NULL DEFAULT 0,
  search_vector   tsvector GENERATED ALWAYS AS
                  (setweight(to_tsvector('english', question), 'A') ||
                   setweight(to_tsvector('english', immutable_join(keywords)), 'B') ||
                   setweight(to_tsvector('english', answer), 'C')) STORED,
  updated_by      uuid,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CHECK ((scope = 'organisation') = (organisation_id IS NOT NULL))
);
CREATE INDEX faqs_search_idx ON faqs USING gin (search_vector);

CREATE TABLE faq_synonyms (
  term      text PRIMARY KEY,
  synonyms  text[] NOT NULL                 -- e.g. 'debited' → {'charged','deducted','paid twice'}
);

CREATE TABLE notifications (                 -- delivery log for every channel (NT-05, NT-06)
  id                   uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id      uuid REFERENCES organisations(id),
  recipient_type       text NOT NULL CHECK (recipient_type IN ('shopper','guest','user','platform_group')),
  recipient_id         uuid,
  channel              text NOT NULL CHECK (channel IN ('sms','email','telegram','in_app')),
  template_key         text NOT NULL,
  template_version     int,
  priority             text NOT NULL DEFAULT 'normal' CHECK (priority IN ('critical','normal','bulk')),
  destination_masked   text,
  status               text NOT NULL DEFAULT 'queued' CHECK (status IN
                       ('queued','held_quota','sent','delivered','failed','fallback_sent')),
  provider             text,
  provider_message_id  text,
  error_code           text,                 -- NOTIF-002 (SMS), NOTIF-005 (email)
  attempts             int NOT NULL DEFAULT 0,
  related_type         text,
  related_id           uuid,
  created_at           timestamptz NOT NULL DEFAULT now(),
  sent_at              timestamptz,
  delivered_at         timestamptz
);
CREATE INDEX notifications_status_idx ON notifications (status, created_at) WHERE status IN ('queued','held_quota');
CREATE INDEX notifications_daily_email_idx ON notifications (channel, sent_at) WHERE channel = 'email';

CREATE TABLE notification_preferences (      -- NT-04 (critical cannot be switched off)
  user_id     uuid NOT NULL REFERENCES users(id),
  alert_key   text NOT NULL,
  in_app      boolean NOT NULL DEFAULT true,
  email       boolean NOT NULL DEFAULT true,
  PRIMARY KEY (user_id, alert_key)
);

CREATE TABLE alerts (                        -- in-app alert centre (store + platform) and Telegram fan-out
  id                  uuid PRIMARY KEY DEFAULT uuidv7(),
  scope               text NOT NULL CHECK (scope IN ('platform','organisation','branch')),
  organisation_id     uuid REFERENCES organisations(id),
  branch_id           uuid REFERENCES branches(id),
  severity            text NOT NULL CHECK (severity IN ('critical','high','medium','low','store')),
  code                text NOT NULL,         -- error/alert code e.g. EXIT-004, POS-010, RECON-003
  title               text NOT NULL,
  body                text NOT NULL,
  link_path           text,                  -- SA-06: every alert links to its records
  dedupe_key          text NOT NULL,
  status              text NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved')),
  telegram_status     text CHECK (telegram_status IN ('sent','failed','not_applicable')),
  email_fallback_sent boolean NOT NULL DEFAULT false,
  occurrences         int NOT NULL DEFAULT 1,
  first_seen_at       timestamptz NOT NULL DEFAULT now(),
  last_seen_at        timestamptz NOT NULL DEFAULT now(),
  acknowledged_by     uuid,
  resolved_at         timestamptz
);
CREATE UNIQUE INDEX alerts_open_dedupe ON alerts (dedupe_key) WHERE status <> 'resolved';

-- ---------------------------------------------------------------------
-- 12. Branding (10.3)
-- ---------------------------------------------------------------------
CREATE TABLE branding_versions (             -- BR-01..05, BR-09 (publish/restore)
  id                 uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id    uuid NOT NULL REFERENCES organisations(id),
  version            int NOT NULL,
  status             text NOT NULL CHECK (status IN ('draft','published','superseded')),
  display_name       text NOT NULL,
  logo_square_key    text,                   -- R2 key, ≤ 50 KB (BR-05)
  logo_wide_key      text,
  cover_key          text,                   -- ≤ 150 KB
  primary_color      text NOT NULL CHECK (primary_color ~ '^#[0-9A-F]{6}$'),
  accent_color       text NOT NULL CHECK (accent_color ~ '^#[0-9A-F]{6}$'),
  derived_tokens     jsonb NOT NULL,         -- brand slots computed server-side (hover, pressed, on-*, subtle)
  contrast_report    jsonb NOT NULL,         -- BR-04: every pair ≥ 4.5:1 or publish blocked
  welcome_message    text CHECK (char_length(welcome_message) <= 140),
  receipt_header     text CHECK (char_length(receipt_header) <= 200),
  receipt_footer     text CHECK (char_length(receipt_footer) <= 300),
  social_links       jsonb NOT NULL DEFAULT '{}'::jsonb,
  qr_sign_design     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by         uuid,
  published_by       uuid,
  published_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, version)
);
CREATE UNIQUE INDEX branding_one_published ON branding_versions (organisation_id) WHERE status = 'published';
CREATE UNIQUE INDEX branding_one_draft ON branding_versions (organisation_id) WHERE status = 'draft';

-- ---------------------------------------------------------------------
-- 13. Tours, exports, idempotency, errors
-- ---------------------------------------------------------------------
CREATE TABLE tour_progress (                 -- SH-31, SD-21, EX-12 (shopper tours also on device)
  subject_type  text NOT NULL CHECK (subject_type IN ('device','user')),
  subject_id    uuid NOT NULL,
  tour_key      text NOT NULL CHECK (tour_key IN ('skipa_home','store_first_visit','dashboard','exit_first_shift')),
  status        text NOT NULL CHECK (status IN ('seen','skipped','completed')),
  step_reached  smallint NOT NULL,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (subject_type, subject_id, tour_key)
);

CREATE TABLE exports (                       -- SD-05, SA-07 (every export logged in audit)
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  organisation_id uuid REFERENCES organisations(id),
  requested_by    uuid NOT NULL REFERENCES users(id),
  dataset         text NOT NULL,             -- 'receipts','exit_checks','refunds','shoppers',...
  filters         jsonb NOT NULL,
  format          text NOT NULL CHECK (format IN ('csv','xlsx')),
  status          text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','ready','failed','expired')),
  storage_key     text,
  row_count       int,
  created_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz,
  expires_at      timestamptz
);

CREATE TABLE idempotency_keys (              -- CS-03, PY-01 (24 h replay window)
  scope           text NOT NULL,             -- 'POST /v1/orders:device:<id>'
  key             text NOT NULL,
  request_hash    bytea NOT NULL,
  status          text NOT NULL CHECK (status IN ('in_progress','completed')),
  response_status int,
  response_body   jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL,
  PRIMARY KEY (scope, key)
);

CREATE TABLE error_events (                  -- ER-11 index for the super admin Errors screen
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  code            text NOT NULL,
  severity        text NOT NULL CHECK (severity IN ('critical','high','medium','low')),
  app             text NOT NULL CHECK (app IN ('api','worker','shopper','exit','store','admin')),
  release         text NOT NULL,
  environment     text NOT NULL,
  organisation_id uuid,
  branch_id       uuid,
  route_or_screen text,
  browser         text,
  request_id      text,
  glitchtip_url   text,
  occurred_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX error_events_code_time_idx ON error_events (code, occurred_at DESC);
CREATE INDEX error_events_time_idx ON error_events (occurred_at DESC);

-- ---------------------------------------------------------------------
-- 14. Audit (RB-04, RB-05, RB-07, SD-20, SA-03, NF-27) — append-only
-- ---------------------------------------------------------------------
CREATE TABLE audit.audit_log (
  id              uuid PRIMARY KEY DEFAULT uuidv7(),
  occurred_at     timestamptz NOT NULL DEFAULT now(),
  actor_type      text NOT NULL CHECK (actor_type IN ('user','shopper','system','job')),
  actor_id        uuid,
  actor_role      text,
  organisation_id uuid,
  branch_id       uuid,
  action          text NOT NULL,             -- 'refund.approve','settings.random_rate.update','export.create',...
  target_type     text NOT NULL,
  target_id       uuid,
  before          jsonb,
  after           jsonb,
  reason          text,
  request_id      text,
  ip_hash         bytea
);
CREATE INDEX audit_org_time_idx ON audit.audit_log (organisation_id, occurred_at DESC);
CREATE INDEX audit_action_idx ON audit.audit_log (action, occurred_at DESC);
CREATE TRIGGER audit_append_only BEFORE UPDATE OR DELETE ON audit.audit_log
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

CREATE TABLE audit.personal_data_access (    -- RB-05: reason gate, visible to head office (RB-07)
  id               uuid PRIMARY KEY DEFAULT uuidv7(),
  admin_user_id    uuid NOT NULL REFERENCES users(id),
  organisation_id  uuid,
  subject_type     text NOT NULL CHECK (subject_type IN ('shopper','organisation_shoppers','order')),
  subject_id       uuid,
  reason           text NOT NULL CHECK (char_length(reason) >= 10),
  grant_token_hash bytea NOT NULL UNIQUE,
  granted_at       timestamptz NOT NULL DEFAULT now(),
  expires_at       timestamptz NOT NULL      -- 30 minutes
);
CREATE TRIGGER pda_append_only BEFORE UPDATE OR DELETE ON audit.personal_data_access
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

CREATE TABLE audit.admin_sign_ins (          -- NF-27: device + IP for every super admin sign-in
  id            uuid PRIMARY KEY DEFAULT uuidv7(),
  user_id       uuid NOT NULL REFERENCES users(id),
  ip_address    inet NOT NULL,
  user_agent    text NOT NULL,
  new_device    boolean NOT NULL,
  succeeded     boolean NOT NULL,
  occurred_at   timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER admin_sign_ins_append_only BEFORE UPDATE OR DELETE ON audit.admin_sign_ins
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();

-- ---------------------------------------------------------------------
-- 15. Analytics events (AN-01..11) — monthly partitions, 24 months
-- ---------------------------------------------------------------------
CREATE TABLE analytics.events (
  id               uuid NOT NULL DEFAULT uuidv7(),
  event_name       text NOT NULL CHECK (event_name ~ '^[a-z]+(_[a-z]+)+$'),   -- object_action (AN-03)
  occurred_at      timestamptz NOT NULL,
  received_at      timestamptz NOT NULL DEFAULT now(),
  source           text NOT NULL CHECK (source IN ('client','server')),
  device_id        uuid,
  shopper_id       uuid,                     -- internal ID only (AN-06)
  user_id          uuid,
  session_id       uuid,
  organisation_id  uuid,
  branch_id        uuid,
  app              text NOT NULL,
  app_version      text NOT NULL,
  platform         text NOT NULL,
  device           text,
  browser          text,
  network_type     text,
  screen           text,
  request_id       text,
  properties       jsonb NOT NULL DEFAULT '{}'::jsonb,
  client_event_id  uuid,                     -- de-dupe client retries
  PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);
CREATE INDEX events_name_time_idx ON analytics.events (event_name, occurred_at);
CREATE INDEX events_branch_time_idx ON analytics.events (branch_id, occurred_at);
-- Partitions are created 3 months ahead by job `analytics.partitions.maintain`; seed two here.
CREATE TABLE analytics.events_2026_11 PARTITION OF analytics.events FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE analytics.events_2026_12 PARTITION OF analytics.events FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- ---------------------------------------------------------------------
-- 16. Tenant isolation: row-level security (DM-04) — defence in depth
-- Application role `skipa_app` sets `SET LOCAL app.org_ids = '<uuid>,<uuid>'`
-- per transaction. Platform jobs and super admin use `skipa_platform` (BYPASSRLS).
-- ---------------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'branches','branch_settings','qr_codes','user_branches','categories','branch_categories',
    'pos_department_mappings','products','branch_products','product_price_history','catalogue_snapshots',
    'loss_baselines','loss_counts','shopping_sessions','unknown_barcodes','orders','order_items',
    'order_status_history','payment_attempts','stray_charges','receipts','receipt_deliveries','exit_plans',
    'exit_devices','random_check_blocks','exit_checks','exit_check_items','checker_signals','refunds','refund_status_history',
    'disputes','financial_adjustments','star_ledger','pos_connections','pos_sync_runs','pos_files',
    'pos_postings','paystack_settlements','settlement_lines','reconciliation_runs','reconciliation_items',
    'payout_reports','billing_statements','support_tickets','support_messages','branding_versions']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($p$CREATE POLICY tenant_isolation ON %I
      USING (organisation_id = ANY (string_to_array(current_setting('app.org_ids', true), ',')::uuid[]))
      WITH CHECK (organisation_id = ANY (string_to_array(current_setting('app.org_ids', true), ',')::uuid[]))$p$, t);
  END LOOP;
END $$;

-- Roles (created by infra/ansible with passwords from SOPS; shown here for reference)
-- CREATE ROLE skipa_app LOGIN;                 -- API requests for store/shopper/exit surfaces
-- CREATE ROLE skipa_platform LOGIN BYPASSRLS;  -- worker jobs, super admin API, migrations run as owner
-- GRANT USAGE ON SCHEMA public, analytics TO skipa_app, skipa_platform;
-- GRANT USAGE ON SCHEMA pii TO skipa_app;      -- only modules/identity may import pii repositories (lint rule)
-- GRANT INSERT, SELECT ON ALL TABLES IN SCHEMA audit TO skipa_app;  -- append-only enforced by trigger
