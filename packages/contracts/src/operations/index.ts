// Part of the API contract (Zod source of api/openapi.v1.yaml). Changes need a PR labelled
// contract-change, approved by the frontend agent; breaking changes also need the lead.

import type { Operation } from '../openapi/operation.ts';
import { systemOperations } from './system.ts';
import { identityOperations } from './identity.ts';
import { authOperations } from './auth.ts';
import { discoveryOperations } from './discovery.ts';
import { shoppingOperations } from './shopping.ts';
import { paymentsOperations } from './payments.ts';
import { webhooksOperations } from './webhooks.ts';
import { receiptsOperations } from './receipts.ts';
import { refundsOperations } from './refunds.ts';
import { helpOperations } from './help.ts';
import { supportOperations } from './support.ts';
import { accountOperations } from './account.ts';
import { analyticsOperations } from './analytics.ts';
import { monitoringOperations } from './monitoring.ts';
import { realtimeOperations } from './realtime.ts';
import { exitOperations } from './exit.ts';
import { storeLiveOperations } from './store-live.ts';
import { storeReceiptsOperations } from './store-receipts.ts';
import { storeExitOperations } from './store-exit.ts';
import { storeRefundsOperations } from './store-refunds.ts';
import { storeSupportOperations } from './store-support.ts';
import { storeCatalogueOperations } from './store-catalogue.ts';
import { storeStaffOperations } from './store-staff.ts';
import { storeSettingsOperations } from './store-settings.ts';
import { storeBrandingOperations } from './store-branding.ts';
import { storeReconciliationOperations } from './store-reconciliation.ts';
import { storeAnalyticsOperations } from './store-analytics.ts';
import { storeDataOperations } from './store-data.ts';
import { adminOperations } from './admin.ts';

/** Every operation in the contract, grouped by tag. */
export const operations: readonly Operation[] = [
  ...systemOperations,
  ...identityOperations,
  ...authOperations,
  ...discoveryOperations,
  ...shoppingOperations,
  ...paymentsOperations,
  ...webhooksOperations,
  ...receiptsOperations,
  ...refundsOperations,
  ...helpOperations,
  ...supportOperations,
  ...accountOperations,
  ...analyticsOperations,
  ...monitoringOperations,
  ...realtimeOperations,
  ...exitOperations,
  ...storeLiveOperations,
  ...storeReceiptsOperations,
  ...storeExitOperations,
  ...storeRefundsOperations,
  ...storeSupportOperations,
  ...storeCatalogueOperations,
  ...storeStaffOperations,
  ...storeSettingsOperations,
  ...storeBrandingOperations,
  ...storeReconciliationOperations,
  ...storeAnalyticsOperations,
  ...storeDataOperations,
  ...adminOperations,
];
