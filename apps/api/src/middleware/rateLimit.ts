import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/** Light global limiter — OTP/auth get stricter limits in Phase 08. */
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Try again later.',
        details: {},
      },
      meta: { requestId: res.locals.requestId },
    });
  },
});
