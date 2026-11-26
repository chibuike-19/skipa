// Wordmark, Mark (hop spark) and Avatar (canvas Brand-Logo, Wordmark, Spark, Avatar).
// Logo colours default to Skipa's fixed tokens, so the logo never takes a store's colours.
import { AVATAR_ART } from './art/avatars.tsx';
import { SPARK, WORDMARK_HOP, WORDMARK_PATHS } from './art/wordmark.ts';
import { cx } from './cx.ts';

export interface WordmarkProps {
  /** px; width follows (2.29 × height). */
  height?: number;
  /** auto: small hop under 32 px, full hop from 32 px. */
  version?: 'auto' | 'full' | 'small' | 'classic';
  /** Letters. Default Skipa indigo; use var(--paper) on dark backgrounds. */
  fg?: string;
  /** The hop. Default Skipa ochre. */
  accent?: string;
  label?: string;
  className?: string;
}

export function Wordmark({
  height = 32,
  version = 'auto',
  fg = 'var(--color-skipa-primary)',
  accent = 'var(--color-skipa-accent)',
  label = 'Skipa',
  className,
}: WordmarkProps) {
  const v = version === 'auto' ? (height < 32 ? 'small' : 'full') : version;
  const width = Math.round(height * 2.29 * 10) / 10;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 56 2290 1000"
      role="img"
      aria-label={label}
      className={cx('flex-none', className)}
    >
      {WORDMARK_PATHS.map((d) => (
        <path key={d.slice(0, 12)} d={d} fill={fg} />
      ))}
      {WORDMARK_HOP[v].map(([cx_, cy, r]) => (
        <circle key={`${String(cx_)}-${String(cy)}`} cx={cx_} cy={cy} r={r} fill={accent} />
      ))}
    </svg>
  );
}

export interface MarkProps {
  /** px */
  size?: number;
  /** Tile colour, or 'none' for the dots alone. */
  tile?: string;
  accent?: string;
  label?: string;
  className?: string;
}

/** The hop spark: favicons, compact nav, anywhere the wordmark can't fit. */
export function Mark({
  size = 32,
  tile = 'var(--color-skipa-primary)',
  accent = 'var(--color-skipa-accent)',
  label = 'Skipa',
  className,
}: MarkProps) {
  const s = size > 24 ? SPARK.big : SPARK.tiny;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${String(s.box)} ${String(s.box)}`}
      role="img"
      aria-label={label}
      className={cx('flex-none', className)}
    >
      {tile !== 'none' && <rect width={s.box} height={s.box} rx={s.radius} fill={tile} />}
      {s.dots.map(([x, y, r]) => (
        <circle key={`${String(x)}-${String(y)}`} cx={x} cy={y} r={r} fill={accent} />
      ))}
    </svg>
  );
}

export const AVATARS = {
  tomi: { art: 'tomato', name: 'Tomi', what: 'tomato' },
  mimi: { art: 'carton', name: 'Mimi', what: 'milk carton' },
  ata: { art: 'pepper', name: 'Ata', what: 'scotch bonnet pepper' },
  lubo: { art: 'onion', name: 'Lubo', what: 'onion' },
  sardi: { art: 'tin', name: 'Sardi', what: 'sardine tin' },
} as const;

/** The contract's ShopperProfile.avatar values. */
export type AvatarId = keyof typeof AVATARS;

export interface AvatarProps {
  avatar: AvatarId;
  /** px */
  size?: number;
  selected?: boolean;
  /** Decorative when it sits beside the shopper's name. */
  decorative?: boolean;
  className?: string;
}

/** Shopper avatar (D-13). Under 48 px it zooms to the head so the face stays readable. */
export function Avatar({
  avatar,
  size = 56,
  selected = false,
  decorative = false,
  className,
}: AvatarProps) {
  const a = AVATARS[avatar];
  const radius = Math.round(size * 0.28);
  const zoom = size < 48;
  const big = zoom ? Math.round((size * 100) / 72) : size;
  const badge = Math.max(16, Math.round(size * 0.26));
  return (
    <span
      className={cx(
        'relative inline-block flex-none leading-none',
        selected && 'shadow-[0_0_0_3px_var(--white),0_0_0_6px_var(--color-skipa-primary)]',
        className,
      )}
      style={{ width: size, height: size, borderRadius: radius }}
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': `Avatar: ${a.name} the ${a.what}` })}
    >
      <span
        className="block overflow-hidden"
        style={{ width: size, height: size, borderRadius: radius }}
      >
        <svg
          viewBox="0 0 100 100"
          aria-hidden
          className="block"
          style={{
            width: big,
            height: big,
            marginLeft: zoom ? -Math.round(big * 0.14) : 0,
            marginTop: zoom ? -Math.round(big * 0.08) : 0,
          }}
        >
          {AVATAR_ART[a.art]}
        </svg>
      </span>
      {selected && (
        <span
          aria-hidden
          className="absolute flex items-center justify-center rounded-full border-2 border-(--white) bg-skipa-primary"
          style={{
            right: -Math.round(badge / 4),
            bottom: -Math.round(badge / 4),
            width: badge,
            height: badge,
          }}
        >
          <svg width="60%" height="60%" viewBox="0 0 24 24" className="block">
            <path
              d="M5 12.5 L10 17 L19 7.5"
              fill="none"
              className="stroke-(--white)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </span>
  );
}
