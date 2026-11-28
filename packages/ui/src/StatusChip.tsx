// StatusChip (canvas C-Feedback, C-Rules). Every status has a fixed icon and word: colour is never
// the only signal and status never takes the store's colour (BR-06, C-Rules). "Confirming" pulses
// (stops with reduced motion). Words and tones are the canvas's.
import { cx } from './cx.ts';
import { Icon, type Glyph } from './Icon.tsx';

type Tone =
  'neutral' | 'pending' | 'success' | 'error' | 'warning' | 'info' | 'flagged' | 'mismatch';

export const STATUSES = {
  created: ['neutral', 'receipt', 'Created'],
  pending: ['pending', 'clock', 'Confirming', true],
  paid: ['success', 'check', 'Paid'],
  failed: ['error', 'close', 'Failed'],
  exited: ['success', 'exit', 'Exited'],
  'refund-requested': ['warning', 'refund', 'Refund requested'],
  'refund-pending-ho': ['pending', 'clock', 'Waiting for head office'],
  refunded: ['neutral', 'refund', 'Refunded'],
  'part-refunded': ['neutral', 'refund', 'Partly refunded'],
  disputed: ['error', 'alert', 'Disputed'],
  'chargeback-won': ['success', 'check', 'Chargeback won'],
  declined: ['error', 'close', 'Declined'],
  'chargeback-lost': ['error', 'close', 'Chargeback lost'],
  scanning: ['neutral', 'scan', 'Scanning'],
  flagged: ['flagged', 'flag', 'Flagged'],
  mismatch: ['mismatch', 'alert', 'Mismatch'],
  clear: ['success', 'check', 'Clear'],
  invalid: ['error', 'close', 'Invalid'],
  new: ['info', 'chat', 'New'],
  'in-progress': ['pending', 'clock', 'In progress'],
  waiting: ['neutral', 'user', 'Waiting for shopper'],
  resolved: ['success', 'check', 'Resolved'],
  'past-target': ['error', 'clock', 'Past target'],
  synced: ['success', 'check', 'Synced'],
  'sync-failed': ['error', 'alert', 'Sync failing'],
  live: ['success', 'live', 'Live'],
  paused: ['warning', 'power', 'Switched off'],
  onboarding: ['info', 'settings', 'Onboarding'],
  draft: ['neutral', 'info', 'Draft'],
  'in-review': ['warning', 'eye', 'In review'],
  approved: ['success', 'check', 'Approved'],
  offline: ['info', 'offline', 'Offline'],
  invited: ['info', 'mail', 'Invited'],
  suspended: ['error', 'lock', 'Suspended'],
  'invoice-sent': ['pending', 'send', 'Sent'],
  pilot: ['neutral', 'clock', 'Pilot · no fee'],
  deducted: ['success', 'check', 'Deducted at settlement'],
} as const satisfies Record<
  string,
  readonly [Tone, Glyph, string] | readonly [Tone, Glyph, string, true]
>;

export type Status = keyof typeof STATUSES;

const TONE: Record<Tone, string> = {
  neutral: 'bg-sunken text-secondary',
  pending: 'bg-status-pending-bg text-status-pending-text',
  success: 'bg-status-success-bg text-status-success-text',
  error: 'bg-status-error-bg text-status-error-text',
  warning: 'bg-status-warning-bg text-status-warning-text',
  info: 'bg-status-info-bg text-status-info-text',
  flagged: 'bg-exit-flagged-bg text-primary border border-exit-flagged',
  mismatch: 'bg-exit-mismatch-bg text-exit-mismatch-text border border-exit-mismatch',
};

export interface StatusChipProps {
  status: Status;
  size?: 'sm' | 'md';
  /** Replaces the standard word where a screen adds detail, e.g. "Synced 2 min ago". Keep the meaning. */
  label?: string;
  className?: string;
}

export function StatusChip({ status, size = 'md', label, className }: StatusChipProps) {
  const def = STATUSES[status];
  const [tone, glyph, word] = def;
  const pulsing = def.length === 4;
  const sm = size === 'sm';
  return (
    <span
      className={cx(
        'sk inline-flex items-center gap-[6px] whitespace-nowrap rounded-pill pr-[10px] pl-2 font-ui font-semibold',
        sm ? 'h-[24px] text-[12px]/[16px]' : 'h-[28px] text-[13px]/[18px]',
        TONE[tone],
        className,
      )}
    >
      {pulsing ? (
        <span className="sk-pulse size-[8px] rounded-full bg-current" aria-hidden />
      ) : (
        <Icon glyph={glyph} size={sm ? 12 : 14} />
      )}
      {label ?? word}
    </span>
  );
}
