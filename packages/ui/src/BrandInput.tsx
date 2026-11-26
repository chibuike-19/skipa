// BrandInput (canvas C-Inputs · BrandInput): logo upload and brand-colour field for the branding
// editor (BR-01–04). Presentational: contrast numbers and the suggested shade are computed by the
// app with packages/domain/contrast.ts (the same code the API uses at publish) and passed in, so
// the maths lives in one place. Swatches show the colour being edited: that hex is data, not a
// design value (canvas Design review: "store colours are the data being edited").
import { useId, useRef, type ReactNode } from 'react';

import { Button } from './Button.tsx';
import { cx } from './cx.ts';
import { Icon } from './Icon.tsx';

export type UploadState = 'empty' | 'uploading' | 'done' | 'error';

export interface LogoUploadProps {
  label: ReactNode;
  state: UploadState;
  title: ReactNode;
  message: ReactNode;
  /** 0–100 while uploading */
  progress?: number;
  /** Accessible name of the upload progress bar. */
  progressLabel?: string;
  previewUrl?: string;
  previewAlt?: string;
  buttonLabel: string;
  accept?: string;
  onFile: (file: File) => void;
  /** Cancel while uploading. */
  onCancel?: () => void;
  className?: string;
}

export function LogoUpload({
  label,
  state,
  title,
  message,
  progress = 0,
  progressLabel = 'Upload progress',
  previewUrl,
  previewAlt = '',
  buttonLabel,
  accept = 'image/png,image/svg+xml',
  onFile,
  onCancel,
  className,
}: LogoUploadProps) {
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  return (
    <div className={cx('sk flex flex-col gap-2 font-ui text-primary', className)}>
      <span id={id} className="t-d-label">
        {label}
      </span>
      {/* Drag and drop is a pointer shortcut; the button below is the keyboard and screen-reader path. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- see above */}
      <div
        aria-labelledby={id}
        role="group"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file !== undefined) onFile(file);
        }}
        className={cx(
          'flex items-center gap-4 rounded-md p-4',
          state === 'error'
            ? 'border-2 border-status-error bg-surface'
            : state === 'empty'
              ? 'border-2 border-dashed border-strong bg-page'
              : 'border-[1.5px] border-default bg-surface',
        )}
      >
        <div className="flex size-[64px] flex-none items-center justify-center overflow-hidden rounded-sm bg-sunken">
          {state === 'done' && previewUrl !== undefined ? (
            <img src={previewUrl} alt={previewAlt} className="max-h-[40px] max-w-[48px]" />
          ) : (
            <Icon glyph="upload" size={24} className="text-muted" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="t-d-body font-semibold">{title}</span>
          <span
            className={cx(
              't-d-caption',
              state === 'error' ? 'text-status-error-text' : 'text-muted',
            )}
          >
            {message}
          </span>
          {state === 'uploading' && (
            <span
              role="progressbar"
              aria-label={progressLabel}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="block h-[6px] overflow-hidden rounded-[3px] bg-(--sand-200)"
            >
              <span
                className="block h-full bg-brand-primary"
                style={{ width: `${String(progress)}%` }}
              />
            </span>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept={accept}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file !== undefined) onFile(file);
            e.target.value = '';
          }}
        />
        <Button
          variant="secondary"
          size="sm"
          label={buttonLabel}
          onClick={() => {
            if (state === 'uploading') onCancel?.();
            else input.current?.click();
          }}
        />
      </div>
    </div>
  );
}

export interface ContrastResult {
  /** Text colour that reads best on the brand colour (button text). */
  onColour: string;
  /** Contrast of that text on the brand colour. */
  buttonRatio: number;
  /** Contrast of the brand colour as text on the page background. */
  textRatio: number;
  /** Nearest shade that passes as text, when the colour fails. */
  suggestion?: { hex: string; ratio: number };
}

