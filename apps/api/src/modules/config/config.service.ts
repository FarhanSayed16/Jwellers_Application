import fs from 'node:fs';
import path from 'node:path';
import { getMongoConnectionState } from '../../db/connection';
import { ShopConfigModel } from '../../db/models/ShopConfig';
import { env } from '../../config/env';
import { notFound } from '../../utils/errors';

export type PublicShopConfig = {
  clientSlug: string;
  shopName: string;
  logoUrl: string;
  faviconUrl: string | null;
  contactPhone: string;
  contactEmail: string | null;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  gstNumber: string | null;
  bisRegistrationNumber: string | null;
  socialLinks: Record<string, string | undefined>;
  themeLight: Record<string, string>;
  themeDark: Record<string, string>;
  fonts: { display: string; body: string } | null;
  makingChargeDefault: { type: string; value: number };
  gstPercentDefault: number;
  currency: string;
  timezone: string;
  source: 'database' | 'file_fallback';
  privacyPolicyUrl: string | null;
  termsOfUseUrl: string | null;
  deleteAccountUrl: string | null;
  supportEmail: string | null;
  /** Soft/force update — mobile compares package version against minVersion */
  appUpdate: {
    minVersion: string;
    latestVersion: string;
    forceUpdate: boolean;
    storeUrlAndroid: string | null;
    storeUrlIos: string | null;
  };
};

function legalUrls() {
  return {
    privacyPolicyUrl: env.LEGAL_PRIVACY_URL?.trim() || null,
    termsOfUseUrl: env.LEGAL_TERMS_URL?.trim() || null,
    deleteAccountUrl: env.LEGAL_DELETE_ACCOUNT_URL?.trim() || null,
    supportEmail: env.LEGAL_SUPPORT_EMAIL?.trim() || null,
  };
}

function appUpdateBlock() {
  return {
    appUpdate: {
      minVersion: env.MOBILE_MIN_VERSION?.trim() || '1.0.0',
      latestVersion: env.MOBILE_LATEST_VERSION?.trim() || '1.0.0',
      forceUpdate: Boolean(env.MOBILE_FORCE_UPDATE),
      storeUrlAndroid: env.MOBILE_STORE_URL_ANDROID?.trim() || null,
      storeUrlIos: env.MOBILE_STORE_URL_IOS?.trim() || null,
    },
  };
}

function loadFileFallback(): PublicShopConfig {
  const slug = env.CLIENT_SLUG || 'demo';
  const candidates = [
    path.resolve(process.cwd(), `../../clients/${slug}/branding/tokens.json`),
    path.resolve(process.cwd(), `../clients/${slug}/branding/tokens.json`),
    path.resolve(__dirname, `../../../../../clients/${slug}/branding/tokens.json`),
    // Demo fallback if client folder missing
    path.resolve(process.cwd(), '../../clients/demo/branding/tokens.json'),
    path.resolve(__dirname, '../../../../../clients/demo/branding/tokens.json'),
  ];

  type TokenFile = {
    shopName?: string;
    fonts?: { display: string; body: string };
    themeLight: Record<string, string>;
    themeDark: Record<string, string>;
  };

  let tokens: TokenFile | null = null;

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      tokens = JSON.parse(fs.readFileSync(file, 'utf8')) as TokenFile;
      break;
    }
  }

  if (!tokens) {
    throw notFound('SHOP_CONFIG_MISSING', 'Shop config not found in database or fallback file');
  }

  const isRatnaraj = env.CLIENT_SLUG === 'ratnaraj';
  return {
    clientSlug: env.CLIENT_SLUG,
    shopName: tokens.shopName ?? (isRatnaraj ? 'Ratnaraj Jewellers' : 'Demo Jewellers'),
    logoUrl: '',
    faviconUrl: null,
    contactPhone: '9999999999',
    contactEmail: isRatnaraj ? 'hello@ratnarajjewellers.local' : 'hello@demojewellers.local',
    address: {
      line1: isRatnaraj ? 'Main Market' : 'Demo Street',
      city: 'Mumbai',
      state: 'MH',
      pincode: '400001',
      country: 'India',
    },
    gstNumber: null,
    bisRegistrationNumber: null,
    socialLinks: { whatsapp: '9999999999' },
    themeLight: tokens.themeLight,
    themeDark: tokens.themeDark,
    fonts: tokens.fonts
      ? { display: tokens.fonts.display, body: tokens.fonts.body }
      : { display: 'Fraunces', body: 'Source Sans 3' },
    makingChargeDefault: { type: 'percent', value: 12 },
    gstPercentDefault: 3,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    source: 'file_fallback',
    ...legalUrls(),
    ...appUpdateBlock(),
  };
}

