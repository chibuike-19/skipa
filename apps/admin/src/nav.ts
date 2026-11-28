// Sidebar sections (brief §6.4). Every href is a route; F0 shows a placeholder per section.
import type { SidebarItem } from '@skipa/ui';

import { en } from './i18n/en.ts';

export const HOME = '/';

export const NAV: SidebarItem[] = [
  { href: '/', label: en.nav.overview, glyph: 'home' },
  { href: '/stores', label: en.nav.stores, glyph: 'store' },
  { href: '/shoppers', label: en.nav.shoppers, glyph: 'user' },
  { href: '/transactions', label: en.nav.transactions, glyph: 'card' },
  { href: '/disputes', label: en.nav.disputes, glyph: 'flag' },
  { href: '/reconciliation', label: en.nav.reconciliation, glyph: 'check' },
  { href: '/billing', label: en.nav.billing, glyph: 'tag' },
  { href: '/loss', label: en.nav.loss, glyph: 'scale' },
  { href: '/analytics', label: en.nav.analytics, glyph: 'chart' },
  { href: '/errors', label: en.nav.errors, glyph: 'info' },
  { href: '/support', label: en.nav.support, glyph: 'support' },
  { href: '/alerts', label: en.nav.alerts, glyph: 'alert' },
  { href: '/config', label: en.nav.config, glyph: 'settings' },
  { href: '/users', label: en.nav.users, glyph: 'lock' },
  { href: '/audit', label: en.nav.audit, glyph: 'eye' },
  { href: '/branding', label: en.nav.branding, glyph: 'edit' },
  { href: '/loyalty', label: en.nav.loyalty, glyph: 'star' },
];
