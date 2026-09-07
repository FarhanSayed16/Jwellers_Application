import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const deviceSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    fcmToken: { type: String, required: true, unique: true },
    platform: { type: String, enum: ['android', 'ios'], required: true },
    isActive: { type: Boolean, default: true },
    lastSeenAt: { type: Date },
  },
  { timestamps: true },
);

deviceSchema.index({ customerId: 1, isActive: 1 });

export type Device = InferSchemaType<typeof deviceSchema> & { _id: Schema.Types.ObjectId };

export const DeviceModel: Model<Device> =
  (models.Device as Model<Device>) || model<Device>('Device', deviceSchema);
