// F0 shell page. The scanner (Exit-F02: ready, checking, type receipt number) replaces it in F4.
import { createFileRoute } from '@tanstack/react-router';

import { en } from '../../i18n/en.ts';

function Shell() {
  return (
    <main className="flex flex-1 flex-col gap-3 p-4">
      <h1 className="t-h1 m-0">{en.shell.title}</h1>
      <p className="t-body m-0 text-secondary">{en.shell.body}</p>
    </main>
  );
}

export const Route = createFileRoute('/_app/')({ component: Shell });
