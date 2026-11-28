// NavBits (canvas C-Dashboard · NavBits): tabs, segmented control, breadcrumbs, pagination.
// The canvas draws them alike; the code picks the right semantics for each use:
//   Tabs      switch panels on one page (Radix Tabs: tablist + tabpanels, arrow keys)
//   NavTabs   the same look for links to other routes (e.g. /analytics/:report), aria-current
//   Segmented a single choice such as a date range (Radix RadioGroup)
import * as RadixRadio from '@radix-ui/react-radio-group';
import * as RadixTabs from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';

import { cx } from './cx.ts';
import { Icon } from './Icon.tsx';
import { defaultLink, type RenderLink } from './link.tsx';

export interface TabItem {
  value: string;
  label: string;
  /** Needs-action count, shown in red. */
  count?: number;
}

const TAB =
  '-mb-px inline-flex h-[44px] items-center gap-[6px] border-0 border-b-[3px] border-transparent bg-transparent px-[14px] text-[14px]/[20px] whitespace-nowrap no-underline outline-none focus-visible:shadow-focus font-medium text-secondary';
const TAB_ON = 'border-brand-primary font-bold text-primary';

function Count({ count }: { count?: number }) {
  return count !== undefined && count > 0 ? (
    <span className="rounded-[9px] bg-status-error px-[6px] text-[11px]/[18px] font-bold text-status-on-error">
      {count}
    </span>
  ) : null;
}

export interface TabsProps {
  label: string;
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** The active panel's content. */
  children: ReactNode;
  className?: string;
}

export function Tabs({ label, items, value, onValueChange, children, className }: TabsProps) {
  return (
    <RadixTabs.Root
      value={value}
      onValueChange={onValueChange}
      className={cx('sk flex flex-col gap-4 font-ui', className)}
    >
      <RadixTabs.List
        aria-label={label}
        className="flex gap-1 overflow-x-auto border-b border-default"
      >
        {items.map((t) => (
          <RadixTabs.Trigger
            key={t.value}
            value={t.value}
            className={cx(
              TAB,
              'data-[state=active]:border-brand-primary data-[state=active]:font-bold data-[state=active]:text-primary',
            )}
          >
            {t.label}
            <Count count={t.count} />
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((t) => (
        <RadixTabs.Content
          key={t.value}
          value={t.value}
          className="outline-none focus-visible:shadow-focus"
        >
          {t.value === value ? children : null}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}

export interface NavTabItem extends TabItem {
  href: string;
}

export function NavTabs({
  label,
  items,
  currentHref,
  renderLink = defaultLink,
  className,
}: {
  label: string;
  items: NavTabItem[];
  currentHref: string;
  renderLink?: RenderLink;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cx('sk flex gap-1 overflow-x-auto border-b border-default font-ui', className)}
    >
      {items.map((t) => {
        const on = t.href === currentHref;
        return (
          <span key={t.href} className="flex">
            {renderLink({
              href: t.href,
              'aria-current': on ? 'page' : undefined,
              className: cx(TAB, on && TAB_ON),
              children: (
                <>
                  {t.label}
                  <Count count={t.count} />
                </>
              ),
            })}
          </span>
        );
      })}
    </nav>
  );
}

export interface SegmentedProps {
  label: string;
  items: { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function Segmented({ label, items, value, onValueChange, className }: SegmentedProps) {
  return (
    <RadixRadio.Root
      aria-label={label}
      value={value}
      onValueChange={onValueChange}
      orientation="horizontal"
      className={cx('sk inline-flex gap-1 rounded-md bg-sunken p-1 font-ui', className)}
    >
      {items.map((s) => (
        <RadixRadio.Item
          key={s.value}
          value={s.value}
          className={cx(
            'h-[36px] rounded-sm border-0 bg-transparent px-[14px] text-[13px]/[18px] font-medium text-primary outline-none focus-visible:shadow-focus',
            'data-[state=checked]:bg-surface data-[state=checked]:font-bold data-[state=checked]:shadow-1',
          )}
        >
          {s.label}
        </RadixRadio.Item>
      ))}
    </RadixRadio.Root>
  );
}

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  label = 'Breadcrumb',
  renderLink = defaultLink,
  className,
}: {
  items: Crumb[];
  label?: string;
  renderLink?: RenderLink;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cx('sk font-ui', className)}>
      <ol className="t-d-body m-0 flex list-none items-center gap-[6px] p-0">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${String(i)}`} className="flex items-center gap-[6px]">
              {last || c.href === undefined ? (
                <span
                  aria-current={last ? 'page' : undefined}
                  className={cx(last && 'font-semibold')}
                >
                  {c.label}
                </span>
              ) : (
                renderLink({
                  href: c.href,
                  className: 'text-link underline-offset-3',
                  children: c.label,
                })
              )}
              {!last && <Icon glyph="chevron-right" size={16} className="text-muted" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  /** e.g. "Showing 1–12 of 41 receipts" */
  summary: string;
  labels?: { nav?: string; previous?: string; next?: string; page?: (n: number) => string };
  className?: string;
}

export function Pagination({
  page,
  pageCount,
  onPage,
  summary,
  labels = {},
  className,
}: PaginationProps) {
  const start = Math.max(1, Math.min(page - 3, pageCount - 6));
  const pages = Array.from({ length: Math.min(pageCount, 7) }, (_, i) => start + i);
  const btn =
    'h-[40px] min-w-[40px] rounded-sm px-2 text-[14px]/[20px] font-semibold outline-none focus-visible:shadow-focus disabled:text-disabled';
  return (
    <nav
      aria-label={labels.nav ?? 'Pagination'}
      className={cx('sk flex items-center gap-4 font-ui', className)}
    >
      <span className="t-d-body text-secondary">{summary}</span>
      <div className="flex gap-1">
        <button
          type="button"
          aria-label={labels.previous ?? 'Previous page'}
          disabled={page <= 1}
          onClick={() => {
            onPage(page - 1);
          }}
          className={cx(btn, 'border border-default bg-surface text-primary')}
        >
          ‹
        </button>
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            aria-label={labels.page?.(n) ?? `Page ${String(n)}`}
            aria-current={n === page ? 'page' : undefined}
            onClick={() => {
              onPage(n);
            }}
            className={cx(
              btn,
              n === page
                ? 'border-0 bg-(--indigo-700) text-(--white)'
                : 'border border-default bg-surface text-primary',
            )}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          aria-label={labels.next ?? 'Next page'}
          disabled={page >= pageCount}
          onClick={() => {
            onPage(page + 1);
          }}
          className={cx(btn, 'border border-default bg-surface text-primary')}
        >
          ›
        </button>
      </div>
    </nav>
  );
}
