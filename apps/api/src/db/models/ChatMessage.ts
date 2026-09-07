import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const chatMessageSchema = new Schema(
  {
    threadId: { type: Schema.Types.ObjectId, ref: 'ChatThread', required: true },
    senderType: { type: String, enum: ['customer', 'staff'], required: true },
    senderId: { type: Schema.Types.ObjectId, required: true },
    body: { type: String },
    attachmentUrls: [{ type: String }],
    clientMessageId: { type: String },
    sentAt: { type: Date, default: Date.now },
    readAt: { type: Date },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

chatMessageSchema.index({ threadId: 1, sentAt: 1 });
chatMessageSchema.index(
  { threadId: 1, clientMessageId: 1 },
  { unique: true, sparse: true },
);

export type ChatMessage = InferSchemaType<typeof chatMessageSchema> & {
  _id: Schema.Types.ObjectId;
};

export const ChatMessageModel: Model<ChatMessage> =
  (models.ChatMessage as Model<ChatMessage>) || model<ChatMessage>('ChatMessage', chatMessageSchema);
