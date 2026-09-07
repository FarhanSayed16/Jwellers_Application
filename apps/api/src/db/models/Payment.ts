import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const paymentSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    enquiryId: { type: Schema.Types.ObjectId, ref: 'Enquiry' },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    amountInPaise: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
    },
    rawWebhook: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

paymentSchema.index({ status: 1, createdAt: -1 });

export type Payment = InferSchemaType<typeof paymentSchema> & { _id: Schema.Types.ObjectId };

export const PaymentModel: Model<Payment> =
  (models.Payment as Model<Payment>) || model<Payment>('Payment', paymentSchema);
