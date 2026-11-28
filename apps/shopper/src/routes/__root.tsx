import { BrandScope } from '@skipa/ui';
import { createRootRouteWithContext, Outlet, useRouter } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { ErrorScreen } from '../errors.tsx';
import { en } from '../i18n/en.ts';
import type { RouterContext } from '../router.tsx';

// Dev only: the scenario switcher for mocks. Compiled out of production builds.
const ScenarioBar =
  import.meta.env.VITE_USE_MOCKS === 'true' ? lazy(() => import('../dev/ScenarioBar.tsx')) : null;

function Root() {
  return (
    <>
      {/* Skipa-wide by default (BR-11); store routes wrap themselves in the store's brand (F1). */}
      <BrandScope
        brand="skipa"
        className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-page font-ui text-primary"
      >
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
    <BrandScope
      brand="skipa"
      className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center bg-page"
    >
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
