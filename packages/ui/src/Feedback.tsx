// Feedback (canvas C-Feedback): toast, alert, banner in six tones. Toasts and banners are solid,
// alerts are tinted with a border. Error and warning use role="alert"; the rest role="status".
// Deviation: the canvas sets the body at 95% opacity; on the solid warning tone that is 4.38:1
// (white on amber-700), below WCAG AA. Full opacity is 4.67:1, so the body is not faded.
import type { ReactNode } from 'react';

import { cx } from './cx.ts';
import { Icon, type Glyph } from './Icon.tsx';

export type FeedbackKind = 'toast' | 'alert' | 'banner';
export type FeedbackTone = 'success' | 'pending' | 'warning' | 'error' | 'info' | 'neutral';

const GLYPH: Record<FeedbackTone, Glyph> = {
  success: 'check-circle',
  pending: 'clock',
  warning: 'alert',
  error: 'x-circle',
  info: 'info',
  neutral: 'info',
};

const SOLID: Record<FeedbackTone, string> = {
  success: 'bg-status-success text-status-on-success',
  pending: 'bg-status-pending text-status-on-pending',
  warning: 'bg-status-warning text-status-on-warning',
  error: 'bg-status-error text-status-on-error',
  info: 'bg-status-info text-status-on-info',
  neutral: 'bg-inverse text-inverse',
};

const TINT: Record<FeedbackTone, string> = {
  success: 'bg-status-success-bg text-status-success-text border border-status-success',
  pending: 'bg-status-pending-bg text-status-pending-text border border-status-pending',
  warning: 'bg-status-warning-bg text-status-warning-text border border-status-warning',
  error: 'bg-status-error-bg text-status-error-text border border-status-error',
  info: 'bg-status-info-bg text-status-info-text border border-status-info',
  neutral: 'bg-sunken text-primary',
};

export interface FeedbackProps {
  kind?: FeedbackKind;
  tone?: FeedbackTone;
  title: ReactNode;
  body?: ReactNode;
  /** Text action, e.g. "Undo" (toast), "Send a new code" (alert). */
  action?: { label: string; onClick: () => void };
  /** Alerts without an action can be dismissed. */
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
}

export function Feedback({
  kind = 'alert',
  tone = 'info',
  title,
  body,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  className,
}: FeedbackProps) {
  const solid = kind !== 'alert';
  return (
    <div
      role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
      className={cx(
        'sk flex items-start gap-3 font-ui',
        kind === 'banner' ? 'w-full py-3 pr-2 pl-4' : 'rounded-md py-3 pr-1 pl-[14px]',
        kind === 'toast' && 'shadow-2',
        solid ? SOLID[tone] : TINT[tone],
        className,
      )}
    >
      <Icon glyph={GLYPH[tone]} size={22} />
      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <span className="t-body-strong">{title}</span>
        {body !== undefined && <span className="t-caption">{body}</span>}
      </div>
      {action !== undefined && (
        <button
          type="button"
          onClick={action.onClick}
          className="h-[44px] flex-none rounded-pill border-0 bg-transparent px-3 font-ui text-[14px]/[20px] font-bold text-current underline underline-offset-3"
        >
          {action.label}
        </button>
      )}
      {action === undefined && onDismiss !== undefined && kind === 'alert' && (
        <button
          type="button"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className="flex size-[44px] flex-none items-center justify-center border-0 bg-transparent text-current"
        >
          <Icon glyph="close" size={20} />
        </button>
      )}
    </div>
  );
}
