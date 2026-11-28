// Button (canvas 05 Components · Actions, C-Actions). Variants and sizes from the canvas source.
// `primary`, `secondary`, `tertiary` and `link` follow the store brand; `pay` is fixed Skipa indigo
// (BR-06); `destructive`, `success` and `inverse` never change with the store.
// Loading locks the button (aria-busy, disabled) so a double tap cannot send twice (PY-01).
// Colours the canvas takes from primitives (pay hover/pressed, pressed reds and greens, disabled
// sand) use those token variables; there is no semantic token for them in tokens.css v1.1.
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cx } from './cx.ts';
import { Icon, type Glyph } from './Icon.tsx';

export type ButtonVariant =
  'primary' | 'secondary' | 'tertiary' | 'destructive' | 'pay' | 'success' | 'inverse' | 'link';
export type ButtonSize = 'lg' | 'md' | 'sm';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  /** lg 56 · md 48 · sm 40 (desktop tables and toolbars only) */
  size?: ButtonSize;
  /** The visible label; for `iconOnly` it becomes the accessible name. */
  label: ReactNode;
  icon?: Glyph;
  iconRight?: Glyph;
  iconOnly?: boolean;
  full?: boolean;
  loading?: boolean;
  /** Shown while loading. Defaults: "Opening Paystack…" for pay, "Please wait…" otherwise. */
  loadingLabel?: string;
}

const SIZE: Record<ButtonSize, { h: string; text: string; pad: string; square: string }> = {
  lg: { h: 'h-[56px]', text: 'text-[17px]/[24px]', pad: 'px-5', square: 'w-[56px] min-w-[56px]' },
  md: { h: 'h-[48px]', text: 'text-[15px]/[22px]', pad: 'px-5', square: 'w-[48px] min-w-[48px]' },
  sm: { h: 'h-[40px]', text: 'text-[14px]/[20px]', pad: 'px-4', square: 'w-[40px] min-w-[40px]' },
};

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-pressed text-brand-on-primary',
  pay: 'bg-skipa-primary hover:bg-(--indigo-900) active:bg-(--indigo-950) text-skipa-on-primary active:scale-[0.98]',
  secondary:
    'bg-surface hover:bg-brand-primary-subtle active:bg-brand-primary-subtle text-brand-primary-text border-[1.5px] border-brand-primary-text',
  tertiary:
    'bg-transparent hover:bg-brand-primary-subtle active:bg-brand-primary-subtle text-brand-primary-text',
  link: 'bg-transparent text-link underline underline-offset-3 rounded-xs',
  destructive:
    'bg-status-error hover:bg-status-error-hover active:bg-(--red-900) text-status-on-error',
  success:
    'bg-status-success hover:bg-status-success-hover active:bg-(--green-800) text-status-on-success',
  inverse: 'bg-surface hover:bg-sunken active:bg-(--sand-200) text-primary',
};

const DISABLED: Record<ButtonVariant, string> = {
  primary: 'disabled:bg-(--sand-200)',
  pay: 'disabled:bg-(--sand-200)',
  secondary: 'disabled:bg-(--sand-200) disabled:border-(--sand-300)',
  tertiary: 'disabled:bg-transparent',
  link: 'disabled:bg-transparent',
  destructive: 'disabled:bg-(--sand-200)',
  success: 'disabled:bg-(--sand-200)',
  inverse: 'disabled:bg-(--sand-200)',
};

function Spinner() {
  return (
    <svg
      className="sk-spin"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 3a9 9 0 1 1-9 9" />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'lg',
    label,
    icon,
    iconRight,
    iconOnly = false,
    full = false,
    loading = false,
    loadingLabel,
    disabled,
    className,
    type = 'button',
    ...rest
  },
  ref,
) {
  const s = SIZE[size];
  const shown = loading
    ? (loadingLabel ?? (variant === 'pay' ? 'Opening Paystack…' : 'Please wait…'))
    : label;
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled === true || loading}
      aria-busy={loading}
      aria-label={iconOnly && typeof label === 'string' ? label : undefined}
      className={cx(
        'sk inline-flex items-center justify-center gap-2 font-ui transition-[background-color,transform] duration-fast ease-standard',
        'cursor-pointer disabled:cursor-not-allowed disabled:text-disabled',
        s.h,
        s.text,
        variant === 'link'
          ? 'px-1 font-semibold'
          : cx('rounded-pill font-bold', iconOnly ? cx(s.square, 'p-0') : s.pad),
        !iconOnly && 'min-w-[48px]',
        full && 'flex w-full',
        VARIANT[variant],
        DISABLED[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Spinner />}
      {!loading && icon !== undefined && <Icon glyph={icon} size={iconOnly ? 24 : 20} />}
      {!iconOnly && <span className="whitespace-nowrap">{shown}</span>}
      {!loading && !iconOnly && iconRight !== undefined && <Icon glyph={iconRight} size={20} />}
    </button>
  );
});
