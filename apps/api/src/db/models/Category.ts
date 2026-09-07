import { Schema, model, models, type Model } from 'mongoose';
import { softDeleteField } from './_shared';

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    coverImageUrl: { type: String },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ...softDeleteField,
  },
  { timestamps: true },
);

categorySchema.index({ parentId: 1, sortOrder: 1 });
categorySchema.index({ isActive: 1, parentId: 1 });

export type CategoryDoc = any;

export const CategoryModel: Model<CategoryDoc> =
  (models.Category as Model<CategoryDoc>) || model('Category', categorySchema);
