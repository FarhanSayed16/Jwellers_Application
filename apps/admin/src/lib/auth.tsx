'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  api,
  clearTokens,
  persistTokens,
  getAccessToken,
  hydrateAccessToken,
  ApiClientError,
} from './api';
import type { AdminUser, FeatureFlags } from './types';

type AuthState = {
  admin: AdminUser | null;
  features: FeatureFlags | null;
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [features, setFeatures] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setAdmin(null);
      return;
    }
    const me = await api.get<AdminUser>('/auth/admin/me');
    setAdmin(me);
    try {
      const flags = await api.get<FeatureFlags>('/config/features', false);
      setFeatures(flags);
    } catch {
      setFeatures(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await hydrateAccessToken();
        if (await getAccessToken()) {
          await refreshMe();
        }
      } catch {
        await clearTokens();
        if (!cancelled) setAdmin(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshMe]);

  const login = useCallback(async (emailOrPhone: string, password: string) => {
    const data = await api.post<{
      accessToken: string;
      refreshToken: string;
      admin: AdminUser;
    }>(
      '/auth/admin/login',
      { emailOrPhone, password, deviceInfo: 'admin-web' },
      false,
    );
    await persistTokens(data.accessToken, data.refreshToken);
    setAdmin(data.admin);
    try {
      const flags = await api.get<FeatureFlags>('/config/features', false);
      setFeatures(flags);
    } catch {
      setFeatures(null);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (await getAccessToken()) {
        await api.post('/auth/admin/logout', {});
      }
    } catch (err) {
      if (!(err instanceof ApiClientError)) {
        // ignore network errors on logout
      }
    } finally {
      await clearTokens();
      setAdmin(null);
    }
  }, []);

  const value = useMemo(
    () => ({ admin, features, loading, login, logout, refreshMe }),
    [admin, features, loading, login, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
