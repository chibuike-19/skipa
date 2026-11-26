// Field (canvas C-Inputs): label, control, hint or error. Errors are announced (aria-live) and
// linked with aria-describedby; code inputs use inputmode numeric + autocomplete one-time-code
// (brief §13). Inputs are 48 px tall with 16 px text (no zoom on iOS). The canvas's `date-range`
// field arrives with the dashboard filters (F5).
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ClipboardEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

import { cx } from './cx.ts';
import { Icon, type Glyph } from './Icon.tsx';

interface FieldFrameProps {
  label: ReactNode;
  hint?: ReactNode;
  /** Error text; when set the field is invalid. */
  error?: ReactNode;
  optional?: boolean;
  /** Visible word after an optional label. */
  optionalLabel?: string;
  disabled?: boolean;
  className?: string;
}

const BOX =
  'w-full rounded-md bg-surface border-[1.5px] border-strong font-ui font-medium text-[16px]/[24px] text-primary [font-variant-numeric:tabular-nums] ' +
  'focus-within:border-2 focus-within:border-brand-primary-text focus-within:shadow-focus ' +
  'data-[invalid=true]:border-2 data-[invalid=true]:border-status-error ' +
  'has-[:disabled]:bg-sunken has-[:disabled]:border-(--sand-300) has-[:disabled]:text-disabled';

function useFieldIds(error: ReactNode, hint: ReactNode) {
  const id = useId();
  const msgId = `${id}-msg`;
  const hasMsg = error !== undefined || hint !== undefined;
  return { id, msgId, describedBy: hasMsg ? msgId : undefined };
}

function Frame({
  id,
  msgId,
  label,
  hint,
  error,
  optional,
  optionalLabel = '(optional)',
  disabled,
  className,
  children,
}: FieldFrameProps & { id: string; msgId: string; children: ReactNode }) {
  const invalid = error !== undefined;
  return (
    <div className={cx('sk flex flex-col gap-[6px] font-ui text-primary', className)}>
      <label
        htmlFor={id}
        className={cx('t-label', disabled === true ? 'text-disabled' : 'text-primary')}
      >
        {label}
        {optional === true && <span className="font-medium text-muted"> {optionalLabel}</span>}
      </label>
      {children}
      <span
        id={msgId}
        aria-live="polite"
        className={cx(
          't-caption flex items-start gap-[6px]',
          invalid ? 'text-status-error-text' : 'text-muted',
        )}
      >
        {invalid && <Icon glyph="alert" size={16} className="mt-[1px]" />}
        <span>{invalid ? error : hint}</span>
      </span>
    </div>
  );
}

export type TextFieldKind = 'text' | 'email' | 'phone' | 'number' | 'search';

export interface TextFieldProps
  extends FieldFrameProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  kind?: TextFieldKind;
  /** Country prefix shown for `phone`. */
  phonePrefix?: string;
  trailingIcon?: Glyph;
}

const KIND_INPUT: Record<
  TextFieldKind,
  { type: string; inputMode: InputHTMLAttributes<HTMLInputElement>['inputMode']; lead?: Glyph }
> = {
  text: { type: 'text', inputMode: 'text' },
  email: { type: 'email', inputMode: 'email' },
  phone: { type: 'tel', inputMode: 'numeric' },
  number: { type: 'text', inputMode: 'numeric' },
  search: { type: 'search', inputMode: 'search', lead: 'search' },
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    kind = 'text',
    label,
    hint,
    error,
    optional,
    optionalLabel,
    disabled,
    className,
    phonePrefix = 'NG +234',
    trailingIcon,
    ...input
  },
  ref,
) {
  const { id, msgId, describedBy } = useFieldIds(error, hint);
  const k = KIND_INPUT[kind];
  return (
    <Frame {...{ id, msgId, label, hint, error, optional, optionalLabel, disabled, className }}>
      <div
        data-invalid={error !== undefined}
        className={cx(
          BOX,
          'flex h-[48px] items-center gap-2 pr-4',
          kind === 'phone' ? 'pl-3' : 'pl-4',
        )}
      >
        {kind === 'phone' && (
          <span className="mr-1 inline-flex h-full items-center border-r border-default pr-3 font-semibold text-secondary">
            {phonePrefix}
          </span>
        )}
        {k.lead !== undefined && <Icon glyph={k.lead} size={20} className="text-muted" />}
        <input
          ref={ref}
          id={id}
          type={k.type}
          inputMode={k.inputMode}
          disabled={disabled}
          aria-invalid={error !== undefined}
          aria-describedby={describedBy}
          className="h-full min-w-0 flex-1 border-0 bg-transparent outline-none disabled:text-disabled"
          {...input}
        />
        {trailingIcon !== undefined && (
          <Icon glyph={trailingIcon} size={20} className="text-secondary" />
        )}
      </div>
    </Frame>
  );
});

