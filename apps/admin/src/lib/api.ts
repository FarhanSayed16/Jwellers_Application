import type { ApiErrorBody, ApiSuccess } from './types';

const ACCESS_KEY = 'jwellers_admin_access';
const REFRESH_KEY = 'jwellers_admin_refresh';
const SESSION_COOKIE = 'jwellers_admin_session';

/** MVP: tokens in localStorage (document risk). Prefer httpOnly cookie later. */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setSessionCookies() {
  document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax`;
}

export function clearSessionCookies() {
  document.cookie = `${SESSION_COOKIE}=; path=/; Max-Age=0; SameSite=Lax`;
}

export function persistTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  setSessionCookies();
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  clearSessionCookies();
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
  const refreshToken = getRefreshToken();
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
    persistTokens(json.data.accessToken, json.data.refreshToken);
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
    const token = getAccessToken();
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
    clearTokens();
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
