import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Avatar, AVATARS } from './Brand.tsx';
import { Button } from './Button.tsx';
import { Stepper } from './Control.tsx';
import { OtpField, TextField } from './Field.tsx';
import { GLYPHS } from './Icon.tsx';
import { HOLD_MS, HoldButton } from './Overlay.tsx';
import { Sheet } from './Sheet.tsx';
import { STATUSES, StatusChip, type Status } from './StatusChip.tsx';

describe('Icon', () => {
  it('has the 63 glyphs of the canvas Icon source', () => {
    expect(Object.keys(GLYPHS)).toHaveLength(63);
  });
});

describe('Button', () => {
  it('locks while loading: disabled, aria-busy, loading label, no click (PY-01)', async () => {
    const onClick = vi.fn();
    render(<Button variant="pay" label="Pay ₦31,300" loading onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Opening Paystack…' });
    expect(button).toHaveProperty('disabled', true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('icon-only buttons have an accessible name', () => {
    render(<Button icon="scan" iconOnly label="Scan another item" />);
    expect(screen.getByRole('button', { name: 'Scan another item' })).toBeTruthy();
  });

  it('pay never uses the brand slots (BR-06)', () => {
    render(<Button variant="pay" label="Pay" />);
    expect(screen.getByRole('button').className).not.toMatch(/brand/);
  });
});

describe('StatusChip', () => {
  it.each(Object.keys(STATUSES) as Status[])(
    '%s shows a word and an icon or pulse, never colour alone',
    (status) => {
      const { container } = render(<StatusChip status={status} />);
      expect(container.textContent).toBe(STATUSES[status][2]);
      expect(container.querySelector('svg, .sk-pulse')).not.toBeNull();
      expect(container.innerHTML).not.toMatch(/brand/);
    },
  );
});

describe('Field', () => {
  it('links the error to the input and announces it (brief §13)', () => {
    render(
      <TextField
        kind="phone"
        label="Phone number"
        error="Enter a Nigerian mobile number, like 803 123 4567."
      />,
    );
    const input = screen.getByLabelText('Phone number');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('inputmode')).toBe('numeric');
    const msg = document.getElementById(input.getAttribute('aria-describedby') ?? '');
    expect(msg?.textContent).toContain('Enter a Nigerian mobile number');
    expect(msg?.getAttribute('aria-live')).toBe('polite');
  });

  it('OTP: numeric, one-time-code, a pasted code fills every box and completes', () => {
    const onComplete = vi.fn();
    function Harness() {
      const [v, setV] = useState('');
      return (
        <OtpField
          label="Enter the 6-digit code"
          value={v}
          onChange={setV}
          onComplete={onComplete}
        />
      );
    }
    render(<Harness />);
    const first = screen.getByLabelText('Digit 1');
    expect(first.getAttribute('autocomplete')).toBe('one-time-code');
    expect(first.getAttribute('inputmode')).toBe('numeric');
    fireEvent.paste(first, { clipboardData: { getData: () => '482 913' } });
    expect(onComplete).toHaveBeenCalledWith('482913');
    expect(screen.getByLabelText<HTMLInputElement>('Digit 6').value).toBe('3');
  });
});

describe('Stepper', () => {
  it('at quantity 1 the minus button becomes "Remove item"', () => {
    render(<Stepper value={1} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Remove item' })).toBeTruthy();
  });

  it('at the cart limit the plus button is disabled', () => {
    render(<Stepper value={3} onChange={vi.fn()} atMax />);
    expect(screen.getByRole('button', { name: 'Add one more' })).toHaveProperty('disabled', true);
  });
});

describe('Sheet', () => {
  it('moves focus into the sheet and closes on Escape (NF-30)', async () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet
        open
        onOpenChange={onOpenChange}
        glyph="info"
        tone="info"
        title="Not sold through Skipa here yet"
        body="Please pay for it at the till."
        primary={{ label: 'OK, keep scanning', onClick: vi.fn() }}
      />,
    );
    const dialog = screen.getByRole('dialog', { name: 'Not sold through Skipa here yet' });
    expect(dialog.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('HoldButton (SD-03)', () => {
  it('confirms only after a 1.5 s hold; releasing early cancels', () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    render(
      <HoldButton label="Hold to switch off" holdingLabel="Keep holding…" onConfirm={onConfirm} />,
    );
    const button = screen.getByRole('button');
    fireEvent.pointerDown(button);
    act(() => {
      vi.advanceTimersByTime(HOLD_MS - 100);
    });
    fireEvent.pointerUp(button);
    act(() => {
      vi.advanceTimersByTime(HOLD_MS);
    });
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.keyDown(button, { key: 'Enter' });
    expect(button.textContent).toContain('Keep holding…');
    act(() => {
      vi.advanceTimersByTime(HOLD_MS);
    });
    expect(onConfirm).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});

describe('Avatar', () => {
  it.each(Object.keys(AVATARS) as (keyof typeof AVATARS)[])(
    '%s has its character name as the accessible name',
    (id) => {
      render(<Avatar avatar={id} />);
      expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
        `Avatar: ${AVATARS[id].name} the ${AVATARS[id].what}`,
      );
    },
  );
});
