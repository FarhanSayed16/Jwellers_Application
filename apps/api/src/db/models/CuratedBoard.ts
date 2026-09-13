import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const curatedBoardSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    itemIds: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

curatedBoardSchema.index({ sortOrder: 1, isActive: 1 });

export type CuratedBoard = InferSchemaType<typeof curatedBoardSchema> & {
  _id: Schema.Types.ObjectId;
};

export const CuratedBoardModel: Model<CuratedBoard> =
  (models.CuratedBoard as Model<CuratedBoard>) ||
  model<CuratedBoard>('CuratedBoard', curatedBoardSchema);
