import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError, unauthorized } from './errors';

export type AdminAccessClaims = {
  sub: string;
  role: 'owner' | 'staff';
  typ: 'access';
  sid: string;
  aud: 'admin';
};

export type AdminRefreshClaims = {
  sub: string;
  role: 'owner' | 'staff';
  typ: 'refresh';
  sid: string;
  aud: 'admin';
};

export type CustomerAccessClaims = {
  sub: string;
  role: 'customer';
  typ: 'access';
  sid: string;
  aud: 'customer';
};

export type CustomerRefreshClaims = {
  sub: string;
  role: 'customer';
  typ: 'refresh';
  sid: string;
  aud: 'customer';
};

function requireJwtSecrets() {
  if (!env.JWT_ACCESS_SECRET || !env.JWT_REFRESH_SECRET) {
    throw unauthorized('AUTH_MISCONFIGURED', 'JWT secrets are not configured');
  }
  return {
    access: env.JWT_ACCESS_SECRET,
    refresh: env.JWT_REFRESH_SECRET,
  };
}

export function signAdminAccessToken(claims: Omit<AdminAccessClaims, 'typ' | 'aud'>) {
  const secrets = requireJwtSecrets();
  return jwt.sign(
    { ...claims, typ: 'access', aud: 'admin' },
    secrets.access,
    { expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn'] },
  );
}

export function signAdminRefreshToken(claims: Omit<AdminRefreshClaims, 'typ' | 'aud'>) {
  const secrets = requireJwtSecrets();
  return jwt.sign(
    { ...claims, typ: 'refresh', aud: 'admin' },
    secrets.refresh,
    { expiresIn: env.JWT_REFRESH_TTL as jwt.SignOptions['expiresIn'] },
  );
}

export function verifyAdminAccessToken(token: string): AdminAccessClaims {
  const secrets = requireJwtSecrets();
  try {
    const payload = jwt.verify(token, secrets.access) as AdminAccessClaims;
    if (payload.aud !== 'admin' || payload.typ !== 'access') {
      throw unauthorized('INVALID_TOKEN', 'Invalid access token');
    }
    if (payload.role !== 'owner' && payload.role !== 'staff') {
      throw unauthorized('INVALID_TOKEN', 'Invalid access token role');
    }
    return payload;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw unauthorized('INVALID_TOKEN', 'Invalid or expired access token');
  }
}

export function verifyAdminRefreshToken(token: string): AdminRefreshClaims {
  const secrets = requireJwtSecrets();
  try {
    const payload = jwt.verify(token, secrets.refresh) as AdminRefreshClaims;
    if (payload.aud !== 'admin' || payload.typ !== 'refresh') {
      throw unauthorized('INVALID_TOKEN', 'Invalid refresh token');
    }
    return payload;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw unauthorized('INVALID_TOKEN', 'Invalid or expired refresh token');
  }
}

export function signCustomerAccessToken(claims: Omit<CustomerAccessClaims, 'typ' | 'aud' | 'role'>) {
  const secrets = requireJwtSecrets();
  return jwt.sign(
    { ...claims, role: 'customer', typ: 'access', aud: 'customer' },
    secrets.access,
    { expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn'] },
  );
}

export function signCustomerRefreshToken(
  claims: Omit<CustomerRefreshClaims, 'typ' | 'aud' | 'role'>,
) {
  const secrets = requireJwtSecrets();
  return jwt.sign(
    { ...claims, role: 'customer', typ: 'refresh', aud: 'customer' },
    secrets.refresh,
    { expiresIn: env.JWT_REFRESH_TTL as jwt.SignOptions['expiresIn'] },
  );
}

export function verifyCustomerAccessToken(token: string): CustomerAccessClaims {
  const secrets = requireJwtSecrets();
  try {
    const payload = jwt.verify(token, secrets.access) as CustomerAccessClaims;
    if (payload.aud !== 'customer' || payload.typ !== 'access' || payload.role !== 'customer') {
      throw unauthorized('INVALID_TOKEN', 'Invalid access token');
    }
    return payload;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw unauthorized('INVALID_TOKEN', 'Invalid or expired access token');
  }
}

export function verifyCustomerRefreshToken(token: string): CustomerRefreshClaims {
  const secrets = requireJwtSecrets();
  try {
    const payload = jwt.verify(token, secrets.refresh) as CustomerRefreshClaims;
    if (payload.aud !== 'customer' || payload.typ !== 'refresh' || payload.role !== 'customer') {
      throw unauthorized('INVALID_TOKEN', 'Invalid refresh token');
    }
    return payload;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw unauthorized('INVALID_TOKEN', 'Invalid or expired refresh token');
  }
}

/** Rough expiry Date from TTL strings like 15m / 30d for session storage. */
export function ttlToDate(ttl: string, from = new Date()): Date {
  const match = /^(\d+)([smhd])$/i.exec(ttl.trim());
  if (!match) {
    return new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
  const n = Number(match[1]);
  const unit = match[2].toLowerCase();
  const ms =
    unit === 's'
      ? n * 1000
      : unit === 'm'
        ? n * 60 * 1000
        : unit === 'h'
          ? n * 60 * 60 * 1000
          : n * 24 * 60 * 60 * 1000;
  return new Date(from.getTime() + ms);
}
