import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/auth';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  adminLogin,
  adminLogout,
  adminRefresh,
  changePassword,
  requestPasswordReset,
  resetPassword,
} from './adminAuth.service';
import { AdminUserModel } from '../../db/models/AdminUser';

export const adminAuthRouter = Router();

const adminLoginLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many login attempts' } },
});

adminAuthRouter.post('/auth/admin/login', adminLoginLimiter, async (req, res, next) => {
  try {
    const body = z
      .object({
        emailOrPhone: z.string().min(3),
        password: z.string().min(1),
        deviceInfo: z.string().optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid login payload', body.error.flatten()));
    }
    const data = await adminLogin({
      ...body.data,
      ip: req.ip,
    });
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

adminAuthRouter.post('/auth/admin/token/refresh', async (req, res, next) => {
  try {
    const body = z.object({ refreshToken: z.string().min(10) }).safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'refreshToken is required'));
    }
    const data = await adminRefresh(body.data.refreshToken);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

adminAuthRouter.post('/auth/admin/logout', requireAdmin, async (req, res, next) => {
  try {
    await adminLogout(req.admin!.sessionId, req.admin!.id, req.ip);
    return sendSuccess(res, { ok: true });
  } catch (err) {
    return next(err);
  }
});

adminAuthRouter.get('/auth/admin/me', requireAdmin, async (req, res, next) => {
  try {
    const user = await AdminUserModel.findById(req.admin!.id).select(
      'name email phone role isActive lastLoginAt',
    );
    if (!user) {
      return next(badRequest('USER_NOT_FOUND', 'Admin user not found'));
    }
    return sendSuccess(res, {
      id: user._id.toString(),
      name: user.name,
      email: user.email ?? null,
      phone: user.phone ?? null,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ?? null,
    });
  } catch (err) {
    return next(err);
  }
});

adminAuthRouter.post('/auth/admin/password/forgot', async (req, res, next) => {
  try {
    const body = z.object({ emailOrPhone: z.string().min(3) }).safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'emailOrPhone is required'));
    }
    const data = await requestPasswordReset(body.data.emailOrPhone, req.ip);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

adminAuthRouter.post('/auth/admin/password/reset', async (req, res, next) => {
  try {
    const body = z
      .object({
        token: z.string().min(10),
        newPassword: z.string().min(10),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid reset payload', body.error.flatten()));
    }
    const data = await resetPassword(body.data.token, body.data.newPassword, req.ip);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

adminAuthRouter.post('/auth/admin/password/change', requireAdmin, async (req, res, next) => {
  try {
    const body = z
      .object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(10),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid password change payload', body.error.flatten()));
    }
    const data = await changePassword({
      adminId: req.admin!.id,
      currentPassword: body.data.currentPassword,
      newPassword: body.data.newPassword,
      ip: req.ip,
    });
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});
