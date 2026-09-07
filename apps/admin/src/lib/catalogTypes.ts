export type RatePoint = {
  id: string;
  effectiveAt: string;
  gold24kPerGram: number;
  gold22kPerGram: number;
  gold18kPerGram: number;
  silverPerGram: number;
  note: string | null;
  source: string;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  coverImageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
};

export type ItemImage = {
  url: string;
  publicId: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type Item = {
  id: string;
  sku: string;
  title: string;
  description: string | null;
  categoryId: string;
  subcategoryId: string | null;
  images: ItemImage[];
  metal: string;
  purity: string;
  huid: string | null;
  hallmarkImageUrl: string | null;
  grossWeightGrams: number | null;
  netWeightGrams: number | null;
  makingCharge: { type: 'percent' | 'flat' | 'inherit'; value: number | null };
  stoneDetails: string | null;
  sizeInfo: string | null;
  tags: string[];
  isNewArrival: boolean;
  isFeatured: boolean;
  status: 'draft' | 'active' | 'sold' | 'archived';
  viewCount: number;
  wishlistCount: number;
  deletedAt: string | null;
};

export type MediaSign = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  resourceType: string;
  allowedMimeTypes: string[];
  maxBytes: number;
  uploadUrl: string;
};
