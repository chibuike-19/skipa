// Generated from api/openapi.v1.yaml by `pnpm api-client:gen` (openapi-typescript). Do not edit.
// A test fails when this file and the contract disagree.

export type paths = {
    "/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Process is up
         * @description PRD: NF-01.
         */
        get: operations["healthLive"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Database, queue and Paystack reachability
         * @description PRD: ER-09.
         */
        get: operations["healthReady"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/alerts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Platform alert centre (mirrors Telegram)
         * @description PRD: 14.4. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listPlatformAlerts"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/alerts/{alertId}/acknowledge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Acknowledge
         * @description PRD: 14.4. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["ackPlatformAlert"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/analytics/{report}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Platform analytics
         * @description PRD: 13.4. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["getPlatformReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/audit-log": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Every privileged action
         * @description PRD: RB-04, SA-07. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["getAuditLog"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/billing": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Fee per store per month, deducted at settlement
         * @description PRD: SA-08, PY-13. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listBilling"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/branches/{branchId}/switch": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Emergency switch a branch off/on
         * @description PRD: SA-05. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["adminSwitchBranch"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/branding": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Every store’s published branding
         * @description PRD: BR-09. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listAllBranding"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/chargeback-reserve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Chargeback reserve balance and ledger
         * @description PRD: Decision 2026-11-24. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["getReserve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/chargeback-reserve/entries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Top-up / recovery / adjustment entry
         * @description PRD: CS-04. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["addReserveEntry"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/disputes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * All refunds and chargebacks, deadlines, liability
         * @description PRD: PY-09, 11.1. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listDisputes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/disputes/{disputeId}/evidence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Re-send evidence manually (if automation failed)
         * @description PRD: PY-09. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["resubmitEvidence"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/errors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Error counts and trends
         * @description PRD: ER-11. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listErrors"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/exports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Export store, transaction or audit data (logged)
         * @description PRD: SA-07. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["createAdminExport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/faqs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Platform FAQs
         * @description PRD: HP-02, HP-15. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listPlatformFaqs"];
        put?: never;
        /**
         * Add platform FAQ
         * @description PRD: HP-02. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["createPlatformFaq"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/faqs/{faqId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Edit platform FAQ
         * @description PRD: HP-02. Auth: super_admin (support_agent read-only where GET).
         */
        put: operations["updatePlatformFaq"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/feature-flags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Feature flags
         * @description PRD: SA-04. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listFlags"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/feature-flags/{flagKey}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Change a flag (logged)
         * @description PRD: SA-04, D-23. Auth: super_admin (support_agent read-only where GET).
         */
        patch: operations["updateFlag"];
        trace?: never;
    };
    "/v1/admin/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Service health (API, DB, queue, Paystack, POS, SMS, email, Telegram)
         * @description PRD: ER-09. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["getServiceHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/loyalty": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Star rules
         * @description PRD: ST-02, ST-03, ST-10. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["getLoyalty"];
        /**
         * New star rules version
         * @description PRD: ST-02. Auth: super_admin (support_agent read-only where GET).
         */
        put: operations["saveLoyalty"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/orders/{orderId}/trace": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Check-in to payout on one screen
         * @description PRD: 11.3, SA-06. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["getOrderTrace"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/organisations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Stores list
         * @description PRD: 11.1. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listOrganisations"];
        put?: never;
        /**
         * Add a store (head office invite sent)
         * @description PRD: 11.1. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["createOrganisation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/organisations/{organisationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Store detail
         * @description PRD: 11.1, PO-09. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["getOrganisation"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Edit store status / fee
         * @description PRD: 11.1, RB-04. Auth: super_admin (support_agent read-only where GET).
         */
        patch: operations["updateOrganisation"];
        trace?: never;
    };
    "/v1/admin/organisations/{organisationId}/branches": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Add a branch
         * @description PRD: 11.1. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["createBranch"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/organisations/{organisationId}/branding/reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reset a store to Skipa default look
         * @description PRD: BR-09. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["resetBranding"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/organisations/{organisationId}/onboarding": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Onboarding checklist
         * @description PRD: 11.1. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["getOnboarding"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/organisations/{organisationId}/onboarding/{stepKey}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Mark a step
         * @description PRD: 11.1. Auth: super_admin (support_agent read-only where GET).
         */
        put: operations["updateOnboardingStep"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/organisations/{organisationId}/plan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Pilot ↔ paid (switches baseline features and fee)
         * @description PRD: SA-09, CS-07. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["changePlan"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/organisations/{organisationId}/pos-connection": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Set POS connector, mode, credentials and Skipa till
         * @description PRD: 12.1, 12.6. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["configurePos"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/organisations/{organisationId}/subaccount": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create/update the Paystack subaccount
         * @description PRD: PY-12. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["createSubaccount"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Platform live totals and needs-action
         * @description PRD: SA-02, SA-06. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["getOverview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/personal-data-access": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reason gate before viewing personal data (30-minute grant)
         * @description PRD: RB-05, SA-01. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["requestPersonalDataAccess"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/platform/switch": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Whole-platform switch-off with typed confirmation
         * @description PRD: SA-05. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["platformSwitch"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/receivables": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Amounts stores owe Skipa (lost chargebacks)
         * @description PRD: 8.4. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listReceivables"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/reconciliation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Match status per store
         * @description PRD: 11.1, PO-07. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listPlatformRecon"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Defaults and timeouts
         * @description PRD: 11.1. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["getPlatformSettings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Change defaults (logged)
         * @description PRD: CS-06. Auth: super_admin (support_agent read-only where GET).
         */
        patch: operations["updatePlatformSettings"];
        trace?: never;
    };
    "/v1/admin/shoppers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Search by phone or receipt number (masked without a grant)
         * @description PRD: 11.1, RB-05. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["searchShoppers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/shoppers/{shopperId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Shopper detail (requires X-Skipa-Access-Grant for unmasked data)
         * @description PRD: RB-05. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["getShopper"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/shoppers/{shopperId}/suspend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Suspend an abusive account
         * @description PRD: 11.1. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["suspendShopper"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/standard-categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Standard category list
         * @description PRD: 7.2. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listStandardCategories"];
        put?: never;
        /**
         * Add a standard category (no code change)
         * @description PRD: 7.2. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["createStandardCategory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/support/tickets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * All tickets, response times, escalations
         * @description PRD: 11.1, HP-13. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listAllTickets"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * SMS/email/Telegram templates
         * @description PRD: NT-03. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listTemplates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/templates/{templateKey}/{channel}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * New template version
         * @description PRD: NT-03. Auth: super_admin (support_agent read-only where GET).
         */
        put: operations["saveTemplate"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/transactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Every order with state, Paystack ref, POS status
         * @description PRD: 11.1. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listTransactions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * All users, roles, invite status, sessions
         * @description PRD: 11.1. Auth: super_admin (support_agent read-only where GET).
         */
        get: operations["listUsers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/view-as": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Read-only "view as store" token (logged)
         * @description PRD: SA-03. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["startViewAs"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/hand-over": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * End this exit checker shift; next checker signs in
         * @description PRD: RB-06, EX-06. Auth: exit_checker session bound to a branch.
         */
        post: operations["handOver"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/invites/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read a staff invite before signing in
         * @description PRD: RB-03, NF-28.
         */
        get: operations["getInvite"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/otp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send a one-time code (SMS to shoppers, email to staff)
         * @description PRD: RB-02, SH-06, SH-08, NF-11. Auth: device token. Rate limit: 5/15min per destination, 20/h per IP.
         */
        post: operations["requestOtp"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/otp/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Verify a code. Shopper sign-in and staff sign-in return a session; shopper registration returns a registration token
         * @description PRD: RB-02, RB-06, SA-01, AUTH-003. Auth: device token. Rate limit: 5 attempts per challenge.
         */
        post: operations["verifyOtp"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Complete shopper registration with consent
         * @description PRD: SH-06, SH-07, NF-15, ST-07. Auth: device token.
         */
        post: operations["registerShopper"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/second-step": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * TOTP second step for super admins (flag superadmin_second_step)
         * @description PRD: SA-01, D-23. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["verifySecondStep"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/second-step/enrol": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Start TOTP enrolment (flag on)
         * @description PRD: SA-01. Auth: super_admin (support_agent read-only where GET).
         */
        post: operations["enrolSecondStep"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Current session and identity
         * @description PRD: RB-01. Auth: device, shopper or staff.
         */
        get: operations["getSession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Active sessions for the signed-in user
         * @description PRD: SD-22. Auth: any staff session.
         */
        get: operations["listMySessions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/sessions/{sessionId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Sign out another of my sessions
         * @description PRD: SD-22. Auth: any staff session.
         */
        delete: operations["revokeMySession"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/sign-out": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Revoke the current session
         * @description PRD: RB-06. Auth: device, shopper or staff.
         */
        post: operations["signOut"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/branches/{branchId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Store page and branding for one branch
         * @description PRD: SH-26, BR-01, BR-07. Auth: device token.
         */
        get: operations["getBranchPublic"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/branches/{branchId}/catalogue": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Compact product list for offline scanning (ETag, gzip)
         * @description PRD: SH-10, SH-11, SH-12, PO-01. Auth: guest device token or shopper session.
         */
        get: operations["getCatalogue"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/check-ins": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Scan an entrance QR: open a shopping session at that branch
         * @description PRD: SH-01, SH-02, NF-05. Auth: guest device token or shopper session.
         */
        post: operations["checkIn"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/devices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Register a device and receive a signed device token
         * @description PRD: IR-06, SH-05.
         */
        post: operations["registerDevice"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Batch of client analytics events (standard properties added server-side)
         * @description PRD: AN-01, AN-02, AN-03. Auth: device token. Rate limit: 60 batches/min per device.
         */
        post: operations["ingestEvents"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/exit/checks/{checkId}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Record match or mismatch (all flagged items must be ticked)
         * @description PRD: EX-06, 6.5. Auth: exit_checker session bound to a branch.
         */
        post: operations["completeCheck"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/exit/checks/{checkId}/weight": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Typed basket weight; compared with expected ±tolerance
         * @description PRD: EX-04, EX-05. Auth: exit_checker session bound to a branch.
         */
        post: operations["recordWeight"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/exit/heartbeat": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Exit device heartbeat every 15 s
         * @description PRD: NF-26, EX-10. Auth: exit_checker session bound to a branch.
         */
        post: operations["exitHeartbeat"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/exit/lookups": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Scan or type a receipt; server validates, applies flagging rules and records a clear check in one step
         * @description PRD: EX-01, EX-02, EX-03, EX-07, SH-23, CS-02. Auth: exit_checker session bound to a branch. Rate limit: 120/min per device.
         */
        post: operations["exitLookup"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/exit/shift-summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * This checker’s shift summary
         * @description PRD: EX-06. Auth: exit_checker session bound to a branch.
         */
        get: operations["shiftSummary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/help/faqs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Suggested questions for this screen and order state
         * @description PRD: HP-01, HP-02, HP-03, HP-15. Auth: device token.
         */
        get: operations["listSuggestedFaqs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/help/match": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Match a typed question to an FAQ; offers support when unsure
         * @description PRD: HP-01, HP-04, HP-05. Auth: device token.
         */
        post: operations["matchFaq"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Shopper profile
         * @description PRD: SH-28, ST-08. Auth: registered shopper session.
         */
        get: operations["getMe"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update name, email, avatar, receipt email opt-in, marketing consent
         * @description PRD: SH-07, SH-29. Auth: registered shopper session.
         */
        patch: operations["updateMe"];
        trace?: never;
    };
    "/v1/me/data-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * My data requests
         * @description PRD: NF-16. Auth: registered shopper session.
         */
        get: operations["listDataRequests"];
        put?: never;
        /**
         * Export or delete my data
         * @description PRD: NF-16. Auth: registered shopper session.
         */
        post: operations["createDataRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/me/notification-preferences": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * My alert channels (dashboard, email)
         * @description PRD: NT-04. Auth: any staff session.
         */
        get: operations["getNotificationPrefs"];
        /**
         * Set non-critical alert channels
         * @description PRD: NT-04. Auth: any staff session.
         */
        put: operations["setNotificationPrefs"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/me/receipts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Receipts across stores (registered) or on this device (guest)
         * @description PRD: SH-21, SH-30. Auth: guest device token or shopper session.
         */
        get: operations["listMyReceipts"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/me/refunds/{refundId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Refund status
         * @description PRD: SH-32. Auth: guest device token or shopper session.
         */
        get: operations["getMyRefund"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/me/stars": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Stars total, per store and history
         * @description PRD: ST-04, ST-08. Auth: registered shopper session.
         */
        get: operations["getStars"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/me/support/tickets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Support tab: conversations with every store
         * @description PRD: SH-27, D-12. Auth: guest device token or shopper session.
         */
        get: operations["listMyTickets"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/me/visited-stores": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Store switcher list
         * @description PRD: SH-30, D-14. Auth: registered shopper session.
         */
        get: operations["listVisitedStores"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/monitoring/tunnel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Sentry SDK envelope tunnel to GlitchTip (keeps request IDs, avoids blockers)
         * @description PRD: ER-01, ER-02.
         */
        post: operations["sentryTunnel"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create an order from the cart (prices re-checked; 409 PRICE_CHANGED)
         * @description PRD: PY-01, SH-16, CS-01, CS-03. Auth: guest device token or shopper session.
         */
        post: operations["createOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/orders/{orderId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Order with server-confirmed status (polling fallback for the pending screen)
         * @description PRD: SH-18, SH-19, HP-04. Auth: guest device token or shopper session.
         */
        get: operations["getOrder"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/orders/{orderId}/payment-attempts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Initialise a Paystack transaction on the store subaccount
         * @description PRD: SH-17, PY-01, PY-12. Auth: guest device token or shopper session.
         */
        post: operations["startPayment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/orders/{orderId}/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ask the server to verify now (after the popup closes). Never trusted as success on its own
         * @description PRD: PY-02, PY-03. Auth: guest device token or shopper session. Rate limit: 1 per 5 s per order.
         */
        post: operations["nudgeVerify"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/payments/return": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Redirect target after Paystack redirect checkout; redirects to the pending screen
         * @description PRD: SH-17, Q09.
         */
        get: operations["paymentReturn"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/receipts/{receiptId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Receipt with exit QR status
         * @description PRD: SH-20, SH-23, PY-06. Auth: guest device token or shopper session.
         */
        get: operations["getReceipt"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/receipts/{receiptId}/email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Email this receipt (app + email; no SMS)
         * @description PRD: SH-21, NT-06. Auth: guest device token or shopper session.
         */
        post: operations["emailReceipt"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/receipts/{receiptId}/rating": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 1–5 rating after exit
         * @description PRD: SH-24. Auth: guest device token or shopper session.
         */
        post: operations["rateVisit"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/receipts/{receiptId}/refund-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Request a whole-order refund (paid by the store outside Skipa)
         * @description PRD: SH-22, SH-32, PY-07, NT-02. Auth: guest device token or shopper session.
         */
        post: operations["requestRefund"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sessions/{sessionId}/cart": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Cart snapshot from the phone; returns server prices and limits
         * @description PRD: SH-14, SH-15, SH-16, CART-004. Auth: guest device token or shopper session.
         */
        put: operations["syncCart"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sessions/{sessionId}/end": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Shopper leaves without paying
         * @description PRD: SH-03. Auth: guest device token or shopper session.
         */
        post: operations["endSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sessions/{sessionId}/unknown-barcodes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Batch of not-found / not-included scans (offline outbox)
         * @description PRD: SH-12, SH-13. Auth: guest device token or shopper session.
         */
        post: operations["reportUnknownBarcodes"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/admin-access-log": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Super admin views of this store’s personal data
         * @description PRD: RB-05, RB-07. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["getAdminAccessLog"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/alerts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Needs-action list and alert centre
         * @description PRD: SD-01, 9. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listStoreAlerts"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/alerts/{alertId}/acknowledge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Acknowledge an alert
         * @description PRD: 9. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["ackStoreAlert"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/analytics/{report}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Store analytics report from our database
         * @description PRD: 13.3, AN-08, AN-09, AN-10. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["getStoreReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/audit-log": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read-only store audit log (head office)
         * @description PRD: RB-07, SD-20. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["getStoreAuditLog"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/baselines": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 3-month baseline for a category (pilot plan only)
         * @description PRD: CT-08, D-21. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["recordBaseline"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/branches/{branchId}/categories/{categoryId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Switch a category on/off at a branch
         * @description PRD: CT-01, CT-08, CT-09. Auth: store_manager or head_office_admin (branch-scoped).
         */
        put: operations["toggleBranchCategory"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/branches/{branchId}/qr-codes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Entrance QR codes and scans
         * @description PRD: SD-08. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listQrCodes"];
        put?: never;
        /**
         * Add a QR location
         * @description PRD: SD-08. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["createQrCode"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/branches/{branchId}/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Flagging rules, random rate, limits, channels
         * @description PRD: CS-06, SD-23. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["getBranchSettings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Change settings (logged with before/after and reason)
         * @description PRD: EX-11, PY-11, RB-04. Auth: store_manager or head_office_admin (branch-scoped).
         */
        patch: operations["updateBranchSettings"];
        trace?: never;
    };
    "/v1/store/branches/{branchId}/switch-off": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Switch Skipa off at a branch (press-and-hold + reason)
         * @description PRD: SD-03. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["switchOffBranch"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/branches/{branchId}/switch-on": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Switch Skipa back on
         * @description PRD: SD-03. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["switchOnBranch"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/branding": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Published and draft branding
         * @description PRD: BR-01..09. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["getBranding"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/branding/assets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upload logo/cover (compressed server-side to ≤50 KB / ≤150 KB)
         * @description PRD: BR-05. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["uploadBrandAsset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/branding/draft": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Save draft; returns contrast report and preview tokens
         * @description PRD: BR-02, BR-04. Auth: store_manager or head_office_admin (branch-scoped).
         */
        put: operations["saveBrandingDraft"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/branding/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Publish draft (blocked if contrast fails)
         * @description PRD: BR-03, BR-04, BR-09. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["publishBranding"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/branding/versions/{versionId}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Restore a previous version as the draft
         * @description PRD: BR-03. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["restoreBranding"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Categories with per-branch status and readiness
         * @description PRD: CT-01, CT-06. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listCategories"];
        put?: never;
        /**
         * Create a custom category (check level floor computed)
         * @description PRD: CT-02, CT-03. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["createCustomCategory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/categories/{categoryId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Rename, change products or raise check level
         * @description PRD: CT-02, CT-03, CT-09. Auth: store_manager or head_office_admin (branch-scoped).
         */
        patch: operations["updateCategory"];
        trace?: never;
    };
    "/v1/store/data-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Shopper data requests for this store
         * @description PRD: NF-16. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listStoreDataRequests"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/disputes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Chargebacks and their deadlines
         * @description PRD: PY-09. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listStoreDisputes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/exit-checks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Exit check log
         * @description PRD: EX-06, SD-05. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listExitChecks"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/exit-checks/signals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Unusual checker patterns (signals only)
         * @description PRD: EX-08. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listCheckerSignals"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/exports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * CSV/Excel export (async, logged)
         * @description PRD: SD-05. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["createExport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/exports/{exportId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Export status and download link
         * @description PRD: SD-05. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["getExport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/faqs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Store FAQs used by the chatbot
         * @description PRD: HP-02. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listStoreFaqs"];
        put?: never;
        /**
         * Add a store FAQ
         * @description PRD: HP-02. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["createStoreFaq"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/faqs/{faqId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Edit a store FAQ
         * @description PRD: HP-02. Auth: store_manager or head_office_admin (branch-scoped).
         */
        put: operations["updateStoreFaq"];
        post?: never;
        /**
         * Remove a store FAQ
         * @description PRD: HP-02. Auth: store_manager or head_office_admin (branch-scoped).
         */
        delete: operations["deleteStoreFaq"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Live view snapshot (then SSE updates)
         * @description PRD: SD-01, SD-04. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["getLive"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/loss-counts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Weekly loss per category from stock counts
         * @description PRD: SD-07, 2.4. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["recordLossCount"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/loss-report": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Weekly loss vs baseline (pilot plan only)
         * @description PRD: SD-07, D-21. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["getLossReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/payouts/{date}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Payout report: sales, Paystack fees, Skipa fee, chargebacks, payout
         * @description PRD: PO-08, PY-13. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["getPayoutReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/pos/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * File-mode files to download/upload
         * @description PRD: 12.1. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listPosFiles"];
        put?: never;
        /**
         * Upload a product file (file mode)
         * @description PRD: 12.1, PO-02. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["uploadPosFile"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/pos/files/{fileId}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Confirm a sales file was imported into the POS
         * @description PRD: PO-03. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["confirmPosFile"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/pos/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * POS integration health
         * @description PRD: PO-09. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["getPosHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Products with readiness and branch prices
         * @description PRD: CT-04, CT-06, PO-10. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listProducts"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/products/{productId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Extra checks, sold through Skipa (till-only), weight
         * @description PRD: CT-04, CT-07, CT-09. Auth: store_manager or head_office_admin (branch-scoped).
         */
        patch: operations["updateProduct"];
        trace?: never;
    };
    "/v1/store/products/weights-import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upload a CSV of barcode,weight_grams
         * @description PRD: CT-07. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["importWeights"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/qr-codes/{qrCodeId}/sign.pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Printable A4 sign (store branding, standard QR)
         * @description PRD: SD-08, BR-01. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["qrSignPdf"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/receipts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Receipts, searchable and filterable
         * @description PRD: SD-05, 10.1. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listReceipts"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/receipts/{receiptId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Receipt detail: items, payment, exit check, refund/dispute, timeline
         * @description PRD: SD-02, CS-01. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["getReceiptTrace"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/reconciliation/days": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Daily three-way match
         * @description PRD: PO-07. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listReconDays"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/reconciliation/items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Unmatched items with cause
         * @description PRD: PO-07. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listReconItems"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/reconciliation/items/{itemId}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resolve manually with a reason (logged)
         * @description PRD: 12.4, RB-04. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["resolveReconItem"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/reconciliation/items/{itemId}/retry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Retry a failed POS posting now
         * @description PRD: PO-05. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["retryPosting"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/refunds": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Refunds to decide, record, or waiting for head office
         * @description PRD: PY-07, PY-08. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listRefunds"];
        put?: never;
        /**
         * Store-initiated whole-order refund (e.g. from a ticket)
         * @description PRD: PY-07, HP-11. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["createStoreRefund"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/refunds/{refundId}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Approve (head office required above threshold)
         * @description PRD: PY-07, PY-08, RB-04. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["approveRefund"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/refunds/{refundId}/decline": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Decline with a reason
         * @description PRD: PY-07, RB-04. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["declineRefund"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/refunds/{refundId}/payment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Record that the store paid the shopper outside Skipa (method, date, reference)
         * @description PRD: PY-07, PY-10, ST-06, RB-04. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["recordRefundPayment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/shift-close/{date}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Skipa till shift-close report
         * @description PRD: PO-06. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["getShiftClose"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/shoppers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Consenting registered shoppers, visits and stars
         * @description PRD: ST-09, Q12. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listStoreShoppers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/staff": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Staff, invites and sessions
         * @description PRD: RB-01, RB-03. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listStaff"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/staff/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Remove a staff member
         * @description PRD: RB-03. Auth: store_manager or head_office_admin (branch-scoped).
         */
        delete: operations["removeStaff"];
        options?: never;
        head?: never;
        /**
         * Suspend/reactivate, change role or branches (immediate effect)
         * @description PRD: RB-03, RB-04. Auth: store_manager or head_office_admin (branch-scoped).
         */
        patch: operations["updateStaff"];
        trace?: never;
    };
    "/v1/store/staff/{userId}/invite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Cancel a pending invite
         * @description PRD: RB-03. Auth: store_manager or head_office_admin (branch-scoped).
         */
        delete: operations["cancelInvite"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/staff/{userId}/invite/resend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resend a pending invite
         * @description PRD: RB-03. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["resendInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/staff/invites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Invite by email (all roles, incl. exit checkers)
         * @description PRD: RB-03, 3.2, NF-28. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["inviteStaff"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/support/tickets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Support inbox
         * @description PRD: HP-10, HP-12. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["listInbox"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/store/support/tickets/{ticketId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ticket with attached order and payment context
         * @description PRD: HP-08. Auth: store_manager or head_office_admin (branch-scoped).
         */
        get: operations["getInboxTicket"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Change status
         * @description PRD: HP-11. Auth: store_manager or head_office_admin (branch-scoped).
         */
        patch: operations["updateTicket"];
        trace?: never;
    };
    "/v1/store/support/tickets/{ticketId}/escalate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Escalate a platform fault to Skipa
         * @description PRD: HP-13. Auth: store_manager or head_office_admin (branch-scoped).
         */
        post: operations["escalateTicket"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/stores": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Search stores by name or area; distance is computed on the phone
         * @description PRD: SH-26, D-11, NF-29. Auth: device token.
         */
        get: operations["searchStores"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Server-sent events for the caller’s channels (order, ticket, branch, platform)
         * @description PRD: SD-01, EX-10, SA-02. Auth: device, shopper or staff.
         */
        get: operations["stream"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/support/tickets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Message store support with order details attached
         * @description PRD: HP-07, HP-08, HP-09, NT-02. Auth: guest device token or shopper session.
         */
        post: operations["createTicket"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/support/tickets/{ticketId}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Messages in a ticket (shopper or store)
         * @description PRD: HP-11. Auth: device, shopper or staff.
         */
        get: operations["listTicketMessages"];
        put?: never;
        /**
         * Reply in a ticket (shopper or store; internal notes store-only)
         * @description PRD: HP-11. Auth: device, shopper or staff.
         */
        post: operations["postTicketMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/support/tickets/{ticketId}/rating": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rate support after resolution
         * @description PRD: HP-14. Auth: guest device token or shopper session.
         */
        post: operations["rateSupport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/tours/{tourKey}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Tour seen/skipped/completed (device or staff user)
         * @description PRD: SH-31, SD-21, EX-12. Auth: device, shopper or staff.
         */
        put: operations["saveTourProgress"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhooks/paystack": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Paystack events (x-paystack-signature HMAC-SHA512)
         * @description PRD: PY-02, PY-04, PY-09, NF-09.
         */
        post: operations["paystackWebhook"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhooks/pos/{connectorKey}/{organisationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * POS price/stock push (connector-specific signature)
         * @description PRD: PO-02.
         */
        post: operations["posPush"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhooks/resend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resend delivery/bounce events (Svix signature)
         * @description PRD: NT-06.
         */
        post: operations["emailEvents"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/webhooks/sms/{provider}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * SMS delivery report (Africa’s Talking / Termii)
         * @description PRD: NT-05, NOTIF-002.
         */
        post: operations["smsDeliveryReport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
};
export type webhooks = Record<string, never>;
export type components = {
    schemas: {
        AdminAccessEntry: {
            adminName: string;
            /** Format: date-time */
            grantedAt: string;
            /** Format: uuid */
            id: string;
            reason: string;
            subjectType?: string;
        };
        Alert: {
            body: string;
            code: string;
            /** Format: date-time */
            firstSeenAt: string;
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            lastSeenAt?: string;
            linkPath?: string | null;
            occurrences?: number;
            /** @enum {string} */
            severity: "critical" | "high" | "medium" | "low" | "store";
            /** @enum {string} */
            status: "open" | "acknowledged" | "resolved";
            title: string;
        };
        AuditEntry: {
            action: string;
            actorName: string;
            actorRole: string;
            after?: Record<string, never> | null;
            before?: Record<string, never> | null;
            branchId?: string | null;
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            occurredAt: string;
            reason?: string | null;
            targetId?: string | null;
            targetType: string;
        };
        Baseline: {
            agreedMarginBps?: number;
            /** Format: uuid */
            branchId: string;
            /** Format: uuid */
            categoryId: string;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            lossKobo: number;
            /** Format: date */
            periodEnd: string;
            /** Format: date */
            periodStart: string;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            salesKobo: number;
        };
        BillingStatement: {
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            feeExpectedKobo: number;
            feeRateBps: number;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            feeSplitByPaystackKobo: number;
            /** Format: date */
            month: string;
            /** Format: uuid */
            organisationId: string;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            settledSalesKobo: number;
            /** @enum {string} */
            status: "matched" | "mismatch" | "pilot_no_fee";
            storeName?: string;
        };
        BranchCategoryToggle: {
            active: boolean;
            reason: string;
        };
        BranchCreate: {
            addressLine: string;
            area: string;
            city?: string;
            code: string;
            latitude?: number;
            longitude?: number;
            name: string;
            openingHours?: Record<string, never>;
            phone?: string;
        };
        BranchPublic: {
            address?: string;
            area: string;
            /** Format: uuid */
            branchId: string;
            branchName: string;
            brand: components["schemas"]["BrandTokens"];
            latitude?: number | null;
            longitude?: number | null;
            openingHours?: Record<string, never>;
            /** Format: uuid */
            organisationId: string;
            phone?: string;
            serviceDesk?: string;
            /** @enum {string} */
            skipaStatus: "on" | "off" | "payments_unavailable";
            storeName: string;
        };
        BranchSettings: {
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            basketValueThresholdKobo?: number;
            cartMaxItems?: number;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            cartMaxValueKobo?: number;
            channelCardEnabled?: boolean;
            channelTransferEnabled?: boolean;
            channelUssdEnabled?: boolean;
            exitSessionIdleHours?: number;
            exitWindowMinutes?: number;
            largeBasketItems?: number;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            priceThresholdKobo?: number;
            /** @enum {integer} */
            randomCheckRatePct?: 1 | 2 | 5 | 10 | 15 | 20;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            refundHeadOfficeThresholdKobo?: number;
            ruleBasketValueEnabled?: boolean;
            ruleExtraChecksEnabled?: boolean;
            ruleItemCountEnabled?: boolean;
            rulePreviousMismatchEnabled?: boolean;
            rulePriceThresholdEnabled?: boolean;
            sessionTimeoutMinutes?: number;
            stalePriceHours?: number;
            supportFirstReplyMinutes?: number;
            weightToleranceBps?: number;
        };
        BrandingDraft: {
            accentColor: string;
            coverAssetId?: string | null;
            displayName: string;
            logoSquareAssetId?: string | null;
            logoWideAssetId?: string | null;
            primaryColor: string;
            qrSignDesign?: Record<string, never>;
            receiptFooter?: string;
            receiptHeader?: string;
            socialLinks?: Record<string, never>;
            welcomeMessage?: string;
        };
        BrandingVersion: {
            contrast: components["schemas"]["ContrastReport"];
            draft: components["schemas"]["BrandingDraft"];
            /** Format: uuid */
            id: string;
            publishedAt?: string | null;
            publishedByName?: string | null;
            /** @enum {string} */
            status: "draft" | "published" | "superseded";
            tokens: components["schemas"]["BrandTokens"];
            version: number;
        };
        BrandTokens: {
            accent: string;
            accentSubtle?: string;
            coverUrl?: string | null;
            displayName: string;
            logoSquareUrl?: string | null;
            logoWideUrl?: string | null;
            onAccent: string;
            onPrimary: string;
            primary: string;
            primaryHover?: string;
            primaryPressed?: string;
            primarySubtle?: string;
            primaryText: string;
            receiptFooter?: string;
            receiptHeader?: string;
            socialLinks?: Record<string, never>;
            welcomeMessage?: string;
        };
        CartLineInput: {
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            expectedUnitPriceKobo?: number;
            /** Format: uuid */
            productId: string;
            quantity: number;
        };
        CartQuote: {
            blocked: {
                /** Format: uuid */
                productId: string;
                /** @enum {string} */
                reason: "till_only" | "category_off" | "price_updating" | "not_ready";
            }[];
            itemCount: number;
            limitExceeded: ("value" | "items") | null;
            lines: {
                /**
                 * Format: int64
                 * @description Amount in kobo (₦1 = 100 kobo).
                 */
                lineTotalKobo: number;
                name: string;
                /** Format: uuid */
                productId: string;
                quantity: number;
                /**
                 * Format: int64
                 * @description Amount in kobo (₦1 = 100 kobo).
                 */
                unitPriceKobo: number;
            }[];
            priceChanges: {
                /**
                 * Format: int64
                 * @description Amount in kobo (₦1 = 100 kobo).
                 */
                newPriceKobo: number;
                /**
                 * Format: int64
                 * @description Amount in kobo (₦1 = 100 kobo).
                 */
                oldPriceKobo: number;
                /** Format: uuid */
                productId: string;
            }[];
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            totalKobo: number;
        };
        CartSnapshot: {
            /** Format: date-time */
            clientUpdatedAt: string;
            items: components["schemas"]["CartLineInput"][];
            lastScreen?: string;
        };
        Catalogue: {
            /** Format: uuid */
            branchId: string;
            categories: {
                active: boolean;
                /** Format: uuid */
                id: string;
                name: string;
            }[];
            /** Format: date-time */
            generatedAt: string;
            products: components["schemas"]["CatalogueProduct"][];
            version: number;
        };
        CatalogueProduct: {
            barcode: string;
            /** Format: uuid */
            categoryId: string;
            /** Format: uuid */
            id: string;
            name: string;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            priceKobo: number;
            /** @enum {string} */
            status: "available" | "till_only" | "category_off" | "price_updating" | "not_ready";
        };
        Category: {
            branches: {
                activatedAt?: string | null;
                active: boolean;
                /** Format: uuid */
                branchId: string;
            }[];
            /** @enum {string} */
            checkLevel: "standard" | "extra";
            /** @enum {string} */
            checkLevelFloor: "standard" | "extra";
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            kind: "standard" | "custom";
            name: string;
            readiness?: {
                missingBarcode: number;
                missingWeight: number;
                outOfStock: number;
                ready: number;
                tillOnly: number;
            };
        };
        CategoryCreate: {
            barcodes?: string[];
            /** @enum {string} */
            checkLevel?: "standard" | "extra";
            name: string;
            posDepartments?: string[];
            productIds?: string[];
        };
        CategoryPatch: {
            addProductIds?: string[];
            /** @enum {string} */
            checkLevel?: "standard" | "extra";
            name?: string;
            removeProductIds?: string[];
        };
        CheckerSignal: {
            metrics: Record<string, never>;
            name: string;
            /** @enum {string} */
            signal: "low_mismatch_rate" | "fast_flagged_checks" | "large_basket_not_weighed";
            /** Format: uuid */
            userId: string;
            /** Format: date-time */
            windowEnd: string;
        };
        CheckInRequest: {
            /** @enum {string} */
            entryPoint?: "store_qr" | "skipa_home_scan" | "resume";
            qrCode: string;
        };
        ClientEvent: {
            branchId?: string | null;
            /** Format: uuid */
            clientEventId: string;
            name: string;
            networkType?: string;
            /** Format: date-time */
            occurredAt: string;
            properties: Record<string, never>;
            screen?: string;
            sessionId?: string | null;
        };
        ContrastReport: {
            pairs: {
                name: string;
                passes: boolean;
                ratio: number;
                required: number;
                suggested?: string | null;
            }[];
            passes: boolean;
        };
        CreateOrder: {
            /** @enum {string} */
            channel: "card" | "bank_transfer" | "ussd";
            items: components["schemas"]["CartLineInput"][];
            /** Format: uuid */
            sessionId: string;
        };
        DataRequest: {
            downloadUrl?: string | null;
            /** Format: date-time */
            dueAt: string;
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            status: "received" | "in_progress" | "completed" | "rejected";
            /** @enum {string} */
            type: "export" | "delete";
        };
        Device: {
            /** Format: uuid */
            deviceId: string;
            /** @description Signed token; send as X-Skipa-Device. */
            deviceToken: string;
        };
        DeviceRegistration: {
            appVersion: string;
            browser?: string;
            /** @enum {string} */
            platform: "web" | "ios" | "android";
        };
        Dispute: {
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            amountKobo: number;
            category?: string | null;
            /** Format: date-time */
            dueAt: string;
            evidenceSubmittedAt?: string | null;
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            liability?: "store" | "skipa";
            /** Format: uuid */
            orderId: string;
            orderNumber?: string;
            /** @enum {string} */
            status: "open" | "evidence_submitted" | "awaiting_bank" | "won" | "lost" | "accepted";
        };
        EmailReceipt: {
            /** Format: email */
            email?: string;
        };
        Error: {
            error: {
                /** @example PAY-007 */
                code: string;
                details?: Record<string, never>;
                message: string;
                /** @description Short reference shown to users (ER-08). */
                requestId: string;
                /** @description Plain-English message safe to show (ER-07). */
                userMessage: string;
            };
        };
        ErrorSummary: {
            code: string;
            count: number;
            glitchtipUrl?: string | null;
            /** Format: date-time */
            lastSeenAt: string;
            message: string;
            release?: string;
            /** @enum {string} */
            severity: "critical" | "high" | "medium" | "low";
            storeName?: string | null;
        };
        EventBatch: {
            events: components["schemas"]["ClientEvent"][];
        };
        ExitCheck: {
            actualWeightGrams?: number | null;
            /** Format: uuid */
            branchId: string;
            checkerName: string;
            completedAt?: string | null;
            /** @enum {string} */
            decision?: "clear" | "flagged" | "invalid";
            durationMs?: number | null;
            expectedWeightGrams?: number | null;
            flagReasons?: string[];
            /** Format: uuid */
            id: string;
            notes?: string | null;
            randomCheck?: boolean;
            receiptNumber?: string | null;
            result: ("clear" | "match" | "mismatch" | "invalid" | "abandoned") | null;
            /** Format: date-time */
            startedAt: string;
        };
        ExitComplete: {
            mismatchReasons?: ("item_missing" | "extra_item" | "wrong_item" | "weight_out_of_tolerance" | "other")[];
            notes?: string;
            /** @enum {string} */
            result: "match" | "mismatch";
            tickedOrderItemIds: string[];
        };
        ExitDecision: {
            /** Format: uuid */
            checkId: string;
            /** @enum {string} */
            decision: "clear" | "flagged" | "invalid";
            expectedWeightGrams?: number | null;
            invalidReason?: ("not_paid" | "already_used" | "expired" | "other_branch" | "not_found" | "refunded") | null;
            items?: {
                flagged: boolean;
                flagReason?: string | null;
                name: string;
                /** Format: uuid */
                orderItemId: string;
                quantity: number;
            }[];
            largeBasket?: boolean;
            randomCheck?: boolean;
            receipt: {
                itemCount: number;
                /** Format: date-time */
                paidAt: string;
                receiptNumber: string;
            } | null;
            usedAt?: string | null;
            weightRangeGrams?: {
                max: number;
                min: number;
            } | null;
        };
        ExitLookup: {
            qrPayload?: string;
            receiptNumber?: string;
        };
        Export: {
            /** Format: date-time */
            createdAt: string;
            dataset: string;
            downloadUrl?: string | null;
            format: string;
            /** Format: uuid */
            id: string;
            rowCount?: number | null;
            /** @enum {string} */
            status: "queued" | "running" | "ready" | "failed" | "expired";
        };
        ExportCreate: {
            /** @enum {string} */
            dataset: "receipts" | "exit_checks" | "refunds" | "disputes" | "support_tickets" | "shoppers" | "reconciliation" | "audit_log" | "transactions" | "stores";
            filters: Record<string, never>;
            /** @enum {string} */
            format: "csv" | "xlsx";
        };
        Faq: {
            active?: boolean;
            answer: string;
            /** Format: uuid */
            id: string;
            keywords?: string[];
            offerSupport?: boolean;
            orderStates?: string[];
            question: string;
            screens?: string[];
        };
        FaqInput: {
            active?: boolean;
            answer: string;
            keywords?: string[];
            offerSupport?: boolean;
            orderStates?: string[];
            question: string;
            screens?: string[];
        };
        FaqMatch: {
            answer?: string | null;
            confidence: number;
            faqId?: string | null;
            matched: boolean;
            offerSupport: boolean;
            paymentState?: ("created" | "pending" | "paid" | "failed" | "exited" | "refund_requested" | "awaiting_head_office" | "refunded" | "partially_refunded" | "disputed" | "chargeback_won" | "chargeback_lost") | null;
        };
        FaqMatchRequest: {
            branchId?: string | null;
            orderId?: string | null;
            query: string;
            screen: string;
        };
        FeatureFlag: {
            description: string;
            enabled: boolean;
            key: string;
            rollout: {
                branchIds?: string[];
                organisationIds?: string[];
                percent?: number;
            };
            /** Format: date-time */
            updatedAt?: string;
        };
        FeatureFlagPatch: {
            enabled?: boolean;
            reason: string;
            rollout?: Record<string, never>;
        };
        Health: {
            checks?: Record<string, never>;
            release?: string;
            /** @enum {string} */
            status: "ok" | "degraded" | "down";
        };
        Heartbeat: {
            appVersion?: string;
            networkType?: string;
            /** Format: date-time */
            sentAt: string;
        };
        InviteInfo: {
            email: string;
            organisationName: string | null;
            /** @enum {string} */
            role: "exit_checker" | "store_manager" | "head_office_admin" | "super_admin" | "support_agent";
            /** @enum {string} */
            status: "pending" | "accepted" | "cancelled" | "expired";
        };
        LiveSnapshot: {
            exitDevices: {
                /** Format: uuid */
                id: string;
                label: string;
                lastHeartbeatAt?: string | null;
                /** @enum {string} */
                status: "online" | "offline";
            }[];
            needsAction: components["schemas"]["Alert"][];
            paymentsConfirming: number;
            shoppersInStore: number;
            today: {
                exitChecks: number;
                mismatches: number;
                receipts: number;
                /**
                 * Format: int64
                 * @description Amount in kobo (₦1 = 100 kobo).
                 */
                salesKobo: number;
                shoppers: number;
            };
        };
        LossCount: {
            /** Format: uuid */
            branchId: string;
            /** Format: uuid */
            categoryId: string;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            lossKobo: number;
            /** Format: date */
            weekStart: string;
        };
        LoyaltyRules: {
            bonuses?: Record<string, never>[];
            dailyCapPerStore: number;
            /** Format: date-time */
            effectiveFrom?: string;
            perVisit: number;
            tiersEnabled: boolean;
            version: number;
        };
        MessageCreate: {
            body: string;
            /** Format: uuid */
            clientMessageId: string;
            internalNote?: boolean;
        };
        NotificationPreference: {
            alertKey: string;
            critical: boolean;
            email: boolean;
            inApp: boolean;
        };
        OnboardingChecklist: {
            /** Format: uuid */
            organisationId: string;
            steps: {
                completedAt?: string | null;
                /** @enum {string} */
                key: "agreement_signed" | "paystack_subaccount" | "pos_connected" | "catalogue_imported" | "weights_complete" | "baselines_collected" | "staff_invited" | "qr_printed" | "go_live_approved";
                label: string;
                note?: string | null;
                /** @enum {string} */
                status: "done" | "now" | "todo" | "not_applicable";
            }[];
        };
        OnboardingStepUpdate: {
            note?: string;
            /** @enum {string} */
            status: "done" | "todo" | "not_applicable";
        };
        Order: {
            /** Format: uuid */
            branchId: string;
            /** Format: date-time */
            createdAt: string;
            exitValidUntil?: string | null;
            /** Format: uuid */
            id: string;
            itemCount: number;
            items: components["schemas"]["OrderItem"][];
            orderNumber: string;
            paidAt?: string | null;
            pendingSince?: string | null;
            /** @description True after 2 minutes pending (SH-19, PAY-007). */
            pendingTooLong?: boolean;
            receiptId?: string | null;
            /** @enum {string} */
            status: "created" | "pending" | "paid" | "failed" | "exited" | "refund_requested" | "awaiting_head_office" | "refunded" | "partially_refunded" | "disputed" | "chargeback_won" | "chargeback_lost";
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            totalKobo: number;
        };
        OrderItem: {
            barcode?: string;
            categoryName: string;
            /** Format: uuid */
            id: string;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            lineTotalKobo: number;
            name: string;
            quantity: number;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            unitPriceKobo: number;
        };
        Organisation: {
            adoptionPct?: number | null;
            branches?: number;
            /** Format: uuid */
            id: string;
            legalName?: string;
            name: string;
            paystackSubaccountCode?: string | null;
            pilotEndsOn?: string | null;
            /** @enum {string} */
            plan: "pilot" | "paid";
            platformFeeBps: number;
            posConnector?: string | null;
            posMode?: ("api" | "file") | null;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            sales30dKobo?: number;
            /** @enum {string} */
            status: "onboarding" | "pilot" | "live" | "paused" | "ended";
            syncHealth?: string;
        };
        OrganisationCreate: {
            /** Format: email */
            headOfficeEmail: string;
            headOfficeName?: string;
            legalName: string;
            name: string;
            /** Format: date */
            pilotEndsOn?: string;
            /** @enum {string} */
            plan: "pilot" | "paid";
            platformFeeBps?: number;
        };
        OrganisationPatch: {
            name?: string;
            platformFeeBps?: number;
            reason: string;
            /** @enum {string} */
            status?: "onboarding" | "pilot" | "live" | "paused" | "ended";
        };
        OtpChallenge: {
            /** Format: uuid */
            challengeId: string;
            destinationMasked: string;
            /** Format: date-time */
            expiresAt: string;
            /** Format: date-time */
            resendAfter: string;
        };
        OtpRequest: {
            /** @description E.164 phone (+234…) for shoppers, email for staff. */
            destination: string;
            inviteToken?: string;
            /** @enum {string} */
            purpose: "shopper_register" | "shopper_sign_in" | "staff_sign_in" | "admin_sign_in";
            /** @enum {string} */
            surface?: "exit" | "store" | "admin";
        };
        OtpVerify: {
            /** Format: uuid */
            challengeId: string;
            code: string;
            exitDeviceLabel?: string;
        };
        PageAdminAccessEntry: {
            data: components["schemas"]["AdminAccessEntry"][];
            nextCursor: string | null;
        };
        PageAlert: {
            data: components["schemas"]["Alert"][];
            nextCursor: string | null;
        };
        PageAuditEntry: {
            data: components["schemas"]["AuditEntry"][];
            nextCursor: string | null;
        };
        PageDispute: {
            data: components["schemas"]["Dispute"][];
            nextCursor: string | null;
        };
        PageExitCheck: {
            data: components["schemas"]["ExitCheck"][];
            nextCursor: string | null;
        };
        PageOrganisation: {
            data: components["schemas"]["Organisation"][];
            nextCursor: string | null;
        };
        PageProduct: {
            data: components["schemas"]["Product"][];
            nextCursor: string | null;
        };
        PageReceiptListItem: {
            data: components["schemas"]["ReceiptListItem"][];
            nextCursor: string | null;
        };
        PageReconItem: {
            data: components["schemas"]["ReconItem"][];
            nextCursor: string | null;
        };
        PageRefund: {
            data: components["schemas"]["Refund"][];
            nextCursor: string | null;
        };
        PageShopperAdmin: {
            data: components["schemas"]["ShopperAdmin"][];
            nextCursor: string | null;
        };
        PageShopperForStore: {
            data: components["schemas"]["ShopperForStore"][];
            nextCursor: string | null;
        };
        PageTicket: {
            data: components["schemas"]["Ticket"][];
            nextCursor: string | null;
        };
        PageUserAdmin: {
            data: components["schemas"]["UserAdmin"][];
            nextCursor: string | null;
        };
        PaymentAttempt: {
            /** @description Pass to PaystackPop.resumeTransaction(). */
            accessCode: string;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            amountKobo: number;
            /** Format: uuid */
            attemptId: string;
            /** @description Redirect fallback (Q09). */
            authorizationUrl: string;
            publicKey: string;
            reference: string;
        };
        PayoutReport: {
            bankLast4?: string | null;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            chargebacksKobo: number;
            /** Format: date */
            date: string;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            payoutKobo: number;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            paystackFeesKobo: number;
            receipts: number;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            refundsPaidByStoreKobo: number;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            salesKobo: number;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            skipaFeeKobo: number;
            /** @enum {string} */
            status: "tied" | "mismatch" | "awaiting_payout";
        };
        PersonalDataAccessGrant: {
            /** Format: date-time */
            expiresAt: string;
            /** @description Send as X-Skipa-Access-Grant. */
            grantToken: string;
        };
        PersonalDataAccessRequest: {
            organisationId?: string | null;
            reason: string;
            subjectId?: string | null;
            /** @enum {string} */
            subjectType: "shopper" | "organisation_shoppers" | "order";
        };
        PlanChange: {
            /** Format: date */
            pilotEndsOn?: string;
            /** @enum {string} */
            plan: "pilot" | "paid";
            platformFeeBps?: number;
            reason: string;
        };
        PlatformSettings: {
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            chargebackReserveLowWaterKobo?: number;
            defaults?: Record<string, never>;
            emailDailyReserve?: number;
            timeouts?: Record<string, never>;
        };
        PlatformSwitch: {
            /** @description Must equal 'SWITCH OFF SKIPA' to switch off (SA-05). */
            confirmation: string;
            enabled: boolean;
            reason: string;
        };
        PosFile: {
            businessDate?: string | null;
            /** Format: date-time */
            createdAt: string;
            /** @enum {string} */
            direction: "inbound" | "outbound";
            downloadUrl?: string | null;
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            kind: "products" | "sales_refunds" | "shift_close" | "weights";
            rowCount?: number;
            status: string;
        };
        PosHealth: {
            connector?: string;
            failures24h: number;
            lastSuccessAt?: string | null;
            lastSyncAt: string | null;
            /** @enum {string} */
            mode: "api" | "file";
            pendingPostings?: number;
            /** @enum {string} */
            status: "testing" | "live" | "failing" | "disabled";
        };
        Product: {
            barcode: string | null;
            branchPrices?: {
                /** Format: uuid */
                branchId: string;
                /**
                 * Format: int64
                 * @description Amount in kobo (₦1 = 100 kobo).
                 */
                priceKobo: number;
                /** Format: date-time */
                priceSyncedAt: string;
                stockQty?: number | null;
            }[];
            categoryId: string | null;
            extraChecks: boolean;
            /** Format: uuid */
            id: string;
            name: string;
            posDepartment?: string | null;
            /** @enum {string} */
            readiness: "ready" | "missing_weight" | "missing_barcode" | "variable_price" | "sold_by_weight" | "category_off" | "till_only" | "price_stale";
            soldThroughSkipa: boolean;
            weightGrams?: number | null;
        };
        ProductPatch: {
            /** Format: uuid */
            categoryId?: string;
            extraChecks?: boolean;
            reason: string;
            soldThroughSkipa?: boolean;
            weightGrams?: number;
        };
        QrCode: {
            active: boolean;
            code: string;
            /** Format: uuid */
            id: string;
            lastPrintedAt?: string | null;
            locationLabel: string;
            scans7d: number;
            signsPrinted?: number;
        };
        QrCodeCreate: {
            locationLabel: string;
        };
        Rating: {
            comment?: string;
            score: number;
        };
        RealtimeEvent: {
            /** Format: date-time */
            at: string;
            data: Record<string, never>;
            id: string;
            /** @enum {string} */
            type: "order.updated" | "receipt.issued" | "exit.check_recorded" | "exit.device_status" | "refund.updated" | "ticket.message" | "ticket.updated" | "alert.raised" | "live.counters" | "branch.status" | "catalogue.updated";
        };
        Receipt: {
            branchName: string;
            cardLast4?: string | null;
            exit: {
                qrPayload?: string | null;
                /** @enum {string} */
                status: "valid" | "used" | "expired" | "refunded";
                usedAt?: string | null;
                /** Format: date-time */
                validUntil: string;
            };
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            issuedAt: string;
            itemCount?: number;
            items: components["schemas"]["OrderItem"][];
            /** Format: uuid */
            orderId: string;
            paymentMethod: string;
            rating?: number | null;
            ratingPrompt?: boolean;
            receiptNumber: string;
            refund?: components["schemas"]["Refund"] | null;
            store: components["schemas"]["BrandTokens"];
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            totalKobo: number;
        };
        ReceiptListItem: {
            branchName: string;
            channel?: string;
            flagged?: boolean;
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            issuedAt: string;
            itemCount?: number;
            phoneMasked?: string | null;
            receiptNumber: string;
            /** @enum {string} */
            status: "created" | "pending" | "paid" | "failed" | "exited" | "refund_requested" | "awaiting_head_office" | "refunded" | "partially_refunded" | "disputed" | "chargeback_won" | "chargeback_lost";
            storeName: string;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            totalKobo: number;
        };
        ReceiptTrace: {
            disputes?: components["schemas"]["Dispute"][];
            exitChecks: components["schemas"]["ExitCheck"][];
            order: components["schemas"]["Order"];
            payment: {
                /**
                 * Format: int64
                 * @description Amount in kobo (₦1 = 100 kobo).
                 */
                amountKobo: number;
                cardBin?: string | null;
                cardLast4?: string | null;
                channel: string;
                paystackFeesKobo?: number | null;
                reference: string;
                /**
                 * Format: int64
                 * @description Amount in kobo (₦1 = 100 kobo).
                 */
                skipaFeeKobo?: number;
            };
            payout?: {
                /** Format: date */
                date: string;
                /**
                 * Format: int64
                 * @description Amount in kobo (₦1 = 100 kobo).
                 */
                payoutKobo: number;
            } | null;
            posPosting: {
                posReference?: string | null;
                postedAt?: string | null;
                status: string;
            };
            receipt: components["schemas"]["Receipt"];
            refund?: components["schemas"]["Refund"] | null;
            timeline: {
                actor: string;
                /** Format: date-time */
                at: string;
                label: string;
            }[];
        };
        Receivable: {
            balanceKobo: number;
            openItems?: number;
            /** Format: uuid */
            organisationId: string;
            storeName?: string;
        };
        ReconDay: {
            /** Format: date */
            date: string;
            payoutKobo: number | null;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            posSalesKobo: number;
            receipts: number;
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            salesKobo: number;
            /** @enum {string} */
            status: "matched" | "mismatch" | "awaiting_payout" | "resolved";
            unmatched: number;
        };
        ReconItem: {
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            amountKobo?: number;
            cause: string;
            detail: string;
            /** Format: uuid */
            id: string;
            liability?: ("store" | "skipa") | null;
            paystackOk: boolean;
            posOk: boolean;
            receiptOk: boolean;
            reference?: string;
            /** @enum {string} */
            status: "open" | "resolved";
            /** Format: uuid */
            subjectId: string;
            subjectType: string;
        };
        ReconResolve: {
            reason: string;
        };
        Refund: {
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            amountKobo: number;
            /** Format: date-time */
            createdAt: string;
            declineReason?: string | null;
            /** Format: uuid */
            id: string;
            needsHeadOffice?: boolean;
            note?: string | null;
            /** Format: uuid */
            orderId: string;
            paidAt?: string | null;
            paymentMethod?: ("cash" | "bank_transfer" | "card_reversal" | "other") | null;
            reason: string;
            receiptNumber?: string;
            recordedByName?: string | null;
            /** @enum {string} */
            status: "requested" | "awaiting_head_office" | "approved" | "declined" | "paid";
            ticketId?: string | null;
        };
        RefundDecision: {
            note?: string;
        };
        RefundDecline: {
            reason: string;
        };
        RefundPaymentRecord: {
            /** @enum {string} */
            method: "cash" | "bank_transfer" | "card_reversal" | "other";
            note?: string;
            /** Format: date-time */
            paidAt: string;
            /** @description Required for bank_transfer. */
            reference?: string;
        };
        RefundRequest: {
            /** Format: uuid */
            clientRequestId: string;
            /** Format: email */
            contactEmail?: string;
            note?: string;
            /** @enum {string} */
            reason: "charged_twice" | "wrong_price" | "item_missing" | "changed_mind" | "did_not_leave" | "other";
        };
        Report: {
            branchId?: string | null;
            /** @description Metric dictionary entries (AN-08). */
            definitions?: Record<string, never>;
            /** Format: date */
            from: string;
            report: string;
            series: {
                key: string;
                points: {
                    x: string;
                    y: number;
                }[];
            }[];
            /** Format: date */
            to: string;
            totals: Record<string, never>;
        };
        ReserveEntryCreate: {
            amountKobo: number;
            /** @enum {string} */
            entryType: "top_up" | "recovery_credit" | "adjustment";
            note: string;
        };
        ReserveSummary: {
            balanceKobo: number;
            entries: {
                amountKobo: number;
                /** Format: date-time */
                createdAt: string;
                entryType: string;
                /** Format: uuid */
                id: string;
                note: string;
            }[];
            /**
             * Format: int64
             * @description Amount in kobo (₦1 = 100 kobo).
             */
            lowWaterMarkKobo: number;
        };
        ServiceHealth: {
            detail?: string;
            service: string;
            /** @enum {string} */
            status: "ok" | "warn" | "bad";
        };
        Session: {
            /** Format: date-time */
            expiresAt: string;
            secondStepRequired?: boolean;
            /** @enum {string} */
            surface: "shopper" | "exit" | "store" | "admin";
            /** @description Opaque token. Web apps also receive it as an httpOnly cookie. */
            token: string;
        };
        SessionInfo: {
            /** Format: date-time */
            createdAt: string;
            current: boolean;
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            lastSeenAt: string;
            surface: string;
            userAgent?: string | null;
        };
        SettingsPatch: {
            reason: string;
            settings: components["schemas"]["BranchSettings"];
        };
        ShiftClose: {
            /** Format: uuid */
            branchId: string;
            byChannel: {
                /**
                 * Format: int64
                 * @description Amount in kobo (₦1 = 100 kobo).
                 */
                amountKobo: number;
                channel: string;
                count: number;
            }[];
            /** Format: date */
            date: string;
            itemsSold: number;
            refunds: {
                /**
                 * Format: int64
                 * @description Amount in kobo (₦1 = 100 kobo).
                 */
                amountKobo: number;
                count: number;
            };
            sales: {
                /**
                 * Format: int64
                 * @description Amount in kobo (₦1 = 100 kobo).
                 */
                amountKobo: number;
                count: number;
            };
        };
        ShiftSummary: {
            checks: number;
            clear?: number;
            flagged: number;
            invalid: number;
            medianPaymentToExitSeconds: number | null;
            mismatches: number;
            /** Format: date-time */
            startedAt: string;
        };
        ShopperAdmin: {
            /** Format: date-time */
            createdAt?: string;
            email?: string | null;
            /** Format: uuid */
            id: string;
            name?: string | null;
            phone?: string | null;
            phoneMasked: string;
            receipts: number;
            stars: number;
            /** @enum {string} */
            status: "active" | "suspended" | "deleted";
            storesVisited?: number;
        };
        ShopperForStore: {
            /** Format: date-time */
            lastVisitAt: string;
            name: string;
            phoneMasked?: string;
            shopperRef: string;
            stars: number;
            visits: number;
        };
        ShopperPatch: {
            /** @enum {string} */
            avatar?: "tomi" | "mimi" | "ata" | "lubo" | "sardi";
            email?: string | null;
            emailReceipts?: boolean;
            marketingConsent?: boolean;
            name?: string;
        };
        ShopperProfile: {
            /** @enum {string} */
            avatar: "tomi" | "mimi" | "ata" | "lubo" | "sardi";
            email?: string | null;
            emailReceipts: boolean;
            /** Format: uuid */
            id: string;
            marketingConsent?: boolean;
            name: string;
            phoneMasked: string;
            starsTotal: number;
        };
        ShopperRegistration: {
            claimGuestStars?: boolean;
            /** Format: email */
            email?: string;
            emailReceipts?: boolean;
            marketingConsent: boolean;
            name: string;
            privacyNoticeVersion: string;
            registrationToken: string;
        };
        ShoppingSession: {
            branch: components["schemas"]["BranchPublic"];
            catalogueVersion: number;
            exitWindowMinutes: number;
            limits: {
                maxItems: number;
                /**
                 * Format: int64
                 * @description Amount in kobo (₦1 = 100 kobo).
                 */
                maxValueKobo: number;
            };
            paymentChannels: ("card" | "bank_transfer" | "ussd")[];
            /** Format: uuid */
            sessionId: string;
            sessionTimeoutMinutes?: number;
            /** @enum {string} */
            status: "active" | "switched_off" | "payments_unavailable";
        };
        StaffInvite: {
            branchIds: string[];
            /** Format: email */
            email: string;
            name: string;
            /** @enum {string} */
            role: "exit_checker" | "store_manager" | "head_office_admin";
        };
        StaffMe: {
            branchIds: string[];
            email: string;
            /** Format: uuid */
            id: string;
            name: string;
            organisationId: string | null;
            permissions: string[];
            /** @enum {string} */
            plan?: "pilot" | "paid";
            /** @enum {string} */
            role: "exit_checker" | "store_manager" | "head_office_admin" | "super_admin" | "support_agent";
        };
        StaffMember: {
            activeSessions?: number;
            branchIds: string[];
            email: string;
            /** Format: uuid */
            id: string;
            invitedAt?: string | null;
            lastSignInAt?: string | null;
            name: string;
            /** @enum {string} */
            role: "exit_checker" | "store_manager" | "head_office_admin" | "super_admin" | "support_agent";
            /** @enum {string} */
            status: "pending" | "active" | "suspended" | "removed";
        };
        StaffPatch: {
            branchIds?: string[];
            reason: string;
            /** @enum {string} */
            role?: "exit_checker" | "store_manager" | "head_office_admin";
            /** @enum {string} */
            status?: "active" | "suspended";
        };
        StandardCategory: {
            active: boolean;
            /** @enum {string} */
            defaultCheckLevel: "standard" | "extra";
            description?: string;
            /** Format: uuid */
            id: string;
            key: string;
            name: string;
        };
        Stars: {
            byStore: {
                /** Format: uuid */
                organisationId: string;
                stars: number;
                storeName: string;
            }[];
            recent: {
                /** Format: date-time */
                createdAt: string;
                delta: number;
                reason: string;
                storeName: string;
            }[];
            total: number;
        };
        StartPayment: {
            /** @enum {string} */
            channel: "card" | "bank_transfer" | "ussd";
        };
        StoreRefundCreate: {
            note?: string;
            /** Format: uuid */
            orderId: string;
            /** @enum {string} */
            reason: "charged_twice" | "wrong_price" | "item_missing" | "changed_mind" | "did_not_leave" | "other";
        };
        StoreSearchResult: {
            area: string;
            /** Format: uuid */
            branchId: string;
            branchName: string;
            latitude?: number | null;
            logoUrl?: string | null;
            longitude?: number | null;
            openingHoursToday?: string;
            openNow?: boolean;
            /** Format: uuid */
            organisationId?: string;
            /** @enum {string} */
            skipaStatus: "on" | "off";
            storeName: string;
        };
        SubaccountCreate: {
            accountNumber: string;
            bankCode: string;
        };
        SuspendShopper: {
            reason: string;
        };
        SwitchOff: {
            reason: string;
        };
        Template: {
            active: boolean;
            body: string;
            /** @enum {string} */
            channel: "email" | "sms" | "telegram" | "in_app";
            key: string;
            subject?: string | null;
            version: number;
        };
        TemplateInput: {
            activate?: boolean;
            body: string;
            subject?: string;
        };
        Ticket: {
            /** Format: uuid */
            branchId: string;
            category: string;
            /** @description HP-08 snapshot (store view only). */
            context?: Record<string, never>;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            firstReplyDueAt?: string;
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            lastMessageAt?: string;
            orderId?: string | null;
            rating?: number | null;
            resolvedAt?: string | null;
            /** @enum {string} */
            status: "new" | "in_progress" | "waiting_for_shopper" | "resolved";
            storeName?: string;
            ticketNumber: string;
            unreadForShopper?: boolean;
        };
        TicketCreate: {
            /** Format: uuid */
            branchId: string;
            /** @enum {string} */
            category: "payment" | "refund" | "wrong_price" | "exit" | "app" | "other";
            chatTranscript?: {
                /** @enum {string} */
                from: "shopper" | "bot";
                text: string;
            }[];
            /** Format: uuid */
            clientRequestId: string;
            /**
             * Format: email
             * @description Optional (HP-09 v2).
             */
            guestEmail?: string;
            message: string;
            orderId?: string | null;
            recentRequestIds?: string[];
        };
        TicketMessage: {
            authorName?: string;
            /** @enum {string} */
            authorType: "shopper" | "store" | "skipa" | "bot" | "system";
            body: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: uuid */
            id: string;
            internalNote?: boolean;
        };
        TicketPatch: {
            /** @enum {string} */
            status: "in_progress" | "waiting_for_shopper" | "resolved";
        };
        TotpEnrollment: {
            otpauthUrl: string;
            secretBase32: string;
        };
        TotpVerify: {
            code: string;
        };
        TourProgress: {
            replay?: boolean;
            /** @enum {string} */
            status: "seen" | "skipped" | "completed";
            stepReached: number;
        };
        UnknownBarcodeBatch: {
            items: {
                barcode: string;
                /** Format: uuid */
                clientEventId: string;
                /** @enum {string} */
                reason: "not_found" | "category_off" | "till_only" | "price_stale" | "missing_weight";
                /** Format: date-time */
                scannedAt: string;
                typed: boolean;
            }[];
        };
        UploadedAsset: {
            /** Format: uuid */
            assetId: string;
            bytes: number;
            height?: number;
            url: string;
            width?: number;
        };
        UserAdmin: {
            activeSessions?: number;
            email: string;
            /** Format: uuid */
            id: string;
            lastSignInAt?: string | null;
            name: string;
            organisationName?: string | null;
            /** @enum {string} */
            role: "exit_checker" | "store_manager" | "head_office_admin" | "super_admin" | "support_agent";
            status: string;
        };
        ViewAsGrant: {
            /** Format: date-time */
            expiresAt: string;
            token: string;
        };
        ViewAsRequest: {
            branchId?: string | null;
            /** Format: uuid */
            organisationId: string;
            reason: string;
        };
        VisitedStore: {
            /** Format: uuid */
            lastBranchId?: string;
            /** Format: date-time */
            lastVisitAt: string;
            logoUrl?: string | null;
            /** Format: uuid */
            organisationId: string;
            storeName: string;
        };
        WeightEntry: {
            actualWeightGrams: number;
        };
        WeightResult: {
            deltaBps: number;
            requiresFullCheck: boolean;
            withinTolerance: boolean;
        };
    };
    responses: {
        /** @description Validation failed */
        E400: {
            headers: {
                "X-Request-Id": components["headers"]["RequestId"];
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "code": "SYS-400",
                 *         "message": "body/items/0/quantity must be >= 1",
                 *         "userMessage": "Something in that request wasn't right.",
                 *         "requestId": "91c0-44ad"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Not signed in or session expired */
        E401: {
            headers: {
                "X-Request-Id": components["headers"]["RequestId"];
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "code": "AUTH-001",
                 *         "message": "session expired",
                 *         "userMessage": "Please sign in again.",
                 *         "requestId": "91c0-44ad"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Not allowed for this role, branch or organisation */
        E403: {
            headers: {
                "X-Request-Id": components["headers"]["RequestId"];
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "code": "AUTH-005",
                 *         "message": "branch not assigned",
                 *         "userMessage": "You don't have access to this branch.",
                 *         "requestId": "91c0-44ad"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Not found */
        E404: {
            headers: {
                "X-Request-Id": components["headers"]["RequestId"];
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "code": "SYS-404",
                 *         "message": "not found",
                 *         "userMessage": "We couldn't find that.",
                 *         "requestId": "91c0-44ad"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Conflict: state changed, price changed, or idempotency key reused with a different body */
        E409: {
            headers: {
                "X-Request-Id": components["headers"]["RequestId"];
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "code": "CART-006",
                 *         "message": "prices changed",
                 *         "userMessage": "Some prices changed. Check your cart before paying.",
                 *         "requestId": "91c0-44ad"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Rate limited */
        E429: {
            headers: {
                "X-Request-Id": components["headers"]["RequestId"];
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "code": "AUTH-004",
                 *         "message": "too many attempts",
                 *         "userMessage": "Too many tries. Wait 15 minutes and try again.",
                 *         "requestId": "91c0-44ad"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description Unexpected error */
        E500: {
            headers: {
                "X-Request-Id": components["headers"]["RequestId"];
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "code": "SYS-500",
                 *         "message": "unexpected",
                 *         "userMessage": "Something went wrong on our side.",
                 *         "requestId": "91c0-44ad"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
    };
    parameters: {
        /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
        IdempotencyKey: string;
        /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
        RequestId: string;
    };
    requestBodies: never;
    headers: {
        /** @description Request ID (also in logs, errors and Paystack metadata). */
        RequestId: string;
    };
    pathItems: never;
};
export type $defs = Record<string, never>;
export interface operations {
    healthLive: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Health"];
                };
            };
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    healthReady: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Health"];
                };
            };
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listPlatformAlerts: {
        parameters: {
            query?: {
                cursor?: string;
                status?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageAlert"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    ackPlatformAlert: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                alertId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getPlatformReport: {
        parameters: {
            query?: {
                from?: string;
                to?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                report: "growth" | "engagement" | "conversion" | "revenue" | "product_health" | "store_comparison" | "skipa_home" | "loss";
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Report"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getAuditLog: {
        parameters: {
            query?: {
                action?: string;
                cursor?: string;
                from?: string;
                organisationId?: string;
                to?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageAuditEntry"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listBilling: {
        parameters: {
            query?: {
                /** @description YYYY-MM */
                month?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingStatement"][];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    adminSwitchBranch: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                branchId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PlatformSwitch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BranchPublic"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listAllBranding: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrandingVersion"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getReserve: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReserveSummary"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    addReserveEntry: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReserveEntryCreate"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReserveSummary"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listDisputes: {
        parameters: {
            query?: {
                cursor?: string;
                status?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageDispute"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    resubmitEvidence: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                disputeId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Dispute"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listErrors: {
        parameters: {
            query?: {
                from?: string;
                module?: string;
                organisationId?: string;
                release?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorSummary"][];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    createAdminExport: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExportCreate"];
            };
        };
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Export"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listPlatformFaqs: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Faq"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    createPlatformFaq: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FaqInput"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Faq"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    updatePlatformFaq: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                faqId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FaqInput"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Faq"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listFlags: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FeatureFlag"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    updateFlag: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                flagKey: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FeatureFlagPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FeatureFlag"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getServiceHealth: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ServiceHealth"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getLoyalty: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoyaltyRules"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    saveLoyalty: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoyaltyRules"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoyaltyRules"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getOrderTrace: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                orderId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReceiptTrace"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listOrganisations: {
        parameters: {
            query?: {
                cursor?: string;
                q?: string;
                status?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageOrganisation"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    createOrganisation: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OrganisationCreate"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Organisation"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getOrganisation: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                organisationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Organisation"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    updateOrganisation: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                organisationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OrganisationPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Organisation"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    createBranch: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                organisationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BranchCreate"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BranchPublic"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    resetBranding: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                organisationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SwitchOff"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrandingVersion"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getOnboarding: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                organisationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OnboardingChecklist"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    updateOnboardingStep: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                organisationId: string;
                stepKey: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OnboardingStepUpdate"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OnboardingChecklist"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    changePlan: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                organisationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PlanChange"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Organisation"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    configurePos: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                organisationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PosHealth"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    createSubaccount: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                organisationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SubaccountCreate"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Organisation"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getOverview: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LiveSnapshot"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    requestPersonalDataAccess: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PersonalDataAccessRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PersonalDataAccessGrant"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    platformSwitch: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PlatformSwitch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listReceivables: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Receivable"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listPlatformRecon: {
        parameters: {
            query?: {
                date?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReconDay"][];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getPlatformSettings: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlatformSettings"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    updatePlatformSettings: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PlatformSettings"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlatformSettings"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    searchShoppers: {
        parameters: {
            query?: {
                cursor?: string;
                phone?: string;
                receiptNumber?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageShopperAdmin"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getShopper: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                shopperId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShopperAdmin"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    suspendShopper: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                shopperId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SuspendShopper"];
            };
        };
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listStandardCategories: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StandardCategory"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    createStandardCategory: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StandardCategory"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StandardCategory"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listAllTickets: {
        parameters: {
            query?: {
                cursor?: string;
                escalated?: boolean;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageTicket"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listTemplates: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Template"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    saveTemplate: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                channel: string;
                templateKey: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TemplateInput"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Template"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listTransactions: {
        parameters: {
            query?: {
                cursor?: string;
                from?: string;
                organisationId?: string;
                q?: string;
                status?: string;
                to?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageReceiptListItem"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listUsers: {
        parameters: {
            query?: {
                cursor?: string;
                q?: string;
                role?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageUserAdmin"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    startViewAs: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ViewAsRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ViewAsGrant"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    handOver: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getInvite: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InviteInfo"];
                };
            };
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    requestOtp: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OtpRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OtpChallenge"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    verifyOtp: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OtpVerify"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Session"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    registerShopper: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ShopperRegistration"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Session"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    verifySecondStep: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TotpVerify"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Session"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    enrolSecondStep: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TotpEnrollment"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getSession: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StaffMe"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listMySessions: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionInfo"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    revokeMySession: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    signOut: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getBranchPublic: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                branchId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BranchPublic"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getCatalogue: {
        parameters: {
            query?: {
                /** @description Return 304 if unchanged */
                sinceVersion?: number;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                branchId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Catalogue"];
                };
            };
            /** @description Not modified (ETag / sinceVersion) */
            304: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    checkIn: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CheckInRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShoppingSession"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    registerDevice: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceRegistration"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Device"];
                };
            };
            400: components["responses"]["E400"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    ingestEvents: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EventBatch"];
            };
        };
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    completeCheck: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                checkId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExitComplete"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExitCheck"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    recordWeight: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                checkId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WeightEntry"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WeightResult"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    exitHeartbeat: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Heartbeat"];
            };
        };
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    exitLookup: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExitLookup"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExitDecision"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    shiftSummary: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShiftSummary"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listSuggestedFaqs: {
        parameters: {
            query?: {
                /** @description Omit for Skipa FAQs */
                branchId?: string;
                orderId?: string;
                screen?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Faq"][];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    matchFaq: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FaqMatchRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FaqMatch"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getMe: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShopperProfile"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    updateMe: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ShopperPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShopperProfile"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listDataRequests: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DataRequest"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    createDataRequest: {
        parameters: {
            query?: {
                /** @description export | delete */
                type?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DataRequest"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getNotificationPrefs: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationPreference"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    setNotificationPrefs: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NotificationPreference"][];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationPreference"][];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listMyReceipts: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
                /** @description Filter by store */
                organisationId?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageReceiptListItem"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getMyRefund: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                refundId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Refund"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getStars: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Stars"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listMyTickets: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageTicket"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listVisitedStores: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VisitedStore"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    sentryTunnel: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    createOrder: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateOrder"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Order"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getOrder: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                orderId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Order"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    startPayment: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                orderId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StartPayment"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentAttempt"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    nudgeVerify: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                orderId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Order"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    paymentReturn: {
        parameters: {
            query?: {
                /** @description Paystack reference */
                reference?: string;
                /** @description Paystack reference */
                trxref?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Redirect */
            302: {
                headers: {
                    Location?: string;
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getReceipt: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                receiptId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Receipt"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    emailReceipt: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                receiptId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailReceipt"];
            };
        };
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    rateVisit: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                receiptId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Rating"];
            };
        };
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    requestRefund: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                receiptId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefundRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Refund"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    syncCart: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CartSnapshot"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CartQuote"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    endSession: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    reportUnknownBarcodes: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UnknownBarcodeBatch"];
            };
        };
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getAdminAccessLog: {
        parameters: {
            query?: {
                cursor?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageAdminAccessEntry"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listStoreAlerts: {
        parameters: {
            query?: {
                cursor?: string;
                status?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageAlert"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    ackStoreAlert: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                alertId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getStoreReport: {
        parameters: {
            query?: {
                branchId?: string;
                from?: string;
                /** @description hour|day|week */
                granularity?: string;
                to?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                report: "traffic" | "funnel" | "sales" | "products" | "exit_loss" | "payments" | "shoppers" | "support";
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Report"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getStoreAuditLog: {
        parameters: {
            query?: {
                action?: string;
                cursor?: string;
                from?: string;
                to?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageAuditEntry"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    recordBaseline: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Baseline"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    toggleBranchCategory: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                branchId: string;
                categoryId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BranchCategoryToggle"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Category"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listQrCodes: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                branchId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["QrCode"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    createQrCode: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                branchId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QrCodeCreate"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["QrCode"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getBranchSettings: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                branchId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BranchSettings"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    updateBranchSettings: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                branchId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SettingsPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BranchSettings"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    switchOffBranch: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                branchId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SwitchOff"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BranchPublic"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    switchOnBranch: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                branchId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SwitchOff"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BranchPublic"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getBranding: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrandingVersion"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    uploadBrandAsset: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    file: string;
                    kind?: string;
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadedAsset"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    saveBrandingDraft: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BrandingDraft"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrandingVersion"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    publishBranding: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrandingVersion"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    restoreBranding: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                versionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrandingVersion"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listCategories: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Category"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    createCustomCategory: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CategoryCreate"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Category"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    updateCategory: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                categoryId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CategoryPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Category"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listStoreDataRequests: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DataRequest"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listStoreDisputes: {
        parameters: {
            query?: {
                cursor?: string;
                status?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageDispute"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listExitChecks: {
        parameters: {
            query?: {
                branchId?: string;
                checkerId?: string;
                cursor?: string;
                from?: string;
                result?: string;
                to?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageExitCheck"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listCheckerSignals: {
        parameters: {
            query?: {
                branchId?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CheckerSignal"][];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    createExport: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExportCreate"];
            };
        };
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Export"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getExport: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                exportId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Export"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listStoreFaqs: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Faq"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    createStoreFaq: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FaqInput"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Faq"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    updateStoreFaq: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                faqId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FaqInput"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Faq"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    deleteStoreFaq: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                faqId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getLive: {
        parameters: {
            query?: {
                /** @description Omit for all branches (head office) */
                branchId?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LiveSnapshot"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    recordLossCount: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LossCount"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getLossReport: {
        parameters: {
            query?: {
                weekStart?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Report"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getPayoutReport: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                date: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PayoutReport"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listPosFiles: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PosFile"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    uploadPosFile: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    file: string;
                    kind?: string;
                };
            };
        };
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PosFile"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    confirmPosFile: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getPosHealth: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PosHealth"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listProducts: {
        parameters: {
            query?: {
                categoryId?: string;
                cursor?: string;
                q?: string;
                readiness?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageProduct"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    updateProduct: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                productId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProductPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Product"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    importWeights: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    file: string;
                    kind?: string;
                };
            };
        };
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PosFile"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    qrSignPdf: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                qrCodeId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/pdf": string;
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listReceipts: {
        parameters: {
            query?: {
                branchId?: string;
                channel?: string;
                cursor?: string;
                /** @description date */
                from?: string;
                limit?: number;
                maxKobo?: number;
                minKobo?: number;
                /** @description Receipt number or last 4 of phone */
                q?: string;
                status?: string;
                /** @description date */
                to?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageReceiptListItem"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getReceiptTrace: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                receiptId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReceiptTrace"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listReconDays: {
        parameters: {
            query?: {
                branchId?: string;
                from?: string;
                to?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReconDay"][];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listReconItems: {
        parameters: {
            query?: {
                cursor?: string;
                date?: string;
                status?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageReconItem"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    resolveReconItem: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                itemId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReconResolve"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReconItem"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    retryPosting: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                itemId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listRefunds: {
        parameters: {
            query?: {
                branchId?: string;
                cursor?: string;
                status?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageRefund"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    createStoreRefund: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StoreRefundCreate"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Refund"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    approveRefund: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                refundId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefundDecision"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Refund"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    declineRefund: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                refundId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefundDecline"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Refund"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    recordRefundPayment: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                refundId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefundPaymentRecord"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Refund"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getShiftClose: {
        parameters: {
            query?: {
                /** @description required */
                branchId?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                date: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShiftClose"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listStoreShoppers: {
        parameters: {
            query?: {
                cursor?: string;
                starRange?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageShopperForStore"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listStaff: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StaffMember"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    removeStaff: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    updateStaff: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StaffPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StaffMember"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    cancelInvite: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    resendInvite: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    inviteStaff: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StaffInvite"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StaffMember"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listInbox: {
        parameters: {
            query?: {
                branchId?: string;
                cursor?: string;
                late?: boolean;
                status?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageTicket"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    getInboxTicket: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                ticketId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Ticket"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    updateTicket: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                ticketId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TicketPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Ticket"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    escalateTicket: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                ticketId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Ticket"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    searchStores: {
        parameters: {
            query?: {
                /** @description Max 50 */
                limit?: number;
                /** @description Name or area */
                q?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StoreSearchResult"][];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    stream: {
        parameters: {
            query?: {
                /** @description Comma list, e.g. order:<id>,branch:<id> */
                channels?: string;
                /** @description Resume */
                lastEventId?: string;
            };
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "text/event-stream": string;
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    createTicket: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TicketCreate"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Ticket"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    listTicketMessages: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                ticketId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TicketMessage"][];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    postTicketMessage: {
        parameters: {
            query?: never;
            header: {
                /** @description Required. Same key + same body within 24 h returns the original response (CS-03, PY-01). */
                "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                ticketId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MessageCreate"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TicketMessage"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    rateSupport: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                ticketId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Rating"];
            };
        };
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    saveTourProgress: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                tourKey: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TourProgress"];
            };
        };
        responses: {
            /** @description No content */
            204: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    paystackWebhook: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    posPush: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                connectorKey: string;
                organisationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    emailEvents: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    smsDeliveryReport: {
        parameters: {
            query?: never;
            header?: {
                /** @description Optional client-generated ID; the edge generates one if absent (ER-03). */
                "X-Request-Id"?: components["parameters"]["RequestId"];
            };
            path: {
                provider: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["RequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
}
