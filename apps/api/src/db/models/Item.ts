import { Schema, model, models, type Model } from 'mongoose';
import { softDeleteField } from './_shared';

const itemImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    sortOrder: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false },
);

const itemSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    images: { type: [itemImageSchema], default: [] },
    metal: { type: String, enum: ['gold', 'silver', 'other'], default: 'gold' },
    purity: { type: String, enum: ['24K', '22K', '18K', 'other'], default: '22K' },
    huid: { type: String },
    hallmarkImageUrl: { type: String },
    grossWeightGrams: { type: Number },
    netWeightGrams: { type: Number },
    makingCharge: {
      type: { type: String, enum: ['percent', 'flat', 'inherit'], default: 'inherit' },
      value: { type: Number },
    },
    stoneDetails: { type: String },
    sizeInfo: { type: String },
    tags: [{ type: String }],
    isNewArrival: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'active', 'sold', 'archived'],
      default: 'draft',
    },
    viewCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    ...softDeleteField,
  },
  { timestamps: true },
);

itemSchema.index({ categoryId: 1, subcategoryId: 1, status: 1 });
itemSchema.index({ status: 1, isNewArrival: 1, updatedAt: -1 });
itemSchema.index({ status: 1, isFeatured: 1 });
itemSchema.index({ tags: 1 });
itemSchema.index({ title: 'text', sku: 'text', tags: 'text' });

export type ItemDoc = any;

export const ItemModel: Model<ItemDoc> =
  (models.Item as Model<ItemDoc>) || model('Item', itemSchema);
