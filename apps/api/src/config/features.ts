import { env } from './env';

/** Public feature flags — never include secrets. */
export type FeatureFlags = {
  chat: boolean;
  whatsapp: boolean;
  rateHistory: boolean;
  sizeGuide: boolean;
  offers: boolean;
  customRequests: boolean;
  hallmark: boolean;
  digitalBilling: boolean;
  razorpayPayments: boolean;
  rateApi: boolean;
  multiBranch: boolean;
  analytics: boolean;
  crmLight: boolean;
  whatsappBusinessApi: boolean;
  oldGoldExchange: boolean;
  itemQr: boolean;
  shareRateCard: boolean;
  appointments: boolean;
  storeMode: boolean;
  curatedBoards: boolean;
  schemes: boolean;
  referrals: boolean;
  priceAlerts: boolean;
  offlineCatalog: boolean;
  i18n: boolean;
};

export type FeatureKey = keyof FeatureFlags;

export function getFeatureFlags(): FeatureFlags {
  return {
    chat: env.FEATURE_CHAT,
    whatsapp: env.FEATURE_WHATSAPP,
    rateHistory: env.FEATURE_RATE_HISTORY,
    sizeGuide: env.FEATURE_SIZE_GUIDE,
    offers: env.FEATURE_OFFERS,
    customRequests: env.FEATURE_CUSTOM_REQUESTS,
    hallmark: env.FEATURE_HALLMARK,
    digitalBilling: env.FEATURE_DIGITAL_BILLING,
    razorpayPayments: env.FEATURE_RAZORPAY_PAYMENTS,
    rateApi: env.FEATURE_RATE_API,
    multiBranch: env.FEATURE_MULTI_BRANCH,
    analytics: env.FEATURE_ANALYTICS,
    crmLight: env.FEATURE_CRM_LIGHT,
    whatsappBusinessApi: env.FEATURE_WHATSAPP_BUSINESS_API,
    oldGoldExchange: env.FEATURE_OLD_GOLD_EXCHANGE,
    itemQr: env.FEATURE_ITEM_QR,
    shareRateCard: env.FEATURE_SHARE_RATE_CARD,
    appointments: env.FEATURE_APPOINTMENTS,
    storeMode: env.FEATURE_STORE_MODE,
    curatedBoards: env.FEATURE_CURATED_BOARDS,
    schemes: env.FEATURE_SCHEMES,
    referrals: env.FEATURE_REFERRALS,
    priceAlerts: env.FEATURE_PRICE_ALERTS,
    offlineCatalog: env.FEATURE_OFFLINE_CATALOG,
    i18n: env.FEATURE_I18N,
  };
}

export function isFeatureEnabled(key: FeatureKey): boolean {
  return getFeatureFlags()[key];
}

/**
 * Flags that exist in env for Year-2 / sold-later modules but have no product surface yet.
 * Keep them out of public `/config/features` so mobile does not advertise vaporware (P-06).
 */
const PUBLIC_UNIMPLEMENTED_FLAGS = new Set<FeatureKey>([
  'offlineCatalog',
  'i18n',
  'multiBranch',
]);

/** Values safe to expose on GET /config/features */
export function getPublicFeaturePayload() {
  const flags = getFeatureFlags();
  const publicFlags = { ...flags };
  for (const key of PUBLIC_UNIMPLEMENTED_FLAGS) {
    publicFlags[key] = false;
  }
  return {
    ...publicFlags,
    razorpayKeyId: env.FEATURE_RAZORPAY_PAYMENTS ? env.RAZORPAY_KEY_ID || null : null,
    deepLinkScheme: env.APP_DEEP_LINK_SCHEME || 'jwellers',
    /** Internal-only flags still readable by admin Settings via getFeatureFlags elsewhere */
    unimplementedFlags: [...PUBLIC_UNIMPLEMENTED_FLAGS],
  };
}