export interface ColourFieldCopy {
  /** e.g. "Readable. You can publish this colour." */
  pass: string;
  /** e.g. "Fine for buttons. Too light for text links." */
  buttonOnly: string;
  /** e.g. "Too hard to read. This colour can't be published." */
  fail: string;
  /** e.g. (r) => `Button text ${r.button}:1 · as text on the page ${r.text}:1 · needs 4.5:1` */
  ratios: (r: { button: string; text: string }) => string;
  suggestion: (hex: string, ratio: string) => ReactNode;
  useSuggestion: string;
  previewButton: string;
}

export interface ColourFieldProps {
  label: ReactNode;
  hex: string;
  onHexChange: (hex: string) => void;
  contrast: ContrastResult;
  copy: ColourFieldCopy;
  onUseSuggestion?: (hex: string) => void;
  className?: string;
}

export const MIN_CONTRAST = 4.5;

/** "4.5" style ratio text (one decimal), without float-to-string helpers the money lint bans. */
const ratio = new Intl.NumberFormat('en-NG', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function ColourField({
  label,
  hex,
  onHexChange,
  contrast,
  copy,
  onUseSuggestion,
  className,
}: ColourFieldProps) {
  const id = useId();
  const passButton = contrast.buttonRatio >= MIN_CONTRAST;
  const passText = contrast.textRatio >= MIN_CONTRAST;
  const verdict = passButton && passText ? 'pass' : passButton ? 'buttonOnly' : 'fail';
  const tone = {
    pass: 'bg-status-success-bg text-status-success-text',
    buttonOnly: 'bg-status-warning-bg text-status-warning-text',
    fail: 'bg-status-error-bg text-status-error-text',
  }[verdict];
  return (
    <div className={cx('sk flex flex-col gap-2 font-ui text-primary', className)}>
      <label htmlFor={id} className="t-d-label">
        {label}
      </label>
      <div className="flex flex-col gap-3 rounded-md border-[1.5px] border-default bg-surface p-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="size-[48px] flex-none rounded-sm border border-subtle"
            style={{ background: hex }}
          />
          <input
            id={id}
            value={hex}
            onChange={(e) => {
              onHexChange(e.target.value.toUpperCase());
            }}
            spellCheck={false}
            className="h-[48px] min-w-0 flex-1 rounded-sm border-[1.5px] border-strong px-3 font-ui text-[15px]/[22px] font-semibold tracking-[0.04em] outline-none focus:shadow-focus"
          />
          <span
            aria-hidden
            className="flex h-[48px] flex-none items-center rounded-pill px-[14px] text-[14px]/[20px] font-bold"
            style={{ background: hex, color: contrast.onColour }}
          >
            {copy.previewButton}
          </span>
        </div>
        <div role="status" className={cx('flex items-start gap-[10px] rounded-sm p-3', tone)}>
          <Icon
            glyph={
              verdict === 'pass' ? 'check-circle' : verdict === 'buttonOnly' ? 'alert' : 'x-circle'
            }
            size={20}
          />
          <div className="flex flex-col gap-1">
            <span className="t-d-body font-semibold">{copy[verdict]}</span>
            <span className="t-d-caption">
              {copy.ratios({
                button: ratio.format(contrast.buttonRatio),
                text: ratio.format(contrast.textRatio),
              })}
            </span>
          </div>
        </div>
        {verdict !== 'pass' && contrast.suggestion !== undefined && (
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="size-[32px] rounded-sm"
              style={{ background: contrast.suggestion.hex }}
            />
            <span className="t-d-body flex-1">
              {copy.suggestion(contrast.suggestion.hex, ratio.format(contrast.suggestion.ratio))}
            </span>
            {onUseSuggestion !== undefined && (
              <Button
                variant="secondary"
                size="sm"
                label={copy.useSuggestion}
                onClick={() => {
                  if (contrast.suggestion !== undefined) onUseSuggestion(contrast.suggestion.hex);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
