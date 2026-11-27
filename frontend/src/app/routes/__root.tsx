import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';
import { getToken, isAuthConfigured, login } from '@/shared/auth';
import { Header } from '@/widgets/header';
import { Footer } from '@/widgets/footer';

function RootLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-white text-slate-900">
            <Header />
            <div className="flex-1">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isCallback = useLocation({ select: (l) => l.pathname === '/callback' });
  const authConfigured = isAuthConfigured();
  const allowed = !authConfigured || isCallback || getToken() !== null;

  useEffect(() => {
    if (authConfigured && !allowed) login();
  }, [allowed, authConfigured]);

  if (isCallback) return <Outlet />;
  if (!allowed) return <p>Redirecting to sign in…</p>;

  return <RootLayout />;
}
