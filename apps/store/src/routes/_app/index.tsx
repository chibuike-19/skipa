// The dashboard opens on Live (brief §6.3).
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/')({
  beforeLoad: () => {
    throw redirect({ to: '/$', params: { _splat: 'live' }, replace: true });
  },
});
