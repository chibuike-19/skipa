// Control (canvas C-Inputs): checkbox, radio, toggle, quantity stepper. Behaviour comes from Radix
// Primitives (brief §8.4); looks from the canvas. Rows are at least 48 px tall.
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import * as RadixRadio from '@radix-ui/react-radio-group';
import * as RadixSwitch from '@radix-ui/react-switch';
import { useId, type ReactNode } from 'react';

import { cx } from './cx.ts';
import { Icon } from './Icon.tsx';

const MARK_BOX =
  'flex size-[24px] flex-none items-center justify-center border-2 border-strong bg-surface outline-none ' +
  'hover:bg-brand-primary-subtle focus-visible:shadow-focus ' +
  'data-[state=checked]:border-brand-primary ' +
  'disabled:border-(--sand-400) disabled:hover:bg-surface aria-[invalid=true]:border-status-error';

function LabelText({
  label,
  description,
  disabled,
}: {
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <span className="flex flex-col gap-[2px]">
      <span className={cx('t-body-strong', disabled === true ? 'text-disabled' : 'text-primary')}>
        {label}
      </span>
      {description !== undefined && <span className="t-caption text-muted">{description}</span>}
    </span>
  );
}

export interface CheckboxProps {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  name?: string;
}

export function Checkbox({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  invalid,
  className,
  name,
}: CheckboxProps) {
  const id = useId();
  return (
    <div className={cx('sk flex min-h-[48px] items-start gap-3 py-3 font-ui', className)}>
      <RadixCheckbox.Root
        id={id}
        name={name}
        checked={checked}
        onCheckedChange={(v) => {
          onCheckedChange(v === true);
        }}
        disabled={disabled}
        aria-invalid={invalid}
        className={cx(
          MARK_BOX,
          'rounded-[6px] data-[state=checked]:bg-brand-primary disabled:data-[state=checked]:bg-(--sand-300)',
        )}
      >
        <RadixCheckbox.Indicator className="text-brand-on-primary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label htmlFor={id} className="cursor-pointer">
        <LabelText label={label} description={description} disabled={disabled} />
      </label>
    </div>
  );
}

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Accessible name for the group. */
  label: string;
  options: RadioOption[];
  value: string | undefined;
  onValueChange: (value: string) => void;
  className?: string;
  name?: string;
}

export function RadioGroup({
  label,
  options,
  value,
  onValueChange,
  className,
  name,
}: RadioGroupProps) {
  const base = useId();
  return (
    <RadixRadio.Root
      aria-label={label}
      value={value}
      onValueChange={onValueChange}
      name={name}
      className={cx('sk flex flex-col font-ui', className)}
    >
      {options.map((o) => {
        const id = `${base}-${o.value}`;
        return (
          <div key={o.value} className="flex min-h-[48px] items-start gap-3 py-3">
            <RadixRadio.Item
              id={id}
              value={o.value}
              disabled={o.disabled}
              className={cx(MARK_BOX, 'rounded-full')}
            >
              <RadixRadio.Indicator className="size-[10px] rounded-full bg-brand-primary" />
            </RadixRadio.Item>
            <label htmlFor={id} className="cursor-pointer">
              <LabelText label={o.label} description={o.description} disabled={o.disabled} />
            </label>
          </div>
        );
      })}
    </RadixRadio.Root>
  );
}

export interface ToggleProps {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: ToggleProps) {
  const id = useId();
  return (
    <div
      className={cx('sk flex min-h-[48px] items-center justify-between gap-4 font-ui', className)}
    >
      <label htmlFor={id} className="cursor-pointer">
        <LabelText label={label} description={description} disabled={disabled} />
      </label>
      <RadixSwitch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cx(
          'flex h-[32px] w-[52px] flex-none items-center rounded-pill bg-(--clay-500) p-[3px] outline-none transition-colors duration-base ease-standard',
          'focus-visible:shadow-focus data-[state=checked]:bg-brand-primary disabled:bg-(--sand-200) disabled:data-[state=checked]:bg-(--sand-300)',
        )}
      >
        <RadixSwitch.Thumb className="block size-[26px] rounded-full bg-surface shadow-1 transition-transform duration-base ease-standard data-[state=checked]:translate-x-[20px]" />
      </RadixSwitch.Root>
    </div>
  );
}

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  /** At the cart limit: the + button is disabled. */
  atMax?: boolean;
  disabled?: boolean;
  labels?: { group?: string; remove?: string; less?: string; more?: string };
  className?: string;
}

/** Quantity stepper. At 1 the minus becomes "Remove item" (trash, error colour), as on the canvas. */
export function Stepper({
  value,
  onChange,
  atMax = false,
  disabled = false,
  labels = {},
  className,
}: StepperProps) {
  const removing = value <= 1;
  const btn =
    'flex size-[48px] items-center justify-center rounded-pill border-0 bg-transparent outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:text-disabled';
  return (
    <div
      role="group"
      aria-label={labels.group ?? 'Quantity'}
      className={cx('sk inline-flex items-center rounded-pill bg-sunken font-ui', className)}
    >
      <button
        type="button"
        aria-label={removing ? (labels.remove ?? 'Remove item') : (labels.less ?? 'One fewer')}
        disabled={disabled}
        onClick={() => {
          onChange(value - 1);
        }}
        className={cx(btn, removing ? 'text-status-error-text' : 'text-primary')}
      >
        <Icon glyph={removing ? 'trash' : 'minus'} size={20} />
      </button>
      <span
        aria-live="polite"
        className={cx(
          't-money min-w-[28px] text-center',
          disabled ? 'text-disabled' : 'text-primary',
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={labels.more ?? 'Add one more'}
        disabled={disabled || atMax}
        onClick={() => {
          onChange(value + 1);
        }}
        className={cx(btn, 'text-primary')}
      >
        <Icon glyph="plus" size={20} />
      </button>
    </div>
  );
}
