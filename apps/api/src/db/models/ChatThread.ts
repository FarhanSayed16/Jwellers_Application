import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { softDeleteField } from './_shared';

const chatThreadSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    subject: { type: String },
    itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
    status: {
      type: String,
      enum: ['open', 'pending_customer', 'pending_staff', 'closed'],
      default: 'open',
    },
    lastMessageAt: { type: Date },
    lastMessagePreview: { type: String },
    unreadCustomer: { type: Number, default: 0 },
    unreadStaff: { type: Number, default: 0 },
    ...softDeleteField,
  },
  { timestamps: true },
);

chatThreadSchema.index({ customerId: 1, lastMessageAt: -1 });
chatThreadSchema.index({ status: 1, lastMessageAt: -1 });

export type ChatThread = InferSchemaType<typeof chatThreadSchema> & {
  _id: Schema.Types.ObjectId;
};

export const ChatThreadModel: Model<ChatThread> =
  (models.ChatThread as Model<ChatThread>) || model<ChatThread>('ChatThread', chatThreadSchema);
