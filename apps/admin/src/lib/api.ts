import type { ApiErrorBody, ApiSuccess } from './types';

const ACCESS_COOKIE = 'jwellers_admin_access';
const REFRESH_COOKIE = 'jwellers_admin_refresh';
const SESSION_COOKIE = 'jwellers_admin_session';

/** In-memory access token — prefer over localStorage; hydrate from httpOnly cookie. */
let memoryAccessToken: string | null = null;
let hydratePromise: Promise<string | null> | null = null;

function clearClientSessionCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=; path=/; Max-Age=0; SameSite=Lax`;
}

async function postSession(accessToken: string, refreshToken: string) {
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, refreshToken }),
    credentials: 'same-origin',
  });
}

async function deleteSession() {
  try {
    await fetch('/api/auth/session', { method: 'DELETE', credentials: 'same-origin' });
  } catch {
    // ignore
  }
}

/** Hydrate memory from httpOnly cookie via same-origin route. */
export async function hydrateAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (memoryAccessToken) return memoryAccessToken;
  if (!hydratePromise) {
    hydratePromise = (async () => {
      try {
        const res = await fetch('/api/auth/access', { credentials: 'same-origin' });
        if (!res.ok) return null;
        const json = (await res.json()) as { accessToken?: string | null };
        memoryAccessToken = json.accessToken ?? null;
        return memoryAccessToken;
      } catch {
        return null;
      } finally {
        hydratePromise = null;
      }
    })();
  }
  return hydratePromise;
}

export async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (memoryAccessToken) return memoryAccessToken;
  return hydrateAccessToken();
}

/** Sync peek of in-memory token only (no network). */
export function peekAccessToken(): string | null {
  return memoryAccessToken;
}

async function getRefreshTokenFromCookie(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/refresh', { credentials: 'same-origin' });
    if (!res.ok) return null;
    const json = (await res.json()) as { refreshToken?: string | null };
    return json.refreshToken ?? null;
  } catch {
    return null;
  }
}

export async function persistTokens(accessToken: string, refreshToken: string) {
  memoryAccessToken = accessToken;
  // Remove legacy localStorage tokens if present
  try {
    localStorage.removeItem(ACCESS_COOKIE);
    localStorage.removeItem(REFRESH_COOKIE);
  } catch {
    // ignore
  }
  await postSession(accessToken, refreshToken);
}

export async function clearTokens() {
  memoryAccessToken = null;
  try {
    localStorage.removeItem(ACCESS_COOKIE);
    localStorage.removeItem(REFRESH_COOKIE);
  } catch {
    // ignore
  }
  clearClientSessionCookie();
  await deleteSession();
}

export function apiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
  return base.replace(/\/$/, '');
}

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type RequestOpts = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  /** Skip refresh retry (internal) */
  _retried?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshTokenFromCookie();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${apiBaseUrl()}/auth/admin/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const json = (await res.json()) as ApiSuccess<{
      accessToken: string;
      refreshToken: string;
    }> | ApiErrorBody;
    if (!res.ok || !('success' in json) || !json.success) return false;
    await persistTokens(json.data.accessToken, json.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (opts.auth !== false) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${apiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
    method: opts.method || (opts.body ? 'POST' : 'GET'),
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const json = (await res.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiErrorBody
    | null;

  if (res.status === 401 && opts.auth !== false && !opts._retried) {
    if (!refreshPromise) {
      refreshPromise = tryRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    const ok = await refreshPromise;
    if (ok) {
      return apiRequest<T>(path, { ...opts, _retried: true });
    }
    await clearTokens();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.assign(`/login?reason=session&next=${next}`);
    }
  }

  if (!res.ok || !json || !('success' in json) || !json.success) {
    const err = json && 'error' in json ? json.error : undefined;
    throw new ApiClientError(
      res.status,
      err?.code || 'REQUEST_FAILED',
      err?.message || `Request failed (${res.status})`,
      err?.details,
    );
  }

  return json.data;
}

export const api = {
  get: <T>(path: string, auth = true) => apiRequest<T>(path, { method: 'GET', auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    apiRequest<T>(path, { method: 'POST', body, auth }),
  patch: <T>(path: string, body?: unknown, auth = true) =>
    apiRequest<T>(path, { method: 'PATCH', body, auth }),
  delete: <T>(path: string, auth = true) => apiRequest<T>(path, { method: 'DELETE', auth }),
};
