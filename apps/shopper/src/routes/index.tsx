// F0 shell page. Skipa home (SH-F10: Home, Stores, Support, Profile) replaces it in F1.
import { SkipaHeader, SkeletonRows } from '@skipa/ui';
import { createFileRoute } from '@tanstack/react-router';

import { en } from '../i18n/en.ts';
import { useSession } from '../session.tsx';

function Shell() {
  const session = useSession();
  return (
    <>
      <SkipaHeader
        avatar={
          session.shopper === null
            ? undefined
            : { id: session.shopper.avatar, onClick: () => undefined }
        }
      />
      <main className="flex flex-col gap-3 p-4">
        <h1 className="t-h1 m-0">{en.shell.title}</h1>
        <p className="t-body m-0 text-secondary">{en.shell.body}</p>
        {session.status === 'loading' ? (
          <SkeletonRows rows={1} label="" />
        ) : (
          <p className="t-body m-0">
            {session.shopper === null ? en.shell.guest : en.shell.registered(session.shopper.name)}
          </p>
        )}
      </main>
    </>
  );
}

export const Route = createFileRoute('/')({ component: Shell });
