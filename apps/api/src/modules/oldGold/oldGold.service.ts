import { getMongoConnectionState } from '../../db/connection';
import { OldGoldQuoteModel } from '../../db/models/OldGoldQuote';
import { RateModel } from '../../db/models/Rate';
import { ShopConfigModel } from '../../db/models/ShopConfig';
import { badRequest, notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function pickRate(
  latest: {
    gold24kPerGram: number;
    gold22kPerGram: number;
    gold18kPerGram: number;
    silverPerGram: number;
  },
  metal: 'gold' | 'silver',
  purity: '24K' | '22K' | '18K' | 'other',
) {
  if (metal === 'silver') return latest.silverPerGram;
  if (purity === '24K') return latest.gold24kPerGram;
  if (purity === '18K') return latest.gold18kPerGram;
  return latest.gold22kPerGram;
}

export async function quoteOldGold(input: {
  metal: 'gold' | 'silver';
  purity: '24K' | '22K' | '18K' | 'other';
  weightGrams: number;
  customerId?: string | null;
  save?: boolean;
  note?: string;
}) {
  assertDb();
  if (!Number.isFinite(input.weightGrams) || input.weightGrams <= 0) {
    throw badRequest('VALIDATION_ERROR', 'weightGrams must be positive');
  }

  const latest = await RateModel.findOne().sort({ effectiveAt: -1 }).lean();
  if (!latest) throw badRequest('NO_RATES', 'Publish a rate before estimating exchange value');

  const shop = await ShopConfigModel.findOne({ isActive: true }).lean();
  const deductionPercent =
    typeof shop?.exchangeDeductionPercent === 'number' ? shop.exchangeDeductionPercent : 8;
  const ratePerGram = pickRate(latest, input.metal, input.purity);
  const grossValue = ratePerGram * input.weightGrams;
  const estimatedValue = Math.max(0, grossValue * (1 - deductionPercent / 100));

  const quote = {
    metal: input.metal,
    purity: input.purity,
    weightGrams: input.weightGrams,
    ratePerGram,
    deductionPercent,
    grossValue: Math.round(grossValue * 100) / 100,
    estimatedValue: Math.round(estimatedValue * 100) / 100,
    rateEffectiveAt: latest.effectiveAt,
    note: input.note ?? null,
  };

  if (input.save && input.customerId) {
    const doc = await OldGoldQuoteModel.create({
      customerId: input.customerId,
      metal: input.metal,
      purity: input.purity,
      weightGrams: input.weightGrams,
      ratePerGram,
      deductionPercent,
      grossValue: quote.grossValue,
      estimatedValue: quote.estimatedValue,
      note: input.note,
    });
    return { quote: { ...quote, id: String(doc._id), saved: true } };
  }

  return { quote: { ...quote, id: null, saved: false } };
}

export async function listCustomerOldGoldHistory(customerId: string, limit = 20) {
  assertDb();
  const rows = await OldGoldQuoteModel.find({ customerId })
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 50))
    .lean();
  return {
    quotes: rows.map((r) => ({
      id: String(r._id),
      metal: r.metal,
      purity: r.purity,
      weightGrams: r.weightGrams,
      ratePerGram: r.ratePerGram,
      deductionPercent: r.deductionPercent,
      grossValue: r.grossValue,
      estimatedValue: r.estimatedValue,
      createdAt: new Date(r.createdAt).toISOString(),
    })),
  };
}

export async function updateExchangeDeductionPercent(percent: number) {
  assertDb();
  if (!Number.isFinite(percent) || percent < 0 || percent > 50) {
    throw badRequest('VALIDATION_ERROR', 'exchangeDeductionPercent must be 0–50');
  }
  const shop = await ShopConfigModel.findOne({ isActive: true }).exec();
  if (!shop) throw notFound('SHOP_CONFIG_MISSING', 'No active shop config');
  shop.exchangeDeductionPercent = percent;
  await shop.save();
  return { exchangeDeductionPercent: percent };
}

export async function getExchangeConfig() {
  assertDb();
  const shop = await ShopConfigModel.findOne({ isActive: true }).lean();
  return {
    exchangeDeductionPercent:
      typeof shop?.exchangeDeductionPercent === 'number' ? shop.exchangeDeductionPercent : 8,
  };
}

export async function listAdminOldGoldQuotes(limit = 50) {
  assertDb();
  const rows = await OldGoldQuoteModel.find()
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 100))
    .lean();
  return {
    quotes: rows.map((r) => ({
      id: String(r._id),
      customerId: r.customerId ? String(r.customerId) : null,
      metal: r.metal,
      purity: r.purity,
      weightGrams: r.weightGrams,
      ratePerGram: r.ratePerGram,
      deductionPercent: r.deductionPercent,
      grossValue: r.grossValue,
      estimatedValue: r.estimatedValue,
      note: r.note ?? null,
      createdAt: new Date(r.createdAt).toISOString(),
    })),
  };
}
