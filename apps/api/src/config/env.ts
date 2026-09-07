import { config as loadDotenv } from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

// Load apps/api/.env regardless of process.cwd() (repo root vs package)
loadDotenv({ path: path.resolve(__dirname, '../../.env') });
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

  FCM_PROJECT_ID: z.string().optional().default(''),
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional().default(''),

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
