// F0 shell page. Overview (Admin-A02: SA-02, SA-06) replaces it in F6.
import { createFileRoute } from '@tanstack/react-router';

import { en } from '../../i18n/en.ts';

function Overview() {
  return (
    <main className="flex flex-col gap-3 p-6">
      <h1 className="t-d-h1 m-0">{en.nav.overview}</h1>
      <p className="t-body m-0 text-secondary">{en.shell.placeholder}</p>
    </main>
  );
}

export const Route = createFileRoute('/_app/')({ component: Overview });
