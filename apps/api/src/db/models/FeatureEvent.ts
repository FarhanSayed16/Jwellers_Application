import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const featureEventSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['item_view', 'wishlist_add', 'enquiry_create', 'calculator_use'],
      required: true,
    },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

featureEventSchema.index({ type: 1, createdAt: -1 });
featureEventSchema.index({ itemId: 1, type: 1 });

export type FeatureEvent = InferSchemaType<typeof featureEventSchema> & {
  _id: Schema.Types.ObjectId;
};

export const FeatureEventModel: Model<FeatureEvent> =
  (models.FeatureEvent as Model<FeatureEvent>) ||
  model<FeatureEvent>('FeatureEvent', featureEventSchema);
