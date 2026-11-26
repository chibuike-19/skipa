// Overlay (canvas C-Dashboard · Overlay): confirm dialog, side panel, tooltip, and the
// press-and-hold button for switching Skipa off (SD-03: hold 1.5 s, keyboard: hold Enter).
// Radix handles focus, Escape and focus return (NF-30); the looks are the canvas's.
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from './Button.tsx';
import { cx } from './cx.ts';
import { useReturnFocus } from './focus.ts';
import { Icon, type Glyph } from './Icon.tsx';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Status icon beside the title (e.g. power for switch-off). */
  glyph?: Glyph;
  tone?: 'error' | 'neutral';
  children?: ReactNode;
  /** The buttons, right-aligned (Cancel first, the action last). */
  actions: ReactNode;
  /** alertdialog for destructive or money decisions. */
  alert?: boolean;
  className?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  glyph,
  tone = 'neutral',
  children,
  actions,
  alert = true,
  className,
}: ConfirmDialogProps) {
  const focus = useReturnFocus();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="sk-scrim fixed inset-0 z-40 bg-scrim" />
        <Dialog.Content
          {...focus}
          role={alert ? 'alertdialog' : 'dialog'}
          className={cx(
            'sk sk-dialog fixed top-1/2 left-1/2 z-50 flex w-[min(520px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl bg-surface p-7 font-ui text-primary shadow-4 outline-none',
            className,
          )}
        >
          <div className="flex items-start gap-4">
            {glyph !== undefined && (
              <span
                className={cx(
                  'flex size-[48px] flex-none items-center justify-center rounded-full',
                  tone === 'error'
                    ? 'bg-status-error-bg text-status-error'
                    : 'bg-sunken text-primary',
                )}
              >
                <Icon glyph={glyph} size={24} />
              </span>
            )}
            <div className="flex flex-col gap-[6px]">
              <Dialog.Title className="t-d-h2 m-0">{title}</Dialog.Title>
              {description !== undefined && (
                <Dialog.Description className="t-d-body m-0 text-secondary">
                  {description}
                </Dialog.Description>
              )}
            </div>
          </div>
          {children}
          <div className="flex items-center justify-end gap-2">{actions}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export interface SidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** Small reference above the title, e.g. the receipt number. */
  eyebrow?: ReactNode;
  closeLabel?: string;
  children: ReactNode;
  className?: string;
}

export function SidePanel({
  open,
  onOpenChange,
  title,
  eyebrow,
  closeLabel = 'Close panel',
  children,
  className,
}: SidePanelProps) {
  const focus = useReturnFocus();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="sk-scrim fixed inset-0 z-40 bg-scrim" />
        <Dialog.Content
          {...focus}
          aria-describedby={undefined}
          className={cx(
            'sk sk-panel fixed inset-y-0 right-0 z-50 flex w-[min(480px,100vw)] flex-col gap-4 overflow-y-auto border-l border-subtle bg-surface p-5 font-ui text-primary shadow-4 outline-none',
            className,
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              {eyebrow !== undefined && <span className="t-ref text-[14px]">{eyebrow}</span>}
              <Dialog.Title className="t-d-h2 m-0">{title}</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <Button variant="tertiary" size="md" icon="close" iconOnly label={closeLabel} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export interface TooltipProps {
  content: ReactNode;
  /** The trigger; must be focusable (a button or link). */
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <RadixTooltip.Provider delayDuration={300}>{children}</RadixTooltip.Provider>;
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className="sk t-d-caption z-50 max-w-[280px] rounded-sm bg-inverse px-3 py-[10px] text-inverse"
        >
          {content}
          <RadixTooltip.Arrow className="fill-(--ink)" width={14} height={7} />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

export const HOLD_MS = 1_500;

export interface HoldButtonProps {
  label: string;
  holdingLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  glyph?: Glyph;
  holdMs?: number;
}

/**
 * Destructive action that needs a 1.5 s press (pointer) or a 1.5 s held Enter/Space (keyboard).
 * Releasing early cancels. Shows a progress bar while held.
 */
export function HoldButton({
  label,
  holdingLabel,
  onConfirm,
  disabled = false,
  glyph = 'power',
  holdMs = HOLD_MS,
}: HoldButtonProps) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const start = () => {
    if (disabled || timer.current !== undefined) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      setHolding(false);
      onConfirm();
    }, holdMs);
  };
  const cancel = () => {
    if (timer.current !== undefined) clearTimeout(timer.current);
    timer.current = undefined;
    setHolding(false);
  };
  useEffect(() => cancel, []);
  return (
    <div className="relative overflow-hidden rounded-pill">
      <Button
        variant="destructive"
        size="md"
        icon={glyph}
        label={holding ? holdingLabel : label}
        disabled={disabled}
        aria-pressed={holding}
        className={cx(holding && 'bg-(--red-900)')}
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
            e.preventDefault();
            start();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === 'Enter' || e.key === ' ') cancel();
        }}
        onClick={(e) => {
          e.preventDefault();
        }}
      />
      {holding && (
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-[4px] bg-surface opacity-85"
          style={{ animation: `sk-hold ${String(holdMs)}ms linear forwards` }}
        />
      )}
    </div>
  );
}
