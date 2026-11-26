// Table (canvas C-Dashboard · Table): toolbar, sortable header, row tones (new, selected,
// mismatch), footer (pagination). Presentational: dashboards feed rows from TanStack Table (F5).
// Scrolls sideways inside its box on narrow screens.
import type { ReactNode } from 'react';

import { cx } from './cx.ts';
import { Icon } from './Icon.tsx';

export interface TableColumn<Row> {
  id: string;
  header: string;
  align?: 'left' | 'right';
  cell: (row: Row) => ReactNode;
  /** Current sort of this column, when sortable. */
  sort?: 'ascending' | 'descending' | 'none';
  onSort?: () => void;
}

export type RowTone = 'new' | 'selected' | 'mismatch';

export interface TableProps<Row> {
  /** Accessible caption (visually hidden). */
  caption: string;
  columns: TableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  rowTone?: (row: Row) => RowTone | undefined;
  onRowClick?: (row: Row) => void;
  toolbar?: ReactNode;
  footer?: ReactNode;
  /** Shown instead of rows when there are none. */
  empty?: ReactNode;
  minWidth?: number;
  className?: string;
}

const TONE: Record<RowTone, string> = {
  new: 'bg-status-info-bg',
  selected: 'bg-(--indigo-100) shadow-[inset_3px_0_0_var(--indigo-700)]',
  mismatch: 'bg-exit-mismatch-bg',
};
const MARKER: Partial<Record<RowTone, string>> = {
  new: 'bg-status-info',
  mismatch: 'bg-exit-mismatch',
};

export function Table<Row>({
  caption,
  columns,
  rows,
  rowKey,
  rowTone,
  onRowClick,
  toolbar,
  footer,
  empty,
  minWidth = 760,
  className,
}: TableProps<Row>) {
  return (
    <section
      className={cx(
        'sk overflow-hidden rounded-lg border border-subtle bg-surface font-ui text-primary',
        className,
      )}
    >
      {toolbar !== undefined && (
        <div className="flex flex-wrap items-center gap-2 border-b border-subtle px-4 py-3">
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="t-d-table w-full border-collapse" style={{ minWidth }}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="bg-sunken">
              {columns.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  aria-sort={c.sort}
                  className={cx(
                    'h-[44px] px-4 text-[12px]/[16px] font-semibold tracking-[0.04em] whitespace-nowrap text-secondary uppercase',
                    c.align === 'right' ? 'text-right' : 'text-left',
                  )}
                >
                  {c.onSort !== undefined ? (
                    <button
                      type="button"
                      onClick={c.onSort}
                      className="inline-flex items-center gap-1 border-0 bg-transparent p-0 [font:inherit] text-inherit uppercase"
                    >
                      {c.header}
                      {c.sort !== undefined && c.sort !== 'none' && (
                        <Icon
                          glyph={c.sort === 'descending' ? 'chevron-down' : 'chevron-up'}
                          size={14}
                        />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && empty !== undefined ? (
              <tr>
                <td colSpan={columns.length}>{empty}</td>
              </tr>
            ) : (
              rows.map((row) => {
                const tone = rowTone?.(row);
                return (
                  <tr
                    key={rowKey(row)}
                    onClick={
                      onRowClick === undefined
                        ? undefined
                        : () => {
                            onRowClick(row);
                          }
                    }
                    className={cx(
                      'border-t border-subtle',
                      tone !== undefined ? TONE[tone] : 'hover:bg-sunken',
                      onRowClick !== undefined && 'cursor-pointer',
                    )}
                  >
                    {columns.map((c, i) => (
                      <td
                        key={c.id}
                        className={cx(
                          'px-4 py-3 whitespace-nowrap',
                          c.align === 'right' && 'text-right font-semibold',
                        )}
                      >
                        {i === 0 && tone !== undefined && MARKER[tone] !== undefined ? (
                          <span className="inline-flex items-center gap-2">
                            <span
                              aria-hidden
                              className={cx('h-[24px] w-[4px] rounded-[2px]', MARKER[tone])}
                            />
                            {c.cell(row)}
                          </span>
                        ) : (
                          c.cell(row)
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {footer !== undefined && (
        <div className="flex justify-end border-t border-subtle px-4 py-3">{footer}</div>
      )}
    </section>
  );
}
