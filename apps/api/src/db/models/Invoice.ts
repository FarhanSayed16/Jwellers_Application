import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const invoiceLineSchema = new Schema(
  {
    description: { type: String, required: true },
    sku: String,
    purity: String,
    weightGrams: Number,
    ratePerGram: Number,
    makingChargeAmount: Number,
    gstAmount: Number,
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const invoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    enquiryId: { type: Schema.Types.ObjectId, ref: 'Enquiry' },
    itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
    lineItems: { type: [invoiceLineSchema], default: [] },
    subtotal: { type: Number, required: true },
    gstTotal: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    rateSnapshot: {
      gold24k: Number,
      gold22k: Number,
      gold18k: Number,
      silver: Number,
      effectiveAt: Date,
    },
    pdfUrl: { type: String },
    status: { type: String, enum: ['draft', 'issued', 'cancelled'], default: 'draft' },
    issuedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
);

invoiceSchema.index({ customerId: 1, issuedAt: -1 });

export type Invoice = InferSchemaType<typeof invoiceSchema> & { _id: Schema.Types.ObjectId };

export const InvoiceModel: Model<Invoice> =
  (models.Invoice as Model<Invoice>) || model<Invoice>('Invoice', invoiceSchema);
