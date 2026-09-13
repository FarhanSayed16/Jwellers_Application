import { env } from '../../config/env';
import { getMongoConnectionState } from '../../db/connection';
import { ShopConfigModel } from '../../db/models/ShopConfig';
import { badRequest, notFound, serviceUnavailable } from '../../utils/errors';
import { createRate, getLatestRate, type RateSnapshot } from './rates.service';

export type SpotMetals = {
  gold24kPerGram: number;
  gold22kPerGram: number;
  gold18kPerGram: number;
  silverPerGram: number;
};

export type RateApiSuggestion = {
  spot: SpotMetals;
  suggested: SpotMetals;
  marginPercentGold: number;
  marginPercentSilver: number;
  provider: string;
  fetchedAt: string;
  note: string;
  fallbackUsed: boolean;
  previous: RateSnapshot | null;
};

/** Troy ounce → gram (ISO / LBMA convention). */
const TROY_OZ_TO_GRAM = 31.1034768;

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function applyMargin(spot: SpotMetals, goldPct: number, silverPct: number): SpotMetals {
  const g = 1 + goldPct / 100;
  const s = 1 + silverPct / 100;
  return {
    gold24kPerGram: roundMoney(spot.gold24kPerGram * g),
    gold22kPerGram: roundMoney(spot.gold22kPerGram * g),
    gold18kPerGram: roundMoney(spot.gold18kPerGram * g),
    silverPerGram: roundMoney(spot.silverPerGram * s),
  };
}

function spotFrom24kAndSilver(gold24kPerGram: number, silverPerGram: number): SpotMetals {
  return {
    gold24kPerGram: roundMoney(gold24kPerGram),
    gold22kPerGram: roundMoney(gold24kPerGram * (22 / 24)),
    gold18kPerGram: roundMoney(gold24kPerGram * (18 / 24)),
    silverPerGram: roundMoney(silverPerGram),
  };
}

function mockSpot(): SpotMetals {
  return {
    gold24kPerGram: 7450,
    gold22kPerGram: 6840,
    gold18kPerGram: 5600,
    silverPerGram: 92.5,
  };
}

async function fetchMetalsApi(apiKey: string): Promise<SpotMetals> {
  const url = new URL('https://metals-api.com/api/latest');
  url.searchParams.set('access_key', apiKey);
  url.searchParams.set('base', 'INR');
  url.searchParams.set('symbols', 'XAU,XAG');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`metals-api HTTP ${res.status}`);
  }
  const body = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    rates?: { XAU?: number; XAG?: number };
    error?: { info?: string };
  };
  if (body.success === false || !body.rates?.XAU || !body.rates?.XAG) {
    throw new Error(body.error?.info ?? 'metals-api missing XAU/XAG rates');
  }
  // rates are INR per troy oz when base=INR
  const gold24kPerGram = body.rates.XAU / TROY_OZ_TO_GRAM;
  const silverPerGram = body.rates.XAG / TROY_OZ_TO_GRAM;
  return spotFrom24kAndSilver(gold24kPerGram, silverPerGram);
}

