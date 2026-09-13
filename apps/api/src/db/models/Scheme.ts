import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const schemeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    makingPercentOverride: { type: Number },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

schemeSchema.index({ isActive: 1, startAt: 1, endAt: 1 });

export type Scheme = InferSchemaType<typeof schemeSchema> & { _id: Schema.Types.ObjectId };

export const SchemeModel: Model<Scheme> =
  (models.Scheme as Model<Scheme>) || model<Scheme>('Scheme', schemeSchema);
