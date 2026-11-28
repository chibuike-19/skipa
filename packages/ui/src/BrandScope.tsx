// Store theming at runtime (brief §9, AD §8.7). Check-in returns branch.brand (BrandTokens); a
// store route wraps its screens in <BrandScope brand={brand}>, which sets the nine brand slots on
// one container (data-brand="store"). Skipa-wide screens use brand="skipa" (BR-11). Status, pay,
// exit and dashboard colours are separate tokens and never change here (BR-06).
//
// Sheets, dialogs and tooltips render in a portal; portals to <body> would leave the brand scope
// and fall back to Skipa's colours. BrandScope provides its element as the portal container.
import { createContext, useContext, useState, type CSSProperties, type ReactNode } from 'react';

import { cx } from './cx.ts';

/** BrandTokens colour fields (the contract's schema; logo URLs and copy are used elsewhere). */
export interface BrandColours {
  primary: string;
  primaryHover: string;
  primaryPressed: string;
  onPrimary: string;
  primaryText: string;
  primarySubtle: string;
  accent: string;
  onAccent: string;
  accentSubtle: string;
}

/** 'skipa' for Skipa-wide screens; tokens from the API for a store; named modes for design proofs. */
export type Brand = 'skipa' | 'adunni' | 'harbour' | BrandColours;

const PortalContainer = createContext<HTMLElement | null>(null);

/** The element overlays portal into, so they keep the brand they were opened in. */
export function usePortalContainer(): HTMLElement | undefined {
  return useContext(PortalContainer) ?? undefined;
}

export function brandStyle(brand: BrandColours): CSSProperties {
  return {
    '--color-brand-primary': brand.primary,
    '--color-brand-primary-hover': brand.primaryHover,
    '--color-brand-primary-pressed': brand.primaryPressed,
    '--color-brand-on-primary': brand.onPrimary,
    '--color-brand-primary-text': brand.primaryText,
    '--color-brand-primary-subtle': brand.primarySubtle,
    '--color-brand-accent': brand.accent,
    '--color-brand-on-accent': brand.onAccent,
    '--color-brand-accent-subtle': brand.accentSubtle,
  } as CSSProperties;
}

export interface BrandScopeProps {
  brand: Brand;
  children: ReactNode;
  className?: string;
}

export function BrandScope({ brand, children, className }: BrandScopeProps) {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const store = typeof brand === 'object';
  return (
    <div
      ref={setEl}
      data-brand={store ? 'store' : brand}
      style={store ? brandStyle(brand) : undefined}
      className={cx('sk', className)}
    >
      <PortalContainer.Provider value={el}>{children}</PortalContainer.Provider>
    </div>
  );
}
