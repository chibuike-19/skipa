// Loading (canvas C-Feedback): progress bar, step bar, spinner, skeleton rows and table.
// Skeletons shimmer (sk-skeleton) and stop with reduced motion.
import { useId, type ReactNode } from 'react';

import { cx } from './cx.ts';

export interface ProgressBarProps {
  /** 0–100 */
  value: number;
  label: ReactNode;
  caption?: ReactNode;
  className?: string;
}

export function ProgressBar({ value, label, caption, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const id = useId();
  return (
    <div className={cx('sk flex flex-col gap-3 font-ui text-primary', className)}>
      <div className="flex justify-between">
        <span id={id} className="t-label">
          {label}
        </span>
        <span className="t-label [font-variant-numeric:tabular-nums]">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-labelledby={id}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-[8px] overflow-hidden rounded-[4px] bg-(--sand-200)"
      >
        <span
          className="block h-full rounded-[4px] bg-brand-primary"
          style={{ width: `${String(pct)}%` }}
        />
      </div>
      {caption !== undefined && <span className="t-caption text-muted">{caption}</span>}
    </div>
  );
}

export interface StepBarProps {
  /** Accessible name, e.g. "Registration progress". */
  label: string;
  step: number;
  total?: number;
  /** e.g. "Step 2 of 3 · Check your phone" */
  caption: ReactNode;
  className?: string;
}

export function StepBar({ label, step, total = 3, caption, className }: StepBarProps) {
  return (
    <div className={cx('sk flex flex-col gap-3 font-ui', className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuetext={typeof caption === 'string' ? caption : undefined}
        className="grid gap-[6px]"
        style={{ gridTemplateColumns: `repeat(${String(total)}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cx(
              'h-[6px] rounded-[3px]',
              i < step ? 'bg-brand-primary' : 'bg-(--sand-300)',
            )}
          />
        ))}
      </div>
      <span className="t-caption text-secondary">{caption}</span>
    </div>
  );
}

export function Spinner({
  label,
  size = 28,
  className,
}: {
  label: ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <div role="status" className={cx('sk flex items-center gap-3 font-ui', className)}>
      <svg
        className="sk-spin"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" className="stroke-(--sand-200)" />
        <path d="M12 3a9 9 0 0 1 9 9" className="stroke-brand-primary" />
      </svg>
      <span className="t-body-strong">{label}</span>
    </div>
  );
}

const WIDTHS = ['60%', '45%', '70%', '55%', '65%'];

export function SkeletonRows({
  rows = 3,
  label,
  className,
}: {
  rows?: number;
  label: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('sk flex flex-col gap-3 font-ui', className)}>
      <div aria-hidden className="flex flex-col gap-2">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex flex-col gap-[10px] rounded-lg bg-surface px-4 py-[14px]">
            <div className="flex justify-between gap-5">
              <span
                className="sk-skeleton h-[16px] rounded-[4px]"
                style={{ width: WIDTHS[i % WIDTHS.length] }}
              />
              <span className="sk-skeleton h-[16px] w-[64px] rounded-[4px]" />
            </div>
            <div className="flex justify-between">
              <span className="sk-skeleton h-[12px] w-[72px] rounded-[4px]" />
              <span className="sk-skeleton h-[40px] w-[120px] rounded-[20px]" />
            </div>
          </div>
        ))}
      </div>
      <span role="status" className="t-caption text-muted">
        {label}
      </span>
    </div>
  );
}

export function SkeletonTable({
  rows = 3,
  label,
  className,
}: {
  rows?: number;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cx('sk flex flex-col overflow-hidden rounded-md bg-surface', className)}
    >
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          aria-hidden
          className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-5 border-b border-subtle p-4"
        >
          <span
            className="sk-skeleton h-[14px] rounded-[4px]"
            style={{ width: WIDTHS[i % WIDTHS.length] }}
          />
          <span className="sk-skeleton h-[14px] rounded-[4px]" />
          <span className="sk-skeleton h-[14px] rounded-[4px]" />
          <span className="sk-skeleton h-[20px] w-[80px] rounded-[10px]" />
        </div>
      ))}
    </div>
  );
}
