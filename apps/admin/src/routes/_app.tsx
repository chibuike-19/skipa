// Signed-in area: every route under `_app` needs a staff session (brief §4, RB-01). Without one
// the guard sends the user to /sign-in and brings them back afterwards.
import { Button, Sidebar, type RenderLink } from '@skipa/ui';
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
  useRouter,
} from '@tanstack/react-router';

import { useEffect } from 'react';

import { en } from '../i18n/en.ts';
import { NAV } from '../nav.ts';
import { sessionQuery, useSignOut, useStaff } from '../session.ts';

/** Sidebar links go through the router (no full page loads). */
const routerLink: RenderLink = ({ href, children, ...rest }) =>
  href === '/' ? (
    <Link to="/" {...rest}>
      {children}
    </Link>
  ) : (
    <Link to="/$" params={{ _splat: href.slice(1) }} {...rest}>
      {children}
    </Link>
  );

function AppLayout() {
  const staff = useStaff();
  const signOut = useSignOut();
  const router = useRouter();
  const section = `/${useLocation({ select: (l) => l.pathname }).split('/')[1] ?? ''}`;
  // Session ended (sign-out, or AUTH-001 from any call): re-run the guard, which redirects to
  // sign-in once with `next` set to this page.
  useEffect(() => {
    if (staff === null) void router.invalidate();
  }, [staff, router]);
  if (staff === null) return null;
  return (
    <div className="flex min-h-dvh">
      <Sidebar
        label={en.nav.label}
        product={en.nav.product}
        items={NAV}
        currentHref={section}
        renderLink={routerLink}
        className="sticky top-0 h-dvh shrink-0 overflow-y-auto"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 bg-surface px-6 py-3 shadow-1">
          <span className="t-caption text-secondary">{en.shell.signedInAs(staff.name)}</span>
          <Button
            variant="secondary"
            size="sm"
            label={en.common.signOut}
            icon="power"
            onClick={() => {
              void signOut();
            }}
          />
        </header>
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    const staff = await context.queryClient.query(sessionQuery);
    if (staff === null) throw redirect({ to: '/sign-in', search: { next: location.href } });
    return { staff };
  },
  component: AppLayout,
});
