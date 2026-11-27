import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';
import { getToken, login } from '@/shared/auth';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isCallback = useLocation({ select: (l) => l.pathname === '/callback' });
  const allowed = isCallback || getToken() !== null;

  useEffect(() => {
    if (!allowed) login();
  }, [allowed]);

  return allowed ? <Outlet /> : <p>Redirecting to sign in…</p>;
}
