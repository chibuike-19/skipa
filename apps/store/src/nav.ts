// Sidebar sections (brief §6.3). Every href is a route; F0 shows a placeholder per section.
import type { SidebarItem } from '@skipa/ui';

import { en } from './i18n/en.ts';

export const HOME = '/live';

export const NAV: SidebarItem[] = [
  { href: '/live', label: en.nav.live, glyph: 'live' },
  { href: '/receipts', label: en.nav.receipts, glyph: 'receipt' },
  { href: '/exit-checks', label: en.nav.exitChecks, glyph: 'exit' },
  { href: '/refunds', label: en.nav.refunds, glyph: 'refund' },
  { href: '/support', label: en.nav.support, glyph: 'support' },
  { href: '/analytics', label: en.nav.analytics, glyph: 'chart' },
  { href: '/reconciliation', label: en.nav.reconciliation, glyph: 'check' },
  { href: '/catalogue', label: en.nav.catalogue, glyph: 'box' },
  { href: '/branding', label: en.nav.branding, glyph: 'edit' },
  { href: '/faqs', label: en.nav.faqs, glyph: 'help' },
  { href: '/shoppers', label: en.nav.shoppers, glyph: 'user' },
  { href: '/staff', label: en.nav.staff, glyph: 'lock' },
  { href: '/settings', label: en.nav.settings, glyph: 'settings' },
  { href: '/privacy', label: en.nav.privacy, glyph: 'eye' },
];
