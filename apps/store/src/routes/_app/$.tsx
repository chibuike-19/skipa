// F0 placeholder for every sidebar section; each is replaced by its own route files in F5.
import { createFileRoute, notFound } from '@tanstack/react-router';

import { en } from '../../i18n/en.ts';
import { NAV } from '../../nav.ts';

function Section() {
  const { item } = Route.useLoaderData();
  return (
    <main className="flex flex-col gap-3 p-6">
      <h1 className="t-d-h1 m-0">{item.label}</h1>
      <p className="t-body m-0 text-secondary">{en.shell.placeholder}</p>
    </main>
  );
}

export const Route = createFileRoute('/_app/$')({
  loader: ({ params }) => {
    const href = `/${params._splat?.split('/')[0] ?? ''}`;
    const item = NAV.find((i) => i.href === href && href !== '/');
    if (item === undefined) throw notFound();
    return { item };
  },
  component: Section,
});
