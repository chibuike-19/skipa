// Signed-in area: every route under `_app` needs a staff session (brief §4, RB-01). Without one
// the guard sends the checker to /sign-in and brings them back afterwards.
import { Button, Wordmark } from '@skipa/ui';
import { createFileRoute, Outlet, redirect, useRouter } from '@tanstack/react-router';

import { useEffect } from 'react';

import { en } from '../i18n/en.ts';
import { sessionQuery, useSignOut, useStaff } from '../session.ts';

function AppLayout() {
  const staff = useStaff();
  const signOut = useSignOut();
  const router = useRouter();
  // Session ended (sign-out, or AUTH-001 from any call): re-run the guard, which redirects to
  // sign-in once with `next` set to this page.
  useEffect(() => {
    if (staff === null) void router.invalidate();
  }, [staff, router]);
  if (staff === null) return null;
  return (
    <>
      <header className="flex items-center justify-between gap-3 bg-surface px-4 py-3 shadow-1">
        <Wordmark height={24} />
        <div className="flex items-center gap-3">
          <span className="t-caption text-secondary">{en.shell.signedInAs(staff.name)}</span>
          <Button
            variant="secondary"
            size="md"
            label={en.common.signOut}
            icon="power"
            onClick={() => {
              void signOut();
            }}
          />
        </div>
      </header>
      <Outlet />
    </>
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
