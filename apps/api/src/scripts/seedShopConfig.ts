import fs from 'node:fs';
import path from 'node:path';
import { connectMongo, disconnectMongo } from '../db/connection';
import { ShopConfigModel } from '../db/models/ShopConfig';
import { env } from '../config/env';

type IntakeFile = {
  provisional?: boolean;
  displayName?: string;
  contactPhone?: string;
  contactEmail?: string | null;
  gstNumber?: string | null;
  bisRegistrationNumber?: string | null;
  logoUrl?: string;
  faviconUrl?: string | null;
  address?: {
    line1?: string;
    line2?: string | null;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  socialLinks?: {
    whatsapp?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    website?: string | null;
  };
  makingChargeDefault?: { type: 'percent' | 'flat'; value: number };
  gstPercentDefault?: number;
};

function loadClientTokens() {
  const slug = env.CLIENT_SLUG || 'demo';
  const candidates = [
    path.resolve(process.cwd(), `../../clients/${slug}/branding/tokens.json`),
    path.resolve(__dirname, `../../../../clients/${slug}/branding/tokens.json`),
    path.resolve(process.cwd(), '../../clients/demo/branding/tokens.json'),
    path.resolve(__dirname, '../../../../clients/demo/branding/tokens.json'),
  ];
  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) {
    throw new Error(`No branding tokens found for CLIENT_SLUG=${slug}`);
  }
  const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as {
    shopName: string;
    themeLight: Record<string, string>;
    themeDark: Record<string, string>;
  };
  return { ...raw, _source: file };
}

function loadIntake(): IntakeFile | null {
  const slug = env.CLIENT_SLUG || 'demo';
  const candidates = [
    path.resolve(process.cwd(), `../../clients/${slug}/intake.json`),
    path.resolve(__dirname, `../../../../clients/${slug}/intake.json`),
  ];
  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8')) as IntakeFile;
}

function buildShopPayload(tokens: ReturnType<typeof loadClientTokens>, intake: IntakeFile | null) {
  const isRatnaraj = env.CLIENT_SLUG === 'ratnaraj';
  return {
    shopName:
      intake?.displayName ??
      tokens.shopName ??
      (isRatnaraj ? 'Ratnaraj Jewellers' : 'Demo Jewellers'),
    logoUrl: intake?.logoUrl ?? '',
    faviconUrl: intake?.faviconUrl ?? null,
    contactPhone: intake?.contactPhone ?? '9999999999',
    contactEmail:
      intake?.contactEmail ??
      (isRatnaraj ? 'hello@ratnarajjewellers.local' : 'hello@demojewellers.local'),
    address: {
      line1: intake?.address?.line1 ?? (isRatnaraj ? 'Main Market' : 'Demo Street'),
      line2: intake?.address?.line2 ?? undefined,
      city: intake?.address?.city ?? 'Mumbai',
      state: intake?.address?.state ?? 'MH',
      pincode: intake?.address?.pincode ?? '400001',
      country: intake?.address?.country ?? 'India',
    },
    gstNumber: intake?.gstNumber ?? null,
    bisRegistrationNumber: intake?.bisRegistrationNumber ?? null,
    themeLight: tokens.themeLight,
    themeDark: tokens.themeDark,
    makingChargeDefault: intake?.makingChargeDefault ?? { type: 'percent' as const, value: 12 },
    gstPercentDefault: intake?.gstPercentDefault ?? 3,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    isActive: true,
    socialLinks: {
      whatsapp: intake?.socialLinks?.whatsapp ?? intake?.contactPhone ?? '9999999999',
      instagram: intake?.socialLinks?.instagram ?? undefined,
      facebook: intake?.socialLinks?.facebook ?? undefined,
      website: intake?.socialLinks?.website ?? undefined,
    },
  };
}

async function main() {
  await connectMongo();
  const tokens = loadClientTokens();
  const intake = loadIntake();
  const upsert = ['1', 'true', 'yes', 'on'].includes(
    (process.env.SEED_UPSERT ?? '').toLowerCase(),
  );
  const payload = buildShopPayload(tokens, intake);

  const existing = await ShopConfigModel.findOne({ isActive: true });
  if (existing && !upsert) {
    console.log('[seed:shop] active shop_config already exists:', existing.shopName);
    console.log('[seed:shop] set SEED_UPSERT=true to refresh from tokens/intake');
    await disconnectMongo();
    return;
  }

  if (existing && upsert) {
    Object.assign(existing, payload);
    await existing.save();
    console.log('[seed:shop] upserted', {
      id: existing._id.toString(),
      shopName: existing.shopName,
      clientSlug: env.CLIENT_SLUG,
      tokens: tokens._source,
      intake: intake ? 'yes' : 'no',
      provisional: intake?.provisional ?? false,
    });
  } else {
    const shop = await ShopConfigModel.create(payload);
    console.log('[seed:shop] created', {
      id: shop._id.toString(),
      shopName: shop.shopName,
      clientSlug: env.CLIENT_SLUG,
      tokens: tokens._source,
      intake: intake ? 'yes' : 'no',
      provisional: intake?.provisional ?? false,
    });
  }

  await disconnectMongo();
}

main().catch(async (err) => {
  console.error('[seed:shop] failed', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
