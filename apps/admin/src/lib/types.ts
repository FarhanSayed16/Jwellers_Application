export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: { requestId?: string };
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: { requestId?: string };
};

export type AdminUser = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: 'owner' | 'staff';
  isActive?: boolean;
  lastLoginAt?: string | null;
};

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
  oldGoldExchange: boolean;
  [key: string]: boolean | string | null | undefined;
};

export type DashboardStats = {
  items: { total: number; active: number; draft: number; deleted: number };
  categories: { total: number };
  enquiries: { open: number };
  chats: { open: number };
  customers: { total: number };
  rates: { snapshots: number };
};

export type RateLatest = {
  rate: {
    id: string;
    effectiveAt: string;
    gold24kPerGram: number;
    gold22kPerGram: number;
    gold18kPerGram: number;
    silverPerGram: number;
    note: string | null;
  } | null;
};
