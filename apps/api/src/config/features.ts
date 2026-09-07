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
  whatsappBusinessApi: boolean;
  oldGoldExchange: boolean;
  itemQr: boolean;
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
    whatsappBusinessApi: env.FEATURE_WHATSAPP_BUSINESS_API,
    oldGoldExchange: env.FEATURE_OLD_GOLD_EXCHANGE,
    itemQr: env.FEATURE_ITEM_QR,
    offlineCatalog: env.FEATURE_OFFLINE_CATALOG,
    i18n: env.FEATURE_I18N,
  };
}

export function isFeatureEnabled(key: FeatureKey): boolean {
  return getFeatureFlags()[key];
}

/** Values safe to expose on GET /config/features */
export function getPublicFeaturePayload() {
  return {
    ...getFeatureFlags(),
    razorpayKeyId: env.FEATURE_RAZORPAY_PAYMENTS ? env.RAZORPAY_KEY_ID || null : null,
  };
}
