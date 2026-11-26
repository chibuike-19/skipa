// DashNav (canvas C-Dashboard · DashNav): sidebar (store and super admin; full 248 px or compact
// 72 px), top bar (branch switcher, live status, alerts, user) and branch menu. Fixed Skipa indigo:
// dashboards are never store-branded. Items and labels come from the app (its i18n/en.ts).
import type { ReactNode } from 'react';

import { Mark, Wordmark } from './Brand.tsx';
import { cx } from './cx.ts';
import { Icon, type Glyph } from './Icon.tsx';
import { defaultLink, type RenderLink } from './link.tsx';
import { StatusChip } from './StatusChip.tsx';

export interface SidebarItem {
  href: string;
  label: string;
  glyph: Glyph;
  /** Things needing action; `urgent` shows red. */
  count?: number;
  urgent?: boolean;
}

export interface SidebarProps {
  /** Accessible name, e.g. "Store dashboard". */
  label: string;
  /** Under the wordmark, e.g. "for Adunni Mart" or "Super admin". */
  product: string;
  items: SidebarItem[];
  currentHref: string;
  compact?: boolean;
  renderLink?: RenderLink;
  className?: string;
}

export function Sidebar({
  label,
  product,
  items,
  currentHref,
  compact = false,
  renderLink = defaultLink,
  className,
}: SidebarProps) {
  return (
    <nav
      aria-label={label}
      className={cx(
        'sk flex h-full flex-col gap-[2px] bg-(--indigo-700) px-3 py-5 font-ui text-(--white)',
        compact ? 'w-[72px]' : 'w-[248px]',
        className,
      )}
    >
      {compact ? (
        <div className="flex justify-center pt-1 pb-5">
          <Mark size={32} />
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 pt-1 pb-5">
          <Wordmark height={30} fg="var(--paper)" />
          <span className="t-d-caption pt-[6px] text-(--color-on-dark-muted)">{product}</span>
        </div>
      )}
      {items.map((i) => {
        const on = i.href === currentHref;
        return (
          <span key={i.href} className="relative flex">
            {renderLink({
              href: i.href,
              'aria-current': on ? 'page' : undefined,
              title: compact ? i.label : undefined,
              className: cx(
                'relative flex h-[44px] flex-1 items-center gap-3 rounded-md px-3 text-[14px]/[20px] no-underline outline-none focus-visible:shadow-focus',
                compact ? 'justify-center' : 'justify-start',
                on
                  ? 'bg-(--ochre-500) font-bold text-(--ink)'
                  : 'font-medium text-(--white) hover:bg-[color-mix(in_srgb,var(--white)_10%,transparent)]',
              ),
              children: (
                <>
                  <Icon glyph={i.glyph} size={20} />
                  <span className={compact ? 'sr-only' : 'flex-1 whitespace-nowrap'}>
                    {i.label}
                  </span>
                  {i.count !== undefined && i.count > 0 && (
                    <span
                      className={cx(
                        'min-w-[22px] rounded-[11px] px-[6px] text-center text-[12px]/[22px] font-bold',
                        compact && 'absolute top-[2px] right-1 scale-[0.85]',
                        i.urgent === true
                          ? 'bg-status-error text-status-on-error'
                          : on
                            ? 'bg-(--ink) text-(--white)'
                            : 'bg-(--white) text-(--indigo-700)',
                      )}
                    >
                      {i.count}
                    </span>
                  )}
                </>
              ),
            })}
          </span>
        );
      })}
    </nav>
  );
}

export type BranchLiveStatus = 'live' | 'paused' | 'offline' | 'onboarding';

export interface TopBarProps {
  branch: { name: string; onOpen: () => void; open: boolean };
  status: BranchLiveStatus;
  /** e.g. "Live · updated 3 s ago" */
  updated: ReactNode;
  alerts: { count: number; label: string; onOpen: () => void };
  user: { name: string; role: string; onOpen?: () => void };
  className?: string;
}

const DOT: Record<BranchLiveStatus, string> = {
  live: 'bg-status-success',
  paused: 'bg-status-warning',
  offline: 'bg-status-error',
  onboarding: 'bg-status-info',
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function TopBar({ branch, status, updated, alerts, user, className }: TopBarProps) {
  return (
    <header
      className={cx(
        'sk flex h-[64px] items-center gap-4 border-b border-subtle bg-surface px-5 font-ui text-primary',
        className,
      )}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={branch.open}
        onClick={branch.onOpen}
        className="inline-flex h-[44px] items-center gap-[10px] rounded-md border-[1.5px] border-default bg-surface px-3 text-[14px]/[20px] font-semibold text-primary"
      >
        <Icon glyph="store" size={20} />
        {branch.name}
        <Icon glyph="chevron-down" size={18} />
      </button>
      <StatusChip status={status === 'paused' ? 'paused' : status} />
      <span className="flex-1" />
      <span className="t-d-caption inline-flex items-center gap-[6px] whitespace-nowrap text-muted">
        <span className={cx('size-[8px] rounded-full', DOT[status])} />
        {updated}
      </span>
      <button
        type="button"
        aria-label={alerts.label}
        onClick={alerts.onOpen}
        className="relative flex size-[44px] items-center justify-center rounded-full border-0 bg-transparent text-primary"
      >
        <Icon glyph="alert" size={22} />
        {alerts.count > 0 && (
          <span className="absolute top-[6px] right-[6px] h-[18px] min-w-[18px] rounded-[9px] bg-status-error px-1 text-center text-[11px]/[18px] font-bold text-status-on-error">
            {alerts.count}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={user.onOpen}
        className="inline-flex items-center gap-[10px] border-0 bg-transparent p-0 text-left text-primary"
      >
        <span className="flex size-[36px] items-center justify-center rounded-full bg-(--indigo-100) text-[13px] font-bold leading-none text-(--indigo-700)">
          {initials(user.name)}
        </span>
        <span className="hidden flex-col lg:flex">
          <span className="t-d-label">{user.name}</span>
          <span className="t-d-caption text-muted">{user.role}</span>
        </span>
      </button>
    </header>
  );
}

export interface BranchOption {
  id: string;
  name: string;
  detail?: string;
}

export interface BranchMenuProps {
  label: string;
  options: BranchOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function BranchMenu({ label, options, selectedId, onSelect, className }: BranchMenuProps) {
  return (
    <div
      role="listbox"
      aria-label={label}
      className={cx(
        'sk w-[280px] rounded-md bg-surface p-2 font-ui text-primary shadow-4',
        className,
      )}
    >
      {options.map((o) => {
        const on = o.id === selectedId;
        return (
          <div
            key={o.id}
            role="option"
            aria-selected={on}
            tabIndex={0}
            onClick={() => {
              onSelect(o.id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(o.id);
              }
            }}
            className={cx(
              'flex min-h-[52px] cursor-pointer items-center gap-3 rounded-sm px-3 py-2 outline-none focus-visible:shadow-focus',
              on ? 'bg-(--indigo-100)' : 'hover:bg-sunken',
            )}
          >
            <span className="flex flex-1 flex-col">
              <span className="t-d-label">{o.name}</span>
              {o.detail !== undefined && <span className="t-d-caption text-muted">{o.detail}</span>}
            </span>
            {on && <Icon glyph="check" size={18} />}
          </div>
        );
      })}
    </div>
  );
}