export interface TextAreaProps
  extends FieldFrameProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, hint, error, optional, optionalLabel, disabled, className, rows = 4, ...input },
  ref,
) {
  const { id, msgId, describedBy } = useFieldIds(error, hint);
  return (
    <Frame {...{ id, msgId, label, hint, error, optional, optionalLabel, disabled, className }}>
      <div data-invalid={error !== undefined} className={cx(BOX, 'px-4 py-3')}>
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          disabled={disabled}
          aria-invalid={error !== undefined}
          aria-describedby={describedBy}
          className="block min-h-[88px] w-full resize-none border-0 bg-transparent outline-none"
          {...input}
        />
      </div>
    </Frame>
  );
});

export interface SelectFieldProps extends FieldFrameProps, SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, hint, error, optional, optionalLabel, disabled, className, children, ...select },
  ref,
) {
  const { id, msgId, describedBy } = useFieldIds(error, hint);
  return (
    <Frame {...{ id, msgId, label, hint, error, optional, optionalLabel, disabled, className }}>
      <div
        data-invalid={error !== undefined}
        className={cx(BOX, 'relative flex h-[48px] items-center')}
      >
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={error !== undefined}
          aria-describedby={describedBy}
          className="h-full w-full appearance-none border-0 bg-transparent pr-[44px] pl-4 outline-none"
          {...select}
        >
          {children}
        </select>
        <Icon
          glyph="chevron-down"
          size={20}
          className="pointer-events-none absolute right-4 text-secondary"
        />
      </div>
    </Frame>
  );
});

export interface OtpFieldProps extends FieldFrameProps {
  value: string;
  onChange: (value: string) => void;
  /** Called once all digits are entered. */
  onComplete?: (value: string) => void;
  length?: number;
  /** Accessible name per box, e.g. (i) => `Digit ${i}`. */
  digitLabel?: (position: number) => string;
  autoFocus?: boolean;
}

/** Six-digit code (shopper SMS, staff email codes). Pasting a whole code fills every box. */
export function OtpField({
  value,
  onChange,
  onComplete,
  length = 6,
  digitLabel = (i) => `Digit ${String(i)}`,
  label,
  hint,
  error,
  optional,
  optionalLabel,
  disabled,
  className,
  autoFocus,
}: OtpFieldProps) {
  const { id, msgId, describedBy } = useFieldIds(error, hint);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.replace(/\D/g, '').slice(0, length);
  // The code step opens with the cursor in the first box (canvas SH-F02, EX-F01).
  useEffect(() => {
    if (autoFocus === true) boxes.current[0]?.focus();
  }, [autoFocus]);

  const set = (next: string) => {
    const clean = next.replace(/\D/g, '').slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
    boxes.current[Math.min(clean.length, length - 1)]?.focus();
  };
  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && (digits[i] ?? '') === '' && i > 0) {
      e.preventDefault();
      set(digits.slice(0, i - 1));
    }
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    set(e.clipboardData.getData('text'));
  };

  return (
    <Frame {...{ id, msgId, label, hint, error, optional, optionalLabel, disabled, className }}>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${String(length)}, minmax(0, 1fr))` }}
      >
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => {
              boxes.current[i] = el;
            }}
            id={i === 0 ? id : undefined}
            aria-label={digitLabel(i + 1)}
            aria-invalid={error !== undefined}
            aria-describedby={describedBy}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={i === 0 ? length : 1}
            disabled={disabled}
            value={digits[i] ?? ''}
            onChange={(e) => {
              set(digits.slice(0, i) + e.target.value + digits.slice(i + 1));
            }}
            onKeyDown={onKeyDown(i)}
            onPaste={onPaste}
            className={cx(
              'h-[48px] w-full rounded-md border-[1.5px] border-strong bg-surface text-center font-ui text-[24px]/[32px] font-bold text-primary [font-variant-numeric:tabular-nums] outline-none',
              'focus:border-2 focus:border-brand-primary-text focus:shadow-focus',
              'aria-[invalid=true]:border-2 aria-[invalid=true]:border-status-error',
              'disabled:border-(--sand-300) disabled:bg-sunken',
            )}
          />
        ))}
      </div>
    </Frame>
  );
}
