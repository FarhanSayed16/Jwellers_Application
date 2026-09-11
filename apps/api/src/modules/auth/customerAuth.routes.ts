import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { requireCustomer } from '../../middleware/auth';
import { CustomerModel } from '../../db/models/Customer';
import { badRequest } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import {
  customerLogout,
  customerRefresh,
  deleteCustomerMe,
  requestCustomerOtp,
  updateCustomerMe,
  verifyCustomerOtp,
} from './customerAuth.service';

export const customerAuthRouter = Router();

/** Layered with DB OTP quotas — caps burst abuse per IP. */
const otpRequestLimiter = rateLimit({
  windowMs: 60_000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many OTP requests' } },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many OTP attempts' } },
});

customerAuthRouter.post('/auth/customer/otp/request', otpRequestLimiter, async (req, res, next) => {
  try {
    const body = z.object({ phone: z.string().min(8).max(20) }).safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'phone is required', body.error.flatten()));
    }
    const data = await requestCustomerOtp({ phone: body.data.phone, ip: req.ip });
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

customerAuthRouter.post('/auth/customer/otp/verify', otpVerifyLimiter, async (req, res, next) => {
  try {
    const body = z
      .object({
        phone: z.string().min(8).max(20),
        otp: z.string().min(4).max(8),
        deviceInfo: z.string().optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid verify payload', body.error.flatten()));
    }
    const data = await verifyCustomerOtp({
      ...body.data,
      ip: req.ip,
    });
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

customerAuthRouter.post('/auth/customer/token/refresh', async (req, res, next) => {
  try {
    const body = z.object({ refreshToken: z.string().min(10) }).safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'refreshToken is required'));
    }
    const data = await customerRefresh(body.data.refreshToken);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

customerAuthRouter.post('/auth/customer/logout', requireCustomer, async (req, res, next) => {
  try {
    await customerLogout(req.customer!.sessionId, req.customer!.id, req.ip);
    return sendSuccess(res, { ok: true });
  } catch (err) {
    return next(err);
  }
});

customerAuthRouter.get('/auth/customer/me', requireCustomer, async (req, res, next) => {
  try {
    const user = await CustomerModel.findById(req.customer!.id).select(
      'phone name isActive lastLoginAt',
    );
    if (!user || user.deletedAt) {
      return next(badRequest('USER_NOT_FOUND', 'Customer not found'));
    }
    return sendSuccess(res, {
      id: user._id.toString(),
      phone: user.phone,
      name: user.name ?? null,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ?? null,
      role: 'customer',
    });
  } catch (err) {
    return next(err);
  }
});

customerAuthRouter.patch('/auth/customer/me', requireCustomer, async (req, res, next) => {
  try {
    const body = z.object({ name: z.string().min(1).max(80) }).safeParse(req.body);
    if (!body.success) {
      return next(badRequest('VALIDATION_ERROR', 'name is required', body.error.flatten()));
    }
    const data = await updateCustomerMe(req.customer!.id, body.data.name);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

customerAuthRouter.delete('/auth/customer/me', requireCustomer, async (req, res, next) => {
  try {
    const body = z
      .object({
        confirm: z.string().min(1),
      })
      .safeParse(req.body ?? {});
    if (!body.success) {
      return next(
        badRequest('CONFIRM_REQUIRED', 'Body must include confirm: "DELETE"', body.error.flatten()),
      );
    }
    const data = await deleteCustomerMe(req.customer!.id, body.data, req.ip);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});
