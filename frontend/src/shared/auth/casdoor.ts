import Sdk from 'casdoor-js-sdk';

const API_URL = import.meta.env.VITE_API_URL ?? '';
const SERVER_URL = import.meta.env.VITE_CASDOOR_SERVER_URL;
const TOKEN_KEY = 'access_token';
const REDIRECT_KEY = 'redirect';
const STATE_KEY = 'casdoor-state';

const sdk = new Sdk({
  serverUrl: SERVER_URL,
  clientId: import.meta.env.VITE_CASDOOR_CLIENT_ID,
  appName: import.meta.env.VITE_CASDOOR_APP_NAME,
  organizationName: import.meta.env.VITE_CASDOOR_ORGANIZATION_NAME,
  redirectPath: '/callback',
});

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)).exp * 1000 > Date.now() ? token : null;
  } catch {
    return null;
  }
}

export function login(): void {
  const { pathname, search } = window.location;
  if (pathname !== '/callback') sessionStorage.setItem(REDIRECT_KEY, pathname + search);
  window.location.href = sdk.getSigninUrl();
}


export async function completeLogin(search: string): Promise<string> {
  const params = new URLSearchParams(search);
  const code = params.get('code');
  const state = params.get('state');
  const expected = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  if (!code || !expected || state !== expected) {
    throw new Error('Login link is invalid or expired.');
  }

  const res = await fetch(`${API_URL}/api/signin?${new URLSearchParams({ code, state })}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Could not sign you in.');
  const { access_token } = (await res.json()) as { access_token: string };
  localStorage.setItem(TOKEN_KEY, access_token);

  const redirect = sessionStorage.getItem(REDIRECT_KEY) ?? '/';
  sessionStorage.removeItem(REDIRECT_KEY);
  return redirect;
}

export async function logout(): Promise<void> {
  const token = localStorage.getItem(TOKEN_KEY);
  try {
    // No `credentials: 'include'`: Casdoor's CORS does not allow it, so the
    // browser would block the call. The Bearer token identifies the session.
    const res = await fetch(`${SERVER_URL}/api/sso-logout?logoutAll=true`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    // Casdoor reports failures as HTTP 200 with `status: "error"`.
    const body = await res.json();
    if (body.status !== 'ok') console.error('SSO logout failed:', body.msg);
  } catch (err) {
    console.error('SSO logout failed:', err);
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/';
  }
}
