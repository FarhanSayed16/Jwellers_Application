import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const appointmentSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    preferredAt: { type: Date, required: true },
    partySize: { type: Number, default: 1 },
    note: { type: String, maxlength: 1000 },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'completed', 'cancelled'],
      default: 'requested',
    },
    adminNote: { type: String, maxlength: 1000 },
  },
  { timestamps: true },
);

appointmentSchema.index({ preferredAt: 1, status: 1 });
appointmentSchema.index({ phone: 1, createdAt: -1 });

export type Appointment = InferSchemaType<typeof appointmentSchema> & {
  _id: Schema.Types.ObjectId;
};

export const AppointmentModel: Model<Appointment> =
  (models.Appointment as Model<Appointment>) || model<Appointment>('Appointment', appointmentSchema);
