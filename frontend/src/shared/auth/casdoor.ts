import Sdk from 'casdoor-js-sdk';

const API_URL = import.meta.env.VITE_API_URL ?? '';
const SERVER_URL = import.meta.env.VITE_CASDOOR_SERVER_URL;
const TOKEN_KEY = 'access_token';
const REDIRECT_KEY = 'redirect';
const STATE_KEY = 'casdoor-state';

export interface CasdoorProfile {
  name?: string;
  displayName?: string;
  // firstName?: string;
  // lastName?: string;
  email?: string;
  avatar?: string;
}

const casdoorConfig = {
  serverUrl: SERVER_URL,
  clientId: import.meta.env.VITE_CASDOOR_CLIENT_ID,
  appName: import.meta.env.VITE_CASDOOR_APP_NAME,
  organizationName: import.meta.env.VITE_CASDOOR_ORGANIZATION_NAME,
  redirectPath: '/callback',
};

const hasCasdoorConfig = Object.values(casdoorConfig).every(
  (value) => typeof value === 'string' && value.length > 0,
);

const sdk = hasCasdoorConfig ? new Sdk(casdoorConfig) : null;

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isAuthConfigured(): boolean {
  return hasCasdoorConfig;
}

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const payload = parseJwt(token);
  const exp = typeof payload?.exp === 'number' ? payload.exp : null;
  return exp && exp * 1000 > Date.now() ? token : null;
}

export function getProfile(): CasdoorProfile | null {
  const token = getToken();
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;

  return {
    name: typeof payload.name === 'string' ? payload.name : undefined,
    displayName: typeof payload.displayName === 'string' ? payload.displayName : undefined,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    avatar: typeof payload.avatar === 'string' ? payload.avatar : undefined,
  };
}

export function login(): void {
  if (!sdk) {
    console.error('Casdoor auth is not configured. Set VITE_CASDOOR_* env vars.');
    return;
  }
  const { pathname, search } = window.location;
  if (pathname !== '/callback') sessionStorage.setItem(REDIRECT_KEY, pathname + search);
  const signinUrl = sdk.getSigninUrl();
  const state = new URL(signinUrl).searchParams.get('state');
  if (state) sessionStorage.setItem(STATE_KEY, state);
  window.location.href = signinUrl;
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
    const res = await fetch(`${SERVER_URL}/api/sso-logout?logoutAll=true`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    if (body.status !== 'ok') console.error('SSO logout failed:', body.msg);
  } catch (err) {
    console.error('SSO logout failed:', err);
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/';
  }
}
