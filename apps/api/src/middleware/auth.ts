import type { NextFunction, Request, Response } from 'express';
import { AdminUserModel } from '../db/models/AdminUser';
import { CustomerModel } from '../db/models/Customer';
import { SessionModel } from '../db/models/Session';
import { forbidden, unauthorized } from '../utils/errors';
import { verifyAdminAccessToken, verifyCustomerAccessToken } from '../utils/jwt';

export type AdminAuthUser = {
  id: string;
  role: 'owner' | 'staff';
  sessionId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type CustomerAuthUser = {
  id: string;
  role: 'customer';
  sessionId: string;
  phone: string;
  name?: string | null;
};

declare global {
  namespace Express {
    interface Request {
      admin?: AdminAuthUser;
      customer?: CustomerAuthUser;
    }
  }
}

function extractBearer(req: Request): string | null {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractBearer(req);
    if (!token) {
      return next(unauthorized('AUTH_REQUIRED', 'Admin authentication is required'));
    }

    const claims = verifyAdminAccessToken(token);
    const session = await SessionModel.findById(claims.sid).exec();
    if (!session || session.userType !== 'admin' || session.revokedAt) {
      return next(unauthorized('SESSION_REVOKED', 'Session is invalid or revoked'));
    }
    if (session.expiresAt.getTime() < Date.now()) {
      return next(unauthorized('SESSION_EXPIRED', 'Session expired'));
    }

    const user = await AdminUserModel.findById(claims.sub).exec();
    if (!user || !user.isActive || user.deletedAt) {
      return next(unauthorized('USER_INACTIVE', 'Admin user not found or inactive'));
    }
    if (user.role !== claims.role) {
      return next(unauthorized('INVALID_TOKEN', 'Token role mismatch'));
    }

    req.admin = {
      id: String(user._id),
      role: user.role,
      sessionId: String(session._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
    };
    return next();
  } catch (err) {
    return next(err);
  }
}

export async function requireOwner(req: Request, res: Response, next: NextFunction) {
  await requireAdmin(req, res, (err?: unknown) => {
    if (err) return next(err);
    if (req.admin?.role !== 'owner') {
      return next(forbidden('OWNER_REQUIRED', 'Owner role is required for this action'));
    }
    return next();
  });
}

export async function requireCustomer(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractBearer(req);
    if (!token) {
      return next(unauthorized('AUTH_REQUIRED', 'Customer authentication is required'));
    }

    const claims = verifyCustomerAccessToken(token);
    const session = await SessionModel.findById(claims.sid).exec();
    if (!session || session.userType !== 'customer' || session.revokedAt) {
      return next(unauthorized('SESSION_REVOKED', 'Session is invalid or revoked'));
    }
    if (session.expiresAt.getTime() < Date.now()) {
      return next(unauthorized('SESSION_EXPIRED', 'Session expired'));
    }

    const user = await CustomerModel.findById(claims.sub).exec();
    if (!user || !user.isActive || user.deletedAt) {
      return next(unauthorized('USER_INACTIVE', 'Customer not found or inactive'));
    }

    req.customer = {
      id: String(user._id),
      role: 'customer',
      sessionId: String(session._id),
      phone: user.phone,
      name: user.name ?? null,
    };
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Accept either admin or customer JWT (e.g. media sign). */
export async function requireAdminOrCustomer(req: Request, res: Response, next: NextFunction) {
  const token = extractBearer(req);
  if (!token) {
    return next(unauthorized('AUTH_REQUIRED', 'Authentication is required'));
  }

  try {
    verifyAdminAccessToken(token);
    return requireAdmin(req, res, next);
  } catch {
    // not an admin token — try customer
  }

  return requireCustomer(req, res, next);
}
