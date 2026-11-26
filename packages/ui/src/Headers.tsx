// SkipaHeader and StoreHeader (canvas C-Shopper). Skipa-wide screens wear Skipa's header (BR-11,
// D-13); store screens wear the store brand, and the pay variant keeps the store logo on a plain
// header while everything below stays in Skipa's fixed design (Q05, BR-06).
import type { ReactNode } from 'react';

import { Avatar, Wordmark, type AvatarId } from './Brand.tsx';
import { cx } from './cx.ts';
import { Icon } from './Icon.tsx';

interface HeaderButtonsCopy {
  back?: string;
  help?: string;
  profile?: string;
}

const iconButton =
  'flex size-[48px] items-center justify-center border-0 bg-transparent text-current';
const helpButton =
  'inline-flex h-[48px] flex-none items-center gap-[6px] rounded-pill border-0 bg-transparent px-3 font-ui text-[14px]/[20px] font-semibold';

export interface SkipaHeaderProps {
  /** Screen title; without one the wordmark shows. */
  title?: ReactNode;
  onBack?: () => void;
  onHelp?: () => void;
  /** Registered shoppers: their avatar opens Profile. */
  avatar?: { id: AvatarId; onClick: () => void };
  copy?: HeaderButtonsCopy;
  className?: string;
}

export function SkipaHeader({
  title,
  onBack,
  onHelp,
  avatar,
  copy = {},
  className,
}: SkipaHeaderProps) {
  return (
    <header
      className={cx(
        'sk flex h-[64px] items-center justify-between gap-2 border-b border-subtle bg-surface pr-2 font-ui text-primary',
        onBack === undefined ? 'pl-4' : 'pl-0',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {onBack !== undefined && (
          <button
            type="button"
            aria-label={copy.back ?? 'Back'}
            onClick={onBack}
            className={iconButton}
          >
            <Icon glyph="arrow-left" size={24} />
          </button>
        )}
        {title !== undefined ? (
          <h1 className="t-h3 m-0 truncate">{title}</h1>
        ) : (
          <Wordmark height={30} />
        )}
      </div>
      {onHelp !== undefined && (
        <button type="button" onClick={onHelp} className={cx(helpButton, 'text-skipa-primary')}>
          <Icon glyph="help" size={20} />
          {copy.help ?? 'Need help?'}
        </button>
      )}
      {avatar !== undefined && (
        <button
          type="button"
          aria-label={copy.profile ?? 'Your profile'}
          onClick={avatar.onClick}
          className={iconButton}
        >
          <Avatar avatar={avatar.id} size={36} decorative />
        </button>
      )}
    </header>
  );
}

export interface StoreHeaderProps {
  /** BrandTokens.displayName */
  storeName: string;
  /** BrandTokens.logoWideUrl (on the brand colour) or null for the text fallback. */
  logoUrl?: string | null;
  /** brand: store colour header. pay: plain header on the Pay screens (Q05). */
  variant?: 'brand' | 'pay';
  branch?: string;
  onBack?: () => void;
  onHelp?: () => void;
  /** Registered shoppers who visited more than one store (D-14). */
  onSwitchStore?: () => void;
  copy?: HeaderButtonsCopy & { switchStore?: string };
  className?: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function StoreHeader({
  storeName,
  logoUrl,
  variant = 'brand',
  branch,
  onBack,
  onHelp,
  onSwitchStore,
  copy = {},
  className,
}: StoreHeaderProps) {
  const pay = variant === 'pay';
  return (
    <header
      className={cx(
        'sk flex h-[64px] items-center justify-between gap-2 pr-2 font-ui',
        pay
          ? 'border-b border-subtle bg-surface text-primary'
          : 'bg-brand-primary text-brand-on-primary',
        onBack === undefined ? 'pl-4' : 'pl-0',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-[10px] overflow-hidden">
        {onBack !== undefined && (
          <button
            type="button"
            aria-label={copy.back ?? 'Back'}
            onClick={onBack}
            className={iconButton}
          >
            <Icon glyph="arrow-left" size={24} />
          </button>
        )}
        {logoUrl !== undefined && logoUrl !== null ? (
          <img
            src={logoUrl}
            alt={storeName}
            className="max-w-[160px] shrink-0 object-contain object-left"
            style={{ height: onBack === undefined ? 30 : 26 }}
          />
        ) : (
          <>
            <span
              aria-hidden
              className={cx(
                'flex size-[36px] flex-none items-center justify-center rounded-sm font-display text-[18px] font-extrabold leading-none',
                pay
                  ? 'bg-skipa-primary text-skipa-on-primary'
                  : 'bg-brand-on-primary text-brand-primary',
              )}
            >
              {initials(storeName)}
            </span>
            <span className="t-body-strong min-w-0 truncate">{storeName}</span>
          </>
        )}
        {onSwitchStore !== undefined && (
          <button
            type="button"
            aria-label={copy.switchStore ?? 'Switch store'}
            onClick={onSwitchStore}
            className="flex size-[48px] flex-none items-center justify-center rounded-full border-0 bg-transparent text-current outline-none focus-visible:shadow-focus"
          >
            <span className="flex size-[32px] items-center justify-center rounded-full bg-[color-mix(in_srgb,currentColor_18%,transparent)]">
              <Icon glyph="chevron-down" size={18} />
            </span>
          </button>
        )}
        {branch !== undefined && (
          <span className="t-micro min-w-0 truncate rounded-pill border border-current px-2 py-[2px] opacity-95">
            {branch}
          </span>
        )}
      </div>
      {onHelp !== undefined && (
        <button type="button" onClick={onHelp} className={cx(helpButton, 'text-current')}>
          <Icon glyph="help" size={20} />
          {copy.help ?? 'Need help?'}
        </button>
      )}
    </header>
  );
}