function toPublic(doc: {
  shopName: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  contactPhone: string;
  contactEmail?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    country?: string | null;
  } | null;
  gstNumber?: string | null;
  bisRegistrationNumber?: string | null;
  socialLinks?: {
    instagram?: string | null;
    facebook?: string | null;
    youtube?: string | null;
    website?: string | null;
    whatsapp?: string | null;
  } | null;
  themeLight: Record<string, unknown>;
  themeDark: Record<string, unknown>;
  makingChargeDefault?: { type?: string | null; value?: number | null } | null;
  gstPercentDefault?: number | null;
  currency?: string | null;
  timezone?: string | null;
}): PublicShopConfig {
  return {
    clientSlug: env.CLIENT_SLUG,
    shopName: doc.shopName,
    logoUrl: doc.logoUrl ?? '',
    faviconUrl: doc.faviconUrl ?? null,
    contactPhone: doc.contactPhone,
    contactEmail: doc.contactEmail ?? null,
    address: {
      line1: doc.address?.line1 ?? '',
      line2: doc.address?.line2 ?? undefined,
      city: doc.address?.city ?? '',
      state: doc.address?.state ?? '',
      pincode: doc.address?.pincode ?? '',
      country: doc.address?.country ?? 'India',
    },
    gstNumber: doc.gstNumber ?? null,
    bisRegistrationNumber: doc.bisRegistrationNumber ?? null,
    socialLinks: {
      instagram: doc.socialLinks?.instagram ?? undefined,
      facebook: doc.socialLinks?.facebook ?? undefined,
      youtube: doc.socialLinks?.youtube ?? undefined,
      website: doc.socialLinks?.website ?? undefined,
      whatsapp: doc.socialLinks?.whatsapp ?? undefined,
    },
    themeLight: doc.themeLight as Record<string, string>,
    themeDark: doc.themeDark as Record<string, string>,
    fonts: null,
    makingChargeDefault: {
      type: doc.makingChargeDefault?.type ?? 'percent',
      value: doc.makingChargeDefault?.value ?? 10,
    },
    gstPercentDefault: doc.gstPercentDefault ?? 3,
    currency: doc.currency ?? 'INR',
    timezone: doc.timezone ?? 'Asia/Kolkata',
    source: 'database',
    ...legalUrls(),
    ...appUpdateBlock(),
  };
}

/** Strip anything that must never appear on public endpoints. */
export function assertNoSecretsInPayload(payload: unknown) {
  const json = JSON.stringify(payload).toLowerCase();
  const banned = [
    'jwt_',
    'password',
    'secret',
    'mongodb',
    'msg91_auth',
    'cloudinary_api_secret',
    'razorpay_key_secret',
    'otp_pepper',
  ];
  for (const key of banned) {
    if (json.includes(key)) {
      throw new Error(`[config] Refusing to return payload containing banned key fragment: ${key}`);
    }
  }
}

export async function getPublicShopConfig(): Promise<PublicShopConfig> {
  const { readyState } = getMongoConnectionState();
  if (readyState === 1) {
    const doc = await ShopConfigModel.findOne({ isActive: true }).lean(false);
    if (doc) {
      const publicConfig = toPublic(doc);
      assertNoSecretsInPayload(publicConfig);
      return publicConfig;
    }
  }

  const fallback = loadFileFallback();
  assertNoSecretsInPayload(fallback);
  return fallback;
}

export async function getAdminShopConfigDocument() {
  const { readyState } = getMongoConnectionState();
  if (readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
  const doc = await ShopConfigModel.findOne({ isActive: true });
  if (!doc) {
    throw notFound('SHOP_CONFIG_MISSING', 'No active shop_config. Run seed:shop first.');
  }
  return doc;
}
