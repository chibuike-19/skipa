// Icon set from the canvas (05 Components · Icon, 63 glyphs; the brief says 61, the canvas has 63).
// 24 × 24 stroke icons drawn as one path each; stroke 2 (1.75 at 32 px and up), round caps.
// Paths are copied from the canvas source unchanged.
import type { CSSProperties } from 'react';

const C = (cx: number, cy: number, r: number): string =>
  `M${String(cx - r)} ${String(cy)}a${String(r)} ${String(r)} 0 1 0 ${String(2 * r)} 0a${String(r)} ${String(r)} 0 1 0 ${String(-2 * r)} 0`;
const ring = C(12, 12, 9);

export const GLYPHS = {
  scan: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10',
  barcode: 'M5 6v12M8 6v12M11 6v12M14 6v12M17 6v12M19.5 6v12',
  qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2',
  cart: 'M3 4h2l2.4 11h10.2L20 7H6.2' + C(9, 20, 1) + C(17, 20, 1),
  receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3',
  exit: 'M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5M10 16l4-4-4-4M14 12H4',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.9l-5.25 2.7 1-5.8L3.5 9.7l5.9-.9z',
  'star-filled': 'M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.9l-5.25 2.7 1-5.8L3.5 9.7l5.9-.9z',
  help: ring + 'M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01',
  chat: 'M4 5h16v11H9l-5 4z',
  support:
    'M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H5a1 1 0 0 1-1-1zM20 14h-3v5h2a1 1 0 0 0 1-1zM17 19c0 1.2-1.8 2-5 2',
  offline:
    'M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.7M14.5 10.4A10 10 0 0 1 19 13M2 9.5a15 15 0 0 1 4.5-2.9M10.5 5.1A15 15 0 0 1 22 9.5M12 20h.01',
  online: 'M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0M2 9.5a15 15 0 0 1 20 0M12 20h.01',
  card: 'M3 6h18v12H3zM3 10h18M7 15h3',
  transfer: 'M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',
  ussd: 'M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9.5 8h.01M12 8h.01M14.5 8h.01M9.5 11.5h.01M12 11.5h.01M14.5 11.5h.01M10 16h4',
  check: 'M5 12.5l4.5 4.5L19 7',
  'check-circle': ring + 'M8 12.5l2.8 2.8L16 10',
  close: 'M6 6l12 12M18 6L6 18',
  'x-circle': ring + 'M9 9l6 6M15 9l-6 6',
  alert: 'M12 4l9 16H3zM12 10v4M12 17h.01',
  info: ring + 'M12 11v5M12 8h.01',
  clock: ring + 'M12 7v5l3 2',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  search: C(11, 11, 7) + 'M20 20l-4-4',
  'chevron-left': 'M15 6l-6 6 6 6',
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-down': 'M6 9l6 6 6-6',
  'chevron-up': 'M6 15l6-6 6 6',
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  'arrow-left': 'M19 12H5M11 6l-6 6 6 6',
  user: C(12, 8, 4) + 'M4 20a8 8 0 0 1 16 0',
  store:
    'M4 9l1.5-5h13L20 9M4 9h16v1.5a2.7 2.7 0 0 1-5.3 0 2.7 2.7 0 0 1-5.4 0A2.7 2.7 0 0 1 4 10.5zM5 13v7h14v-7M10 20v-4h4v4',
  settings: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M16 4v4M10 10v4M18 16v4',
  refresh: 'M20 11a8 8 0 0 0-14.6-4M4 4v4h4M4 13a8 8 0 0 0 14.6 4M20 20v-4h-4',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  upload: 'M12 20V9M7 14l5-5 5 5M5 4h14',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z' + C(12, 12, 3),
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  phone:
    'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  filter: 'M4 5h16l-6 7v6l-4 2v-8z',
  sort: 'M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  home: 'M4 11l8-7 8 7M6 9.5V20h12V9.5',
  chart: 'M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6',
  live: 'M3 12h4l3-7 4 14 3-7h4',
  scale: 'M5 20h14M12 4v16M7 8h10M7 8l-3 6a3 3 0 0 0 6 0zM17 8l-3 6a3 3 0 0 0 6 0z',
  box: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8',
  torch: 'M8 3h8v5l-2 3v10h-4V11L8 8zM8 6h8',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4z' + C(12, 13.5, 3.5),
  power: 'M12 3v8M7 6a7 7 0 1 0 10 0',
  send: 'M4 12l16-8-6 16-2.5-6.5z',
  copy: 'M8 8h12v12H8zM4 16V4h12',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  menu: 'M4 6h16M4 12h16M4 18h16',
  refund: 'M9 14l-5-5 5-5M4 9h10a6 6 0 0 1 0 12h-3',
  tag: 'M3 12V4h8l9 9-8 8zM7.5 8h.01',
  pin: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z' + C(12, 10, 2.4),
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
} as const;

export type Glyph = keyof typeof GLYPHS;

export interface IconProps {
  glyph: Glyph;
  /** px, default 24 */
  size?: number;
  /** Accessible name. Omit for decorative icons (the usual case: a visible word sits next to it). */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ glyph, size = 24, label, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={glyph === 'star-filled' ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={size >= 32 ? 1.75 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flex: 'none', ...style }}
      {...(label === undefined ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
    >
      <path d={GLYPHS[glyph]} />
    </svg>
  );
}
