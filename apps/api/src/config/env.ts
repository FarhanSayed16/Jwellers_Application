import { config as loadDotenv } from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

// Load apps/api/.env regardless of process.cwd() (repo root vs package)
loadDotenv({ path: path.resolve(__dirname, '../../.env') });
// Optional mail secrets (gitignored) — Resend / SendGrid / SMTP
loadDotenv({ path: path.resolve(__dirname, '../../secrets/optional-email.env') });
loadDotenv(); // also allow cwd override

const boolFromEnv = z
  .union([z.boolean(), z.string()])
  .transform((v) => {
    if (typeof v === 'boolean') return v;
    return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
  });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_SLUG: z.string().default('demo'),

  MONGODB_URI: z.string().min(1).optional(),
  JWT_ACCESS_SECRET: z.string().min(16).optional(),
  JWT_REFRESH_SECRET: z.string().min(16).optional(),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),

  OTP_PEPPER: z.string().min(8).optional(),
  OTP_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  OTP_MAX_PER_PHONE_PER_HOUR: z.coerce.number().int().positive().default(3),
  OTP_MAX_PER_IP_PER_HOUR: z.coerce.number().int().positive().default(10),
  OTP_COOLDOWN_SECONDS: z.coerce.number().int().positive().default(60),
  OTP_MAX_VERIFY_ATTEMPTS: z.coerce.number().int().positive().default(5),
  /** Non-production only: allow fixed bypass OTP (never enable in production). */
  OTP_DEV_BYPASS: boolFromEnv.default(false),
  OTP_DEV_CODE: z.string().regex(/^\d{6}$/).optional().default('123456'),

  MSG91_AUTH_KEY: z.string().optional().default(''),
  MSG91_TEMPLATE_ID: z.string().optional().default(''),
  MSG91_SENDER_ID: z.string().optional().default(''),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  /** Transactional email: resend (preferred) | sendgrid */
  MAIL_PROVIDER: z.enum(['resend', 'sendgrid', 'none']).optional().default('resend'),
  RESEND_API_KEY: z.string().optional().default(''),
  EMAIL_FROM: z.string().optional().default(''),
  EMAIL_REPLY_TO: z.string().optional().default(''),
  /** Comma-separated shop alert inbox for new enquiries / custom requests */
  EMAIL_NOTIFY_TO: z.string().optional().default(''),
  SENDGRID_API_KEY: z.string().optional().default(''),
  SENDGRID_FROM_EMAIL: z.string().optional().default(''),
  SENDGRID_FROM_NAME: z.string().optional().default(''),

  FCM_PROJECT_ID: z.string().optional().default(''),
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional().default(''),
  /** When true, FCM sends are recorded locally (verify scripts / CI). */
  FCM_DRY_RUN: boolFromEnv.default(false),

  ADMIN_CORS_ORIGIN: z.string().default('http://localhost:3000'),

  FEATURE_CHAT: boolFromEnv.default(true),
  FEATURE_WHATSAPP: boolFromEnv.default(true),
  FEATURE_RATE_HISTORY: boolFromEnv.default(true),
  FEATURE_SIZE_GUIDE: boolFromEnv.default(true),
  FEATURE_OFFERS: boolFromEnv.default(true),
  FEATURE_CUSTOM_REQUESTS: boolFromEnv.default(true),
  FEATURE_HALLMARK: boolFromEnv.default(false),
  FEATURE_DIGITAL_BILLING: boolFromEnv.default(false),
  FEATURE_RAZORPAY_PAYMENTS: boolFromEnv.default(false),
  FEATURE_RATE_API: boolFromEnv.default(false),
  FEATURE_MULTI_BRANCH: boolFromEnv.default(false),
  FEATURE_ANALYTICS: boolFromEnv.default(false),
  FEATURE_WHATSAPP_BUSINESS_API: boolFromEnv.default(false),
  FEATURE_OLD_GOLD_EXCHANGE: boolFromEnv.default(false),
  FEATURE_ITEM_QR: boolFromEnv.default(false),
  FEATURE_OFFLINE_CATALOG: boolFromEnv.default(false),
  FEATURE_I18N: boolFromEnv.default(false),

  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),

  /** Optional Sentry DSN — no-op when empty */
  SENTRY_DSN: z.string().optional().default(''),
  SENTRY_RELEASE: z.string().optional().default(''),

  /** Soft/force update — exposed on public config for mobile */
  MOBILE_MIN_VERSION: z.string().optional().default('1.0.0'),
  MOBILE_LATEST_VERSION: z.string().optional().default('1.0.0'),
  MOBILE_FORCE_UPDATE: boolFromEnv.default(false),
  MOBILE_STORE_URL_ANDROID: z.string().optional().default(''),
  MOBILE_STORE_URL_IOS: z.string().optional().default(''),

  /** Hosted policy URLs (admin /legal/* or client site). Exposed on public config. */
  LEGAL_PRIVACY_URL: z.union([z.string().url(), z.literal('')]).optional().default(''),
  LEGAL_TERMS_URL: z.union([z.string().url(), z.literal('')]).optional().default(''),
  LEGAL_DELETE_ACCOUNT_URL: z.union([z.string().url(), z.literal('')]).optional().default(''),
  LEGAL_SUPPORT_EMAIL: z.union([z.string().email(), z.literal('')]).optional().default(''),
});

export type Env = z.infer<typeof envSchema>;

function assertProductionSecrets(parsed: Env) {
  if (parsed.NODE_ENV !== 'production') return;

  const missing: string[] = [];
  const required: Array<keyof Env> = [
    'MONGODB_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'OTP_PEPPER',
    'ADMIN_CORS_ORIGIN',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  for (const key of required) {
    const value = parsed[key];
    if (value === undefined || value === null || value === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[env] Production boot blocked. Missing required secrets: ${missing.join(', ')}`,
    );
  }
}

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('[env] Invalid environment:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

assertProductionSecrets(parsed.data);

export const env = parsed.data;

export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
