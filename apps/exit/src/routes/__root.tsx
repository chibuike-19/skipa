import { BrandScope } from '@skipa/ui';
import { createRootRouteWithContext, Outlet, useRouter } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { ErrorScreen } from '../errors.tsx';
import { en } from '../i18n/en.ts';
import type { RouterContext } from '../router.tsx';

// Dev only: the scenario switcher for mocks. Compiled out of production builds.
const ScenarioBar =
  import.meta.env.VITE_USE_MOCKS === 'true' ? lazy(() => import('../dev/ScenarioBar.tsx')) : null;

// Exit mode is never store-branded (BR-06): Skipa chrome, fixed --color-exit-* results.
const FRAME = 'mx-auto flex min-h-dvh max-w-[834px] flex-col bg-page font-ui text-primary';

function Root() {
  return (
    <>
      <BrandScope brand="skipa" className={FRAME}>
        <Outlet />
      </BrandScope>
      {ScenarioBar !== null && (
        <Suspense>
          <ScenarioBar />
        </Suspense>
      )}
    </>
  );
}

function RouteError({ error, reset }: { error: unknown; reset: () => void }) {
  const router = useRouter();
  return (
    <BrandScope brand="skipa" className={`${FRAME} justify-center`}>
      <main>
        <ErrorScreen
          error={error}
          onRetry={() => {
            reset();
            void router.invalidate();
          }}
          onHome={() => {
            void router.navigate({ to: '/' });
          }}
        />
      </main>
    </BrandScope>
  );
}

function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="t-h2 m-0">{en.notFound.title}</h1>
      <p className="t-body m-0 text-secondary">{en.notFound.body}</p>
    </main>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Root,
  errorComponent: RouteError,
  notFoundComponent: NotFound,
});
