import { AuditLogModel } from '../db/models/AuditLog';

export async function writeAuditLog(input: {
  actorType: 'admin' | 'system';
  actorId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
}) {
  try {
    await AuditLogModel.create({
      actorType: input.actorType,
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      before: input.before,
      after: input.after,
      ip: input.ip,
    });
  } catch (err) {
    console.error('[audit] failed to write', err);
  }
}
