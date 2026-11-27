import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { completeLogin, login } from '@/shared/auth';

export const Route = createFileRoute('/callback')({
  component: CallbackRoute,
});

function CallbackRoute() {
  const ran = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    completeLogin(window.location.search)
      .then((path) => window.location.replace(path))
      .catch((err: Error) => setError(err.message));
  }, []);

  if (!error) return <p role="status">Signing you in…</p>;

  return (
    <div role="alert">
      <p>{error}</p>
      <button type="button" onClick={login}>
        Sign in again
      </button>
    </div>
  );
}
