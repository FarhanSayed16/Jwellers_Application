/**
 * Seed a small Demo catalog + opening rates for sales dogfood.
 * Safe to re-run: skips existing SKUs / keeps existing categories by slug.
 *
 * Usage (Demo DB):
 *   CLIENT_SLUG=demo MONGODB_URI=.../demo_jewellers?... npm run seed:demo-catalog -w @jwellers/api
 */
import { connectMongo, disconnectMongo } from '../db/connection';
import { ensureAllModelsLoaded, CategoryModel, ItemModel, RateModel, OfferModel } from '../db/models';
import { env } from '../config/env';

async function upsertCategory(input: {
  name: string;
  slug: string;
  parentId?: string | null;
  sortOrder: number;
}) {
  const existing = await CategoryModel.findOne({ slug: input.slug, deletedAt: null });
  if (existing) return existing;
  return CategoryModel.create({
    name: input.name,
    slug: input.slug,
    parentId: input.parentId || null,
    sortOrder: input.sortOrder,
    isActive: true,
  });
}

async function main() {
  if (env.CLIENT_SLUG !== 'demo') {
    console.warn(
      `[seed:demo-catalog] CLIENT_SLUG=${env.CLIENT_SLUG} — expected demo. Continuing anyway.`,
    );
  }

  await connectMongo();
  await ensureAllModelsLoaded();

  const gold = await upsertCategory({ name: 'Gold', slug: 'gold', sortOrder: 0 });
  const silver = await upsertCategory({ name: 'Silver', slug: 'silver', sortOrder: 1 });
  const rings = await upsertCategory({
    name: 'Rings',
    slug: 'rings',
    parentId: String(gold._id),
    sortOrder: 0,
  });
  const chains = await upsertCategory({
    name: 'Chains',
    slug: 'chains',
    parentId: String(gold._id),
    sortOrder: 1,
  });
  const silverCoins = await upsertCategory({
    name: 'Coins',
    slug: 'coins',
    parentId: String(silver._id),
    sortOrder: 0,
  });

  const samples = [
    {
      sku: 'DEMO-RING-001',
      title: 'Demo Classic Ring',
      categoryId: gold._id,
      subcategoryId: rings._id,
      metal: 'gold' as const,
      purity: '22K' as const,
      grossWeightGrams: 4.2,
      netWeightGrams: 4.0,
      isFeatured: true,
      isNewArrival: true,
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          sortOrder: 0,
          isPrimary: true,
        },
      ],
    },
    {
      sku: 'DEMO-CHAIN-001',
      title: 'Demo Rope Chain',
      categoryId: gold._id,
      subcategoryId: chains._id,
      metal: 'gold' as const,
      purity: '22K' as const,
      grossWeightGrams: 12.5,
      netWeightGrams: 12.0,
      isFeatured: true,
      isNewArrival: false,
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/docs/models.jpg',
          sortOrder: 0,
          isPrimary: true,
        },
      ],
    },
    {
      sku: 'DEMO-COIN-001',
      title: 'Demo Silver Coin',
      categoryId: silver._id,
      subcategoryId: silverCoins._id,
      metal: 'silver' as const,
      purity: 'other' as const,
      grossWeightGrams: 10,
      netWeightGrams: 10,
      isFeatured: false,
      isNewArrival: true,
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          sortOrder: 0,
          isPrimary: true,
        },
      ],
    },
  ];

  let created = 0;
  let skipped = 0;
  for (const row of samples) {
    const exists = await ItemModel.findOne({ sku: row.sku });
    if (exists) {
      skipped += 1;
      continue;
    }
    await ItemModel.create({
      ...row,
      makingCharge: { type: 'percent', value: 12 },
      status: 'active',
      tags: ['demo', 'sample'],
      description: 'Sample Demo Jewellers catalog item for sales dogfood.',
    });
    created += 1;
  }

  const latestRate = await RateModel.findOne().sort({ effectiveAt: -1 }).exec();
  if (!latestRate) {
    await RateModel.create({
      gold24kPerGram: 7500,
      gold22kPerGram: 6900,
      gold18kPerGram: 5650,
      silverPerGram: 95,
      note: 'Demo opening rate',
      effectiveAt: new Date(),
    });
    console.log('[seed:demo-catalog] created opening rates');
  } else {
    console.log('[seed:demo-catalog] rates already present — skip');
  }

  const offerCount = await OfferModel.countDocuments({ deletedAt: null });
  if (offerCount === 0) {
    const from = new Date(Date.now() - 86400000);
    const till = new Date(Date.now() + 86400000 * 30);
    await OfferModel.create({
      title: 'Demo festive making-charge offer',
      body: 'Sample offer for sales walkthroughs. Replace before client launch.',
      validFrom: from,
      validTill: till,
      isActive: true,
    });
    console.log('[seed:demo-catalog] created sample offer');
  }

  console.log('[seed:demo-catalog] done', {
    clientSlug: env.CLIENT_SLUG,
    categories: { gold: String(gold._id), silver: String(silver._id) },
    itemsCreated: created,
    itemsSkipped: skipped,
  });

  await disconnectMongo();
}

main().catch(async (err) => {
  console.error('[seed:demo-catalog] failed', err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
