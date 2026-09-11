import { getMongoConnectionState } from '../../db/connection';
import { RateModel } from '../../db/models/Rate';
import { ShopConfigModel } from '../../db/models/ShopConfig';
import { writeAuditLog } from '../../utils/audit';
import { badRequest, conflict, notFound } from '../../utils/errors';

const LARGE_CHANGE_PCT = 5;

export type RatePurity = '24k' | '22k' | '18k' | 'silver';

export type RateSnapshot = {
  id: string;
  effectiveAt: string;
  gold24kPerGram: number;
  gold22kPerGram: number;
  gold18kPerGram: number;
  silverPerGram: number;
  note: string | null;
  source: 'manual' | 'api';
  createdBy: string | null;
  createdAt: string;
};

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function toSnapshot(doc: {
  _id: { toString(): string };
  effectiveAt: Date;
  gold24kPerGram: number;
  gold22kPerGram: number;
  gold18kPerGram: number;
  silverPerGram: number;
  note?: string | null;
  source?: string;
  createdBy?: { toString(): string } | null;
  createdAt: Date;
}): RateSnapshot {
  return {
    id: doc._id.toString(),
    effectiveAt: new Date(doc.effectiveAt).toISOString(),
    gold24kPerGram: doc.gold24kPerGram,
    gold22kPerGram: doc.gold22kPerGram,
    gold18kPerGram: doc.gold18kPerGram,
    silverPerGram: doc.silverPerGram,
    note: doc.note ?? null,
    source: (doc.source as 'manual' | 'api') || 'manual',
    createdBy: doc.createdBy ? String(doc.createdBy) : null,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

function rateForPurity(
  rate: {
    gold24kPerGram: number;
    gold22kPerGram: number;
    gold18kPerGram: number;
    silverPerGram: number;
  },
  purity: RatePurity,
): number {
  switch (purity) {
    case '24k':
      return rate.gold24kPerGram;
    case '22k':
      return rate.gold22kPerGram;
    case '18k':
      return rate.gold18kPerGram;
    case 'silver':
      return rate.silverPerGram;
    default:
      throw badRequest('INVALID_PURITY', 'purity must be 24k, 22k, 18k, or silver');
  }
}

function pctChange(prev: number, next: number): number {
  if (prev === 0) return next === 0 ? 0 : 100;
  return Math.abs((next - prev) / prev) * 100;
}

function detectLargeChanges(
  prev: {
    gold24kPerGram: number;
    gold22kPerGram: number;
    gold18kPerGram: number;
    silverPerGram: number;
  },
  next: {
    gold24kPerGram: number;
    gold22kPerGram: number;
    gold18kPerGram: number;
    silverPerGram: number;
  },
) {
  const fields = [
    'gold24kPerGram',
    'gold22kPerGram',
    'gold18kPerGram',
    'silverPerGram',
  ] as const;
  const changes: Array<{ field: string; previous: number; next: number; changePercent: number }> =
    [];
  for (const field of fields) {
    const changePercent = pctChange(prev[field], next[field]);
    if (changePercent >= LARGE_CHANGE_PCT) {
      changes.push({
        field,
        previous: prev[field],
        next: next[field],
        changePercent: roundMoney(changePercent),
      });
    }
  }
  return changes;
}

export async function getLatestRate(): Promise<RateSnapshot | null> {
  assertDb();
  const doc = await RateModel.findOne().sort({ effectiveAt: -1, createdAt: -1 }).exec();
  return doc ? toSnapshot(doc) : null;
}

export async function getRateHistory(input: {
  from?: Date;
  to?: Date;
  limit?: number;
}): Promise<RateSnapshot[]> {
  assertDb();
  const limit = Math.min(Math.max(input.limit ?? 90, 1), 365);
  const filter: Record<string, unknown> = {};
  if (input.from || input.to) {
    filter.effectiveAt = {
      ...(input.from ? { $gte: input.from } : {}),
      ...(input.to ? { $lte: input.to } : {}),
    };
  }

  const docs = await RateModel.find(filter)
    .sort({ effectiveAt: 1, createdAt: 1 })
    .limit(limit)
    .exec();

  return docs.map(toSnapshot);
}

export async function createRate(input: {
  gold24kPerGram: number;
  gold22kPerGram: number;
  gold18kPerGram: number;
  silverPerGram: number;
  note?: string;
  effectiveAt?: Date;
  force?: boolean;
  adminId: string;
  ip?: string;
}) {
  assertDb();

  const metals = {
    gold24kPerGram: input.gold24kPerGram,
    gold22kPerGram: input.gold22kPerGram,
    gold18kPerGram: input.gold18kPerGram,
    silverPerGram: input.silverPerGram,
  };

  for (const [key, value] of Object.entries(metals)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw badRequest('VALIDATION_ERROR', `${key} must be a non-negative number`);
    }
  }

  const previous = await RateModel.findOne().sort({ effectiveAt: -1, createdAt: -1 }).exec();
  if (previous && !input.force) {
    const large = detectLargeChanges(previous, metals);
    if (large.length > 0) {
      throw conflict(
        'LARGE_RATE_CHANGE',
        `One or more rates changed by ≥${LARGE_CHANGE_PCT}%. Pass force=true to confirm.`,
        { thresholdPercent: LARGE_CHANGE_PCT, changes: large },
      );
    }
  }

  const doc = await RateModel.create({
    ...metals,
    note: input.note,
    effectiveAt: input.effectiveAt ?? new Date(),
    source: 'manual',
    createdBy: input.adminId,
  });

  await writeAuditLog({
    actorType: 'admin',
    actorId: input.adminId,
    action: 'rate.create',
    entityType: 'Rate',
    entityId: String(doc._id),
    after: toSnapshot(doc),
    ip: input.ip,
  });

  return toSnapshot(doc);
}

/**
 * Formula (docs/03 §4):
 * metalValue = weightGrams × ratePerGramForPurity
 * making = percent ? metalValue × (value/100) : value
 * taxable = metalValue + making
 * gst = taxable × (gstPercent/100)
 * total = taxable + gst
 */
export async function calculateQuote(input: {
  purity: RatePurity;
  weightGrams: number;
  makingType: 'percent' | 'flat';
  makingValue: number;
  gstPercent?: number;
}) {
  assertDb();

  if (!Number.isFinite(input.weightGrams) || input.weightGrams <= 0) {
    throw badRequest('VALIDATION_ERROR', 'weightGrams must be a positive number');
  }
  if (!Number.isFinite(input.makingValue) || input.makingValue < 0) {
    throw badRequest('VALIDATION_ERROR', 'makingValue must be a non-negative number');
  }

  const latest = await RateModel.findOne().sort({ effectiveAt: -1, createdAt: -1 }).exec();
  if (!latest) {
    throw notFound('RATES_NOT_SET', 'No rates have been published yet');
  }

  let gstPercent = input.gstPercent;
  if (gstPercent === undefined) {
    const shop = await ShopConfigModel.findOne({ isActive: true }).exec();
    gstPercent = shop?.gstPercentDefault ?? 3;
  }
  if (!Number.isFinite(gstPercent) || gstPercent < 0) {
    throw badRequest('VALIDATION_ERROR', 'gstPercent must be a non-negative number');
  }

  const ratePerGram = rateForPurity(latest, input.purity);
  const metalValue = roundMoney(input.weightGrams * ratePerGram);
  const making =
    input.makingType === 'percent'
      ? roundMoney(metalValue * (input.makingValue / 100))
      : roundMoney(input.makingValue);
  const taxable = roundMoney(metalValue + making);
  const gst = roundMoney(taxable * (gstPercent / 100));
  const total = roundMoney(taxable + gst);

  return {
    purity: input.purity,
    weightGrams: input.weightGrams,
    ratePerGram,
    rateEffectiveAt: new Date(latest.effectiveAt).toISOString(),
    makingType: input.makingType,
    makingValue: input.makingValue,
    gstPercent,
    breakup: {
      metalValue,
      making,
      taxable,
      gst,
      total,
    },
  };
}