async function fetchGoldApi(apiKey: string): Promise<SpotMetals> {
  async function one(symbol: 'XAU' | 'XAG') {
    const res = await fetch(`https://www.goldapi.io/api/${symbol}/INR`, {
      headers: { 'x-access-token': apiKey, Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`goldapi ${symbol} HTTP ${res.status}`);
    }
    return (await res.json()) as {
      price?: number;
      price_gram_24k?: number;
      price_gram_24k_inr?: number;
      [key: string]: unknown;
    };
  }

  const [xau, xag] = await Promise.all([one('XAU'), one('XAG')]);

  let gold24kPerGram: number;
  if (typeof xau.price_gram_24k === 'number' && Number.isFinite(xau.price_gram_24k)) {
    gold24kPerGram = xau.price_gram_24k;
  } else if (typeof xau.price === 'number' && Number.isFinite(xau.price)) {
    gold24kPerGram = xau.price / TROY_OZ_TO_GRAM;
  } else {
    throw new Error('goldapi XAU missing price');
  }

  let silverPerGram: number;
  if (typeof xag.price_gram_24k === 'number' && Number.isFinite(xag.price_gram_24k)) {
    // goldapi may expose per-gram for silver under similar keys
    silverPerGram = xag.price_gram_24k;
  } else if (typeof (xag as { price_gram?: number }).price_gram === 'number') {
    silverPerGram = (xag as { price_gram: number }).price_gram;
  } else if (typeof xag.price === 'number' && Number.isFinite(xag.price)) {
    silverPerGram = xag.price / TROY_OZ_TO_GRAM;
  } else {
    throw new Error('goldapi XAG missing price');
  }

  return spotFrom24kAndSilver(gold24kPerGram, silverPerGram);
}

/**
 * Fetch spot metals. Live HTTP when provider is not mock/fail, RATE_API_KEY is set,
 * and RATE_API_DRY_RUN is false. Otherwise returns stable mock spot.
 */
async function fetchSpotFromProvider(): Promise<{
  spot: SpotMetals;
  provider: string;
  live: boolean;
}> {
  const provider = (env.RATE_API_PROVIDER || 'mock').trim().toLowerCase();

  // Verify / chaos hook — forces fallback-to-manual path.
  if (provider === 'fail') {
    throw new Error('Simulated metals provider failure');
  }

  const apiKey = (env.RATE_API_KEY || '').trim();
  const dryRun = env.RATE_API_DRY_RUN !== false;
  const canLive = provider !== 'mock' && Boolean(apiKey) && !dryRun;

  if (canLive) {
    if (provider === 'metals-api') {
      const spot = await fetchMetalsApi(apiKey);
      return { spot, provider: 'metals-api', live: true };
    }
    if (provider === 'goldapi') {
      const spot = await fetchGoldApi(apiKey);
      return { spot, provider: 'goldapi', live: true };
    }
    throw new Error(`Unsupported RATE_API_PROVIDER for live fetch: ${provider}`);
  }

  return {
    spot: mockSpot(),
    provider: provider === 'mock' ? 'mock' : `${provider}_dry_run`,
    live: false,
  };
}

async function getMargins() {
  const shop = await ShopConfigModel.findOne({ isActive: true }).exec();
  const gold = shop?.rateApi?.marginPercentGold ?? 2;
  const silver = shop?.rateApi?.marginPercentSilver ?? 3;
  return {
    shop,
    marginPercentGold: Number.isFinite(gold) ? Number(gold) : 2,
    marginPercentSilver: Number.isFinite(silver) ? Number(silver) : 3,
  };
}

async function recordRateApiFetch(input: {
  provider: string;
  error?: string | null;
}) {
  await ShopConfigModel.updateOne(
    { isActive: true },
    {
      $set: {
        'rateApi.lastFetchAt': new Date(),
        'rateApi.lastProvider': input.provider,
        'rateApi.lastFetchError': input.error ?? null,
      },
    },
  );
}

export async function getRateApiSettings() {
  assertDb();
  const { marginPercentGold, marginPercentSilver, shop } = await getMargins();
  return {
    marginPercentGold,
    marginPercentSilver,
    provider: env.RATE_API_PROVIDER || 'mock',
    hasApiKey: Boolean(env.RATE_API_KEY),
    dryRunPreferred: env.RATE_API_DRY_RUN,
    lastFetchAt: shop?.rateApi?.lastFetchAt
      ? new Date(shop.rateApi.lastFetchAt).toISOString()
      : null,
    lastFetchError: shop?.rateApi?.lastFetchError ?? null,
    lastProvider: shop?.rateApi?.lastProvider ?? null,
    costDisclosure:
      'Metals API vendor bill (~₹800–4,000/mo) is paid by the Client. Platform module fee is separate — see docs/phase34/RATE_API_COST_DISCLOSURE.md',
  };
}

export async function updateRateApiSettings(input: {
  marginPercentGold?: number;
  marginPercentSilver?: number;
}) {
  assertDb();
  const shop = await ShopConfigModel.findOne({ isActive: true }).exec();
  if (!shop) throw notFound('SHOP_NOT_FOUND', 'Active shop config not found');

  const $set: Record<string, number> = {};
  if (input.marginPercentGold !== undefined) {
    if (!Number.isFinite(input.marginPercentGold) || input.marginPercentGold < 0 || input.marginPercentGold > 25) {
      throw badRequest('VALIDATION_ERROR', 'marginPercentGold must be 0–25');
    }
    $set['rateApi.marginPercentGold'] = input.marginPercentGold;
  }
  if (input.marginPercentSilver !== undefined) {
    if (
      !Number.isFinite(input.marginPercentSilver) ||
      input.marginPercentSilver < 0 ||
      input.marginPercentSilver > 25
    ) {
      throw badRequest('VALIDATION_ERROR', 'marginPercentSilver must be 0–25');
    }
    $set['rateApi.marginPercentSilver'] = input.marginPercentSilver;
  }
  if (Object.keys($set).length > 0) {
    await ShopConfigModel.updateOne({ _id: shop._id }, { $set });
  }
  return getRateApiSettings();
}

/**
 * Fetch spot + apply retailer margin. On provider failure, falls back to last
 * published rates as suggested values (manual path remains available).
 */
export async function fetchRateSuggestion(): Promise<RateApiSuggestion> {
  assertDb();
  const previous = await getLatestRate();
  const { marginPercentGold, marginPercentSilver } = await getMargins();

  let spot: SpotMetals;
  let provider: string;
  let fallbackUsed = false;
  let note = 'Fetched from metals provider (stub/mock). Review margin then publish.';

  try {
    const fetched = await fetchSpotFromProvider();
    spot = fetched.spot;
    provider = fetched.provider;
    note = fetched.live
      ? `Live spot from ${fetched.provider}. Review margin then publish.`
      : 'Fetched from metals provider (stub/mock). Review margin then publish.';
    await recordRateApiFetch({ provider });
  } catch (err) {
    fallbackUsed = true;
    provider = 'fallback_manual';
    note =
      'Provider fetch failed — suggesting last published rates. Edit manually or retry.';
    const errMsg = err instanceof Error ? err.message : 'fetch failed';
    if (!previous) {
      await recordRateApiFetch({ provider, error: errMsg });
      throw serviceUnavailable(
        'RATE_API_UNAVAILABLE',
        'Metals provider failed and no prior rates exist for fallback. Enter rates manually.',
      );
    }
    spot = {
      gold24kPerGram: previous.gold24kPerGram,
      gold22kPerGram: previous.gold22kPerGram,
      gold18kPerGram: previous.gold18kPerGram,
      silverPerGram: previous.silverPerGram,
    };
    await recordRateApiFetch({ provider, error: errMsg });
  }

  const suggested = fallbackUsed
    ? spot
    : applyMargin(spot, marginPercentGold, marginPercentSilver);

  return {
    spot,
    suggested,
    marginPercentGold,
    marginPercentSilver,
    provider,
    fetchedAt: new Date().toISOString(),
    note,
    fallbackUsed,
    previous,
  };
}

export async function publishFromApiSuggestion(input: {
  gold24kPerGram: number;
  gold22kPerGram: number;
  gold18kPerGram: number;
  silverPerGram: number;
  note?: string;
  force?: boolean;
  adminId: string;
  ip?: string;
}) {
  return createRate({
    ...input,
    source: 'api',
    note: input.note ?? 'Published from rate API suggestion',
  });
}
