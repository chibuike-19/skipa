// KPI tile (canvas C-Dashboard · KPI). Every metric links to its records (SA-06) and carries its
// definition from the metric dictionary (AN-08), shown as the tooltip text.
import type { ReactNode } from 'react';

import { cx } from './cx.ts';
import { Icon, type Glyph } from './Icon.tsx';
import { defaultLink, type RenderLink } from './link.tsx';

export interface KpiProps {
  label: string;
  value: ReactNode;
  delta?: { text: string; glyph: Glyph; tone: 'good' | 'bad' | 'neutral' };
  /** Metric dictionary definition (AN-08). */
  definition: string;
  href: string;
  /** Above an alert threshold. */
  alert?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  renderLink?: RenderLink;
  className?: string;
}

export function Kpi({
  label,
  value,
  delta,
  definition,
  href,
  alert = false,
  loading = false,
  loadingLabel = 'Loading',
  renderLink = defaultLink,
  className,
}: KpiProps) {
  const bad = alert || delta?.tone === 'bad';
  return renderLink({
    href,
    title: definition,
    className: cx(
      'sk flex flex-col gap-2 rounded-lg bg-surface px-5 py-4 font-ui text-primary no-underline outline-none focus-visible:shadow-focus',
      bad ? 'border-2 border-status-error' : 'border border-subtle',
      className,
    ),
    children: (
      <>
        <span className="flex items-center justify-between gap-2">
          <span className="t-d-label text-secondary">{label}</span>
          <Icon glyph="info" size={16} className="text-muted" />
        </span>
        {loading ? (
          <span role="status" aria-label={loadingLabel} className="flex flex-col gap-2">
            <span className="sk-skeleton h-[40px] w-[70%] rounded-[6px]" />
            <span className="sk-skeleton h-[16px] w-[40%] rounded-[4px]" />
          </span>
        ) : (
          <>
            <span className={cx('t-d-kpi', bad ? 'text-status-error-text' : 'text-primary')}>
              {value}
            </span>
            {delta !== undefined && (
              <span
                className={cx(
                  't-d-caption inline-flex items-center gap-1',
                  delta.tone === 'good'
                    ? 'text-status-success-text'
                    : delta.tone === 'bad'
                      ? 'text-status-error-text'
                      : 'text-muted',
                )}
              >
                <Icon glyph={delta.glyph} size={14} />
                {delta.text}
              </span>
            )}
          </>
        )}
      </>
    ),
  });
}
