// State (canvas C-Feedback): empty, error and switched-off screens with their illustrations.
// The error state shows the short reference users read out to support (ER-08).
// Illustrations are copied from the canvas source; their colours are token variables.
import type { ReactNode } from 'react';

import { Button, type ButtonVariant } from './Button.tsx';
import { cx } from './cx.ts';
import type { Glyph } from './Icon.tsx';

export type StateArt = 'basket' | 'receipt' | 'inbox' | 'error' | 'off';

function Art({ art }: { art: StateArt }) {
  const svg = { width: 120, height: 96, viewBox: '0 0 120 96', 'aria-hidden': true } as const;
  switch (art) {
    case 'basket':
      return (
        <svg {...svg}>
          <rect x="20" y="40" width="80" height="48" rx="14" className="fill-brand-primary" />
          <path
            d="M38 40 C38 14 82 14 82 40"
            fill="none"
            className="stroke-(--ochre-500)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx="44" cy="22" r="3" className="fill-(--ochre-500)" />
          <circle cx="56" cy="14" r="4" className="fill-(--ochre-500)" />
          <circle cx="72" cy="12" r="5" className="fill-(--ochre-500)" />
          <path
            d="M44 64h32"
            className="stroke-(--white)"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      );
    case 'receipt':
      return (
        <svg {...svg}>
          <path d="M38 8h44v80l-7-6-7 6-8-6-7 6-8-6-7 6z" className="fill-(--sand-100)" />
          <path
            d="M48 28h24M48 40h24M48 52h14"
            className="stroke-(--clay-500)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="84" cy="70" r="14" className="fill-(--ochre-500)" />
          <path
            d="M78 70l4 4 8-8"
            fill="none"
            className="stroke-(--ink)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'inbox':
      return (
        <svg {...svg}>
          <path d="M22 22h76v46H54l-18 14V68H22z" className="fill-(--indigo-100)" />
          <circle cx="46" cy="45" r="4" className="fill-(--indigo-700)" />
          <circle cx="60" cy="45" r="4" className="fill-(--indigo-700)" />
          <circle cx="74" cy="45" r="4" className="fill-(--indigo-700)" />
        </svg>
      );
    case 'error':
      return (
        <svg {...svg}>
          <circle cx="60" cy="48" r="36" className="fill-status-error-bg" />
          <path
            d="M60 30v22M60 64h.01"
            className="stroke-status-error"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'off':
      return (
        <svg {...svg}>
          <rect x="24" y="16" width="72" height="64" rx="12" className="fill-(--sand-100)" />
          <path
            d="M44 36h32M44 48h32M44 60h20"
            className="stroke-(--clay-500)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="88" cy="22" r="14" className="fill-status-warning" />
          <path
            d="M88 15v8M84 18a6 6 0 1 0 8 0"
            fill="none"
            className="stroke-(--white)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export interface StateProps {
  art: StateArt;
  title: ReactNode;
  body: ReactNode;
  /** Error states: the short request reference (ER-08) and, optionally, the error code. */
  reference?: { label: string; requestId: string; code?: string };
  action?: { label: string; onClick: () => void; variant?: ButtonVariant; icon?: Glyph };
  className?: string;
}

export function State({ art, title, body, reference, action, className }: StateProps) {
  return (
    <section
      className={cx(
        'sk flex flex-col items-center gap-3 px-5 py-6 text-center font-ui text-primary',
        className,
      )}
    >
      <Art art={art} />
      <h2 className="t-h2 m-0">{title}</h2>
      <p className="t-body m-0 max-w-[320px] text-secondary">{body}</p>
      {reference !== undefined && (
        <span className="t-caption inline-flex items-center gap-[6px] rounded-sm bg-sunken px-[10px] py-1 text-secondary">
          {reference.label} <b className="t-ref text-[13px]/[18px]">{reference.requestId}</b>
          {reference.code !== undefined && <> · {reference.code}</>}
        </span>
      )}
      {action !== undefined && (
        <div className="pt-2">
          <Button
            variant={action.variant ?? 'primary'}
            size="lg"
            icon={action.icon}
            label={action.label}
            onClick={action.onClick}
          />
        </div>
      )}
    </section>
  );
}
