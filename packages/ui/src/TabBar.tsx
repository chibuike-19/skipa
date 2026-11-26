// TabBar (canvas C-Shopper · TabBar): Skipa home's four tabs (D-10). Always Skipa's colours.
import { cx } from './cx.ts';
import { Icon, type Glyph } from './Icon.tsx';
import { defaultLink, type RenderLink } from './link.tsx';

export type HomeTab = 'home' | 'stores' | 'support' | 'profile';

export interface TabBarItem {
  id: HomeTab;
  href: string;
  label: string;
  /** Unread count, e.g. a store replied in Support. */
  badge?: { count: number; label: string };
}

const GLYPH: Record<HomeTab, Glyph> = {
  home: 'home',
  stores: 'search',
  support: 'support',
  profile: 'user',
};

export interface TabBarProps {
  items: TabBarItem[];
  active: HomeTab;
  /** Accessible name for the nav. */
  label?: string;
  renderLink?: RenderLink;
  className?: string;
}

export function TabBar({
  items,
  active,
  label = 'Skipa',
  renderLink = defaultLink,
  className,
}: TabBarProps) {
  return (
    <nav
      aria-label={label}
      className={cx(
        'sk grid h-[68px] grid-cols-4 border-t border-subtle bg-surface font-ui',
        className,
      )}
    >
      {items.map((t) => {
        const on = t.id === active;
        return (
          <span key={t.id} className="relative flex">
            {renderLink({
              href: t.href,
              'aria-current': on ? 'page' : undefined,
              className: cx(
                'flex min-h-[48px] flex-1 flex-col items-center justify-center gap-[2px] no-underline outline-none focus-visible:shadow-focus',
                on ? 'text-skipa-primary' : 'text-secondary',
              ),
              children: (
                <>
                  <span
                    className={cx(
                      'flex h-[30px] w-[56px] items-center justify-center rounded-pill',
                      on && 'bg-(--indigo-100)',
                    )}
                  >
                    <Icon glyph={GLYPH[t.id]} size={22} />
                  </span>
                  <span className={cx('text-[12px]/[16px]', on ? 'font-bold' : 'font-medium')}>
                    {t.label}
                  </span>
                  {t.badge !== undefined && t.badge.count > 0 && (
                    <span
                      aria-label={t.badge.label}
                      className="absolute top-[6px] left-[calc(50%+10px)] h-[16px] min-w-[16px] rounded-[8px] bg-status-error px-1 text-center text-[10px]/[16px] font-bold text-status-on-error"
                    >
                      {t.badge.count}
                    </span>
                  )}
                </>
              ),
            })}
          </span>
        );
      })}
    </nav>
  );
}
