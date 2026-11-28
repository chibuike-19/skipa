// Avatar art (canvas Avatar, D-13): five original market-basket characters, 100 × 100 viewBox.
// Copied from the canvas source by converting SVG attributes to JSX; colours are artwork
// (canvas Design review: avatars are SVG art), so this folder is exempt from the raw-colour rule.
import type { ReactNode } from 'react';

export const AVATAR_ART: Record<'tomato' | 'carton' | 'pepper' | 'onion' | 'tin', ReactNode> = {
  tomato: (
    <>
      <rect width="100" height="100" fill="#7CC6B4" />
      <path
        d="M16 104 C16 86 30 77 50 77 C70 77 84 86 84 104 Z"
        fill="#2F4A8A"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M42 78 Q50 85 58 78"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M66 88 L66 104"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 66 L56 66 L56 80 Q50 83 44 80 Z"
        fill="#C93A2E"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M50 26 C64 26 76 36 76 51 C76 66 64 75 50 75 C36 75 24 66 24 51 C24 36 36 26 50 26 Z"
        fill="#E5483A"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <ellipse
        cx="33"
        cy="42"
        rx="3.2"
        ry="6"
        fill="#FFFFFF"
        opacity="0.6"
        transform="rotate(28 33 42)"
      />
      <path
        d="M50 29 C46 22 39 22 35 25 C40 26 43 28 45 29.5 C41 30 38.5 32 37.5 35 C42 33 46 32 50 31.5 C54 32 58 33 62.5 35 C61.5 32 59 30 55 29.5 C57 28 60 26 65 25 C61 22 54 22 50 29 Z"
        fill="#3E9B4F"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M50 29 C50 23 52 19 55 17"
        fill="none"
        stroke="#1E1610"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 29 C50 23 52 19 55 17"
        fill="none"
        stroke="#3E9B4F"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M35.5 42 Q39.5 39 44 40.5"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M56 40.5 Q60.5 39 64.5 42"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="41"
        cy="50"
        r="6.4"
        fill="#FFFFFF"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="42.2" cy="49" r="2.88" fill="#1E1610" />
      <circle cx="43.2" cy="47.9" r="1" fill="#FFFFFF" />
      <circle
        cx="59"
        cy="50"
        r="6.4"
        fill="#FFFFFF"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="60.2" cy="49" r="2.88" fill="#1E1610" />
      <circle cx="61.2" cy="47.9" r="1" fill="#FFFFFF" />
      <path
        d="M40 58 Q50 70 60 58 Q50 61 40 58 Z"
        fill="#5A1A14"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M45.5 63.2 Q50 60.6 54.5 63.2 Q50 66.6 45.5 63.2 Z" fill="#F59A9A" />
    </>
  ),
  carton: (
    <>
      <rect width="100" height="100" fill="#F2C14E" />
      <path
        d="M16 104 C16 86 30 77 50 77 C70 77 84 86 84 104 Z"
        fill="#E0603A"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M42 78 Q50 85 58 78"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M66 88 L66 104"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 66 L56 66 L56 80 Q50 83 44 80 Z"
        fill="#E9E2D2"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M37 13 L63 13 L63 20 L37 20 Z"
        fill="#FFFFFF"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M31 33 L37 20 L63 20 L69 33 Z"
        fill="#ECE6D8"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M50 20 L50 33"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31 33 L69 33 L69 72 Q69 74 67 74 L33 74 Q31 74 31 72 Z"
        fill="#FFFFFF"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M31 62 L69 62 L69 71 L31 71 Z"
        fill="#3E6FD8"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M35 66.5 Q39 63.5 43 66.5 T51 66.5 T59 66.5 T67 66.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="34" y="37" width="3" height="20" rx="1.5" fill="#ECE6D8" />
      <path
        d="M37.5 39.5 Q41.5 37 45.5 39"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M54.5 39 Q58.5 37 62.5 39.5"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="42"
        cy="47"
        r="6.4"
        fill="#FFFFFF"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="42" cy="47" r="2.88" fill="#1E1610" />
      <circle cx="43" cy="45.9" r="1" fill="#FFFFFF" />
      <circle
        cx="58"
        cy="47"
        r="6.4"
        fill="#FFFFFF"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="58" cy="47" r="2.88" fill="#1E1610" />
      <circle cx="59" cy="45.9" r="1" fill="#FFFFFF" />
      <circle cx="36.5" cy="55" r="2.6" fill="#F7A9A9" />
      <circle cx="63.5" cy="55" r="2.6" fill="#F7A9A9" />
      <ellipse cx="50" cy="56" rx="3" ry="3.6" fill="#5A1A14" stroke="#1E1610" strokeWidth="2.2" />
    </>
  ),
  pepper: (
    <>
      <rect width="100" height="100" fill="#B7A6E6" />
      <path
        d="M16 104 C16 86 30 77 50 77 C70 77 84 86 84 104 Z"
        fill="#2E8C6A"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M42 78 Q50 85 58 78"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M66 88 L66 104"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 66 L56 66 L56 80 Q50 83 44 80 Z"
        fill="#D9600F"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M26 51 C24 39 32 31 40 33 C43 28 57 28 60 33 C68 31 76 39 74 51 C76 61 70 72 60 72 C56 76 44 76 40 72 C30 72 24 62 26 51 Z"
        fill="#F2751C"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M40 35 Q42.5 44 40.5 52"
        fill="none"
        stroke="#C95A10"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M60 35 Q57.5 44 59.5 52"
        fill="none"
        stroke="#C95A10"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="32"
        cy="44"
        rx="2.6"
        ry="5"
        fill="#FFFFFF"
        opacity="0.55"
        transform="rotate(20 32 44)"
      />
      <path
        d="M42 33 Q50 27 58 33 Q50 36 42 33 Z"
        fill="#3E9B4F"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M50 30 C50 23 53 19 59 18"
        fill="none"
        stroke="#1E1610"
        strokeWidth="6.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 30 C50 23 53 19 59 18"
        fill="none"
        stroke="#3E9B4F"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M35.5 48 Q40.5 44 45.5 48"
        fill="none"
        stroke="#1E1610"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M54 38.5 Q59 35.5 64 38.5"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="59"
        cy="47.5"
        r="6.4"
        fill="#FFFFFF"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="59.6" cy="47.9" r="2.88" fill="#1E1610" />
      <circle cx="60.6" cy="46.8" r="1" fill="#FFFFFF" />
      <path
        d="M53 60.5 Q54 69 58.8 67.4 Q62 65.5 58.8 59 Z"
        fill="#F59A9A"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M39.5 58 Q50 64.5 62 55.5"
        fill="none"
        stroke="#1E1610"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  onion: (
    <>
      <rect width="100" height="100" fill="#F08A5D" />
      <path
        d="M16 104 C16 86 30 77 50 77 C70 77 84 86 84 104 Z"
        fill="#F5C542"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M42 78 Q50 85 58 78"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M66 88 L66 104"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 66 L56 66 L56 80 Q50 83 44 80 Z"
        fill="#7E3E8C"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M50 25 C48 17 44 13 39 12"
        fill="none"
        stroke="#1E1610"
        strokeWidth="6.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 25 C48 17 44 13 39 12"
        fill="none"
        stroke="#56A85A"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 25 C52 16 56 12 62 11"
        fill="none"
        stroke="#1E1610"
        strokeWidth="6.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 25 C52 16 56 12 62 11"
        fill="none"
        stroke="#56A85A"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 22 C55 31 75 38 75 55 C75 68 64 76 50 76 C36 76 25 68 25 55 C25 38 45 31 50 22 Z"
        fill="#9A4FA8"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M49 27 C45 37 35 45 35 57"
        fill="none"
        stroke="#C88AD3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M51 27 C55 37 65 45 65 57"
        fill="none"
        stroke="#C88AD3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="34"
        cy="47"
        rx="2.6"
        ry="5"
        fill="#FFFFFF"
        opacity="0.5"
        transform="rotate(25 34 47)"
      />
      <path
        d="M37 53 Q41 48 45 53"
        fill="none"
        stroke="#1E1610"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M55 53 Q59 48 63 53"
        fill="none"
        stroke="#1E1610"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="36" cy="60" rx="3.6" ry="2.3" fill="#F49AB8" />
      <ellipse cx="64" cy="60" rx="3.6" ry="2.3" fill="#F49AB8" />
      <path
        d="M44.5 59 Q50 66 55.5 59 Z"
        fill="#5A1A14"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </>
  ),
  tin: (
    <>
      <rect width="100" height="100" fill="#8FC3EE" />
      <path
        d="M16 104 C16 86 30 77 50 77 C70 77 84 86 84 104 Z"
        fill="#3B3F8C"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M42 78 Q50 85 58 78"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M66 88 L66 104"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 66 L56 66 L56 80 Q50 83 44 80 Z"
        fill="#AEB6C0"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M30 30 L70 30 L70 74 L30 74 Z"
        fill="#D6DCE3"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M30 51 L70 51 L70 71 L30 71 Z"
        fill="#E24C3B"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <ellipse
        cx="50"
        cy="30"
        rx="20"
        ry="5"
        fill="#EEF1F4"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <ellipse cx="57" cy="29" rx="4.6" ry="2" fill="none" stroke="#1E1610" strokeWidth="2" />
      <circle cx="51" cy="29.6" r="1.4" fill="#1E1610" />
      <rect x="33" y="36" width="3" height="12" rx="1.5" fill="#FFFFFF" opacity="0.8" />
      <path
        d="M34.5 42 L30.5 41"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M65.5 42 L69.5 41"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M47.5 42 Q50 40.5 52.5 42"
        fill="none"
        stroke="#1E1610"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="41"
        cy="42"
        r="6.4"
        fill="#FFFFFF"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="41.4" cy="42.6" r="2.88" fill="#1E1610" />
      <circle cx="42.4" cy="41.5" r="1" fill="#FFFFFF" />
      <circle
        cx="59"
        cy="42"
        r="6.4"
        fill="#FFFFFF"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="59.4" cy="42.6" r="2.88" fill="#1E1610" />
      <circle cx="60.4" cy="41.5" r="1" fill="#FFFFFF" />
      <path
        d="M39 56.5 Q50 69 61 56.5 Z"
        fill="#5A1A14"
        stroke="#1E1610"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M41.6 57.7 L58.4 57.7 L57.2 60.5 L42.8 60.5 Z" fill="#FFFFFF" />
    </>
  ),
};
