import { Schema, model, models, type Model } from 'mongoose';

const wishlistSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  },
  { timestamps: true },
);

wishlistSchema.index({ customerId: 1, itemId: 1 }, { unique: true });
wishlistSchema.index({ itemId: 1 });

export type WishlistDoc = any;

export const WishlistModel: Model<WishlistDoc> =
  (models.Wishlist as Model<WishlistDoc>) || model('Wishlist', wishlistSchema);
