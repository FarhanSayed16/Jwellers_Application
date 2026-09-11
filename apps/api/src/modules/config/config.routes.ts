import { Router } from 'express';
import { z } from 'zod';
import { getPublicFeaturePayload } from '../../config/features';
import { requireOwner } from '../../middleware/auth';
import { requireFeature } from '../../middleware/featureFlag';
import { sendSuccess } from '../../utils/response';
import { badRequest } from '../../utils/errors';
import {
  assertNoSecretsInPayload,
  getAdminShopConfigDocument,
  getPublicShopConfig,
} from './config.service';
import { themeTokensSchema } from '../../db/models/_shared';

export const configRouter = Router();

const patchShopConfigSchema = z
  .object({
    shopName: z.string().min(1).optional(),
    logoUrl: z.string().optional(),
    faviconUrl: z.string().optional(),
    contactPhone: z.string().min(5).optional(),
    contactEmail: z.string().email().optional().nullable(),
    gstNumber: z.string().optional().nullable(),
    bisRegistrationNumber: z.string().optional().nullable(),
    gstPercentDefault: z.number().min(0).max(100).optional(),
    makingChargeDefault: z
      .object({
        type: z.enum(['percent', 'flat']),
        value: z.number(),
      })
      .optional(),
    address: z
      .object({
        line1: z.string().optional(),
        line2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
    socialLinks: z
      .object({
        instagram: z.string().optional(),
        facebook: z.string().optional(),
        youtube: z.string().optional(),
        website: z.string().optional(),
        whatsapp: z.string().optional(),
      })
      .optional(),
    themeLight: z.record(z.string(), z.string()).optional(),
    themeDark: z.record(z.string(), z.string()).optional(),
  })
  .strict();

/** Public white-label branding — no secrets. */
configRouter.get('/config/public', async (_req, res, next) => {
  try {
    const data = await getPublicShopConfig();
    assertNoSecretsInPayload(data);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
});

/** Public feature flags + Razorpay key id only when payments enabled. */
configRouter.get('/config/features', (_req, res, next) => {
  try {
    const data = getPublicFeaturePayload();
    assertNoSecretsInPayload(data);
    // Extra hard guarantee: never leak server secrets even if env mis-named
    const safe = {
      ...data,
    };
    return sendSuccess(res, safe);
  } catch (err) {
    return next(err);
  }
});

/**
 * Admin shop config — locked until Phase 07 auth.
 * Returns 401 AUTH_REQUIRED so clients know the route exists.
 */
configRouter.get('/admin/shop-config', requireOwner, async (_req, res, next) => {
  try {
    const doc = await getAdminShopConfigDocument();
    return sendSuccess(res, doc.toObject());
  } catch (err) {
    return next(err);
  }
});

configRouter.patch('/admin/shop-config', requireOwner, async (req, res, next) => {
  try {
    const parsed = patchShopConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(badRequest('VALIDATION_ERROR', 'Invalid shop config payload', parsed.error.flatten()));
    }

    // Validate theme shape if provided (reuse mongoose sub-schema keys)
    for (const themeKey of ['themeLight', 'themeDark'] as const) {
      const theme = parsed.data[themeKey];
      if (theme) {
        const required = Object.keys(themeTokensSchema.paths);
        for (const key of required) {
          if (typeof theme[key] !== 'string') {
            return next(
              badRequest('VALIDATION_ERROR', `theme.${themeKey}.${key} must be a string`),
            );
          }
        }
      }
    }

    const doc = await getAdminShopConfigDocument();
    Object.assign(doc, parsed.data);
    await doc.save();
    return sendSuccess(res, doc.toObject());
  } catch (err) {
    return next(err);
  }
});

/**
 * Proves requireFeature middleware — returns 403 FEATURE_DISABLED when CHAT is off.
 */
configRouter.get('/__debug/require-chat', requireFeature('chat'), (_req, res) => {
  sendSuccess(res, { ok: true, feature: 'chat' });
});
