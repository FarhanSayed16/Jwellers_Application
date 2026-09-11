import fs from 'node:fs';
import path from 'node:path';
import { connectMongo, disconnectMongo } from '../db/connection';
import { ShopConfigModel } from '../db/models/ShopConfig';
import { env } from '../config/env';

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

async function main() {
  await connectMongo();
  const tokens = loadClientTokens();
  const isRatnaraj = env.CLIENT_SLUG === 'ratnaraj';

  const existing = await ShopConfigModel.findOne({ isActive: true });
  if (existing) {
    console.log('[seed:shop] active shop_config already exists:', existing.shopName);
    await disconnectMongo();
    return;
  }

  const shop = await ShopConfigModel.create({
    shopName: tokens.shopName ?? (isRatnaraj ? 'Ratnaraj Jewellers' : 'Demo Jewellers'),
    logoUrl: '',
    contactPhone: '9999999999',
    contactEmail: isRatnaraj ? 'hello@ratnarajjewellers.local' : 'hello@demojewellers.local',
    address: {
      line1: isRatnaraj ? 'Main Market' : 'Demo Street',
      city: 'Mumbai',
      state: 'MH',
      pincode: '400001',
      country: 'India',
    },
    themeLight: tokens.themeLight,
    themeDark: tokens.themeDark,
    makingChargeDefault: { type: 'percent', value: 12 },
    gstPercentDefault: 3,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    isActive: true,
    socialLinks: { whatsapp: '9999999999' },
  });

  console.log('[seed:shop] created', {
    id: shop._id.toString(),
    shopName: shop.shopName,
    clientSlug: env.CLIENT_SLUG,
  });

  await disconnectMongo();
}

main().catch(async (err) => {
  console.error('[seed:shop] failed', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
