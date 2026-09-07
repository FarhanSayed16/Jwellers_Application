import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const auditLogSchema = new Schema(
  {
    actorType: { type: String, enum: ['admin', 'system'], required: true },
    actorId: { type: Schema.Types.ObjectId },
    action: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: Schema.Types.ObjectId },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export type AuditLog = InferSchemaType<typeof auditLogSchema> & { _id: Schema.Types.ObjectId };

export const AuditLogModel: Model<AuditLog> =
  (models.AuditLog as Model<AuditLog>) || model<AuditLog>('AuditLog', auditLogSchema);
