// Conventional Commits (AD §5.3). PRs are squash-merged, so CI lints the PR title.
// Scopes: backend modules and packages, the frontend's apps and packages, and repo-wide areas.
import { RuleConfigSeverity } from '@commitlint/types';

const scopes = [
  // apps and packages
  'api',
  'worker',
  'shopper',
  'exit',
  'store',
  'admin',
  'contracts',
  'domain',
  'api-client',
  'tokens',
  'ui',
  'mocks',
  'analytics',
  'config',
  // backend modules (AD §6.1)
  'identity',
  'tenancy',
  'catalogue',
  'shopping',
  'payments',
  'receipts',
  'refunds',
  'disputes',
  'pos',
  'recon',
  'notifications',
  'support',
  'stars',
  'branding',
  'audit',
  'privacy',
  'exports',
  'monitoring',
  'tours',
  // repo-wide
  'db',
  'infra',
  'ci',
  'deps',
  'docs',
  'e2e',
  'repo',
  'release',
];

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [RuleConfigSeverity.Error, 'always', scopes],
    'header-max-length': [RuleConfigSeverity.Error, 'always', 100],
  },
};

export default config;
