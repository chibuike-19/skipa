// Sheet (canvas C-Shopper · Sheet): bottom sheet for not-included, not-found, price-changed and
// remove-item. Radix Dialog moves focus in, traps it, returns it on close and closes on Escape
// (NF-30, brief §13). The screen decides the copy; the canvas sheets are in the gallery.
import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

import { Button, type ButtonVariant } from './Button.tsx';
import { usePortalContainer } from './BrandScope.tsx';
import { cx } from './cx.ts';
import { useReturnFocus } from './focus.ts';
import { Icon, type Glyph } from './Icon.tsx';

export type SheetTone = 'info' | 'warning' | 'neutral';

const TONE: Record<SheetTone, string> = {
  info: 'bg-status-info-bg text-status-info-text',
  warning: 'bg-status-warning-bg text-status-warning-text',
  neutral: 'bg-sunken text-primary',
};

export interface SheetAction {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
}

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  glyph: Glyph;
  tone?: SheetTone;
  title: ReactNode;
  body: ReactNode;
  /** Extra content between the text and the buttons (a barcode field, a price list). */
  children?: ReactNode;
  primary: SheetAction;
  secondary?: SheetAction;
  className?: string;
}

export function Sheet({
  open,
  onOpenChange,
  glyph,
  tone = 'neutral',
  title,
  body,
  children,
  primary,
  secondary,
  className,
}: SheetProps) {
  const focus = useReturnFocus();
  const container = usePortalContainer();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={container}>
        <Dialog.Overlay className="sk-scrim fixed inset-0 z-40 bg-scrim" />
        <Dialog.Content
          {...focus}
          className={cx(
            'sk sk-sheet fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-[480px] flex-col gap-4 rounded-t-xl bg-surface px-4 pt-2 pb-4 font-ui text-primary shadow-3 outline-none',
            className,
          )}
        >
          <span
            aria-hidden
            className="h-[4px] w-[40px] self-center rounded-[2px] bg-(--sand-400)"
          />
          <div className="flex items-start gap-3">
            <span
              className={cx(
                'flex size-[48px] flex-none items-center justify-center rounded-full',
                TONE[tone],
              )}
            >
              <Icon glyph={glyph} size={24} />
            </span>
            <div className="flex flex-col gap-1">
              <Dialog.Title className="t-h2 m-0">{title}</Dialog.Title>
              <Dialog.Description className="t-body m-0 text-secondary">{body}</Dialog.Description>
            </div>
          </div>
          {children}
          <div className="flex flex-col gap-2">
            <Button
              variant={primary.variant ?? 'primary'}
              full
              label={primary.label}
              loading={primary.loading}
              onClick={primary.onClick}
            />
            {secondary !== undefined && (
              <Button
                variant={secondary.variant ?? 'tertiary'}
                full
                label={secondary.label}
                loading={secondary.loading}
                onClick={secondary.onClick}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
