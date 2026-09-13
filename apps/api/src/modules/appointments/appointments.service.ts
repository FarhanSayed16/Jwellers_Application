import { Types } from 'mongoose';
import { getMongoConnectionState } from '../../db/connection';
import { AppointmentModel } from '../../db/models/Appointment';
import { badRequest, notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function toDto(doc: {
  _id: { toString(): string };
  customerId?: { toString(): string } | null;
  name: string;
  phone: string;
  preferredAt: Date;
  partySize?: number | null;
  note?: string | null;
  status: string;
  adminNote?: string | null;
  createdAt: Date;
}) {
  return {
    id: String(doc._id),
    customerId: doc.customerId ? String(doc.customerId) : null,
    name: doc.name,
    phone: doc.phone,
    preferredAt: new Date(doc.preferredAt).toISOString(),
    partySize: doc.partySize ?? 1,
    note: doc.note ?? null,
    status: doc.status,
    adminNote: doc.adminNote ?? null,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export async function createAppointment(input: {
  name: string;
  phone: string;
  preferredAt: Date;
  partySize?: number;
  note?: string;
  customerId?: string | null;
}) {
  assertDb();
  if (!(input.preferredAt instanceof Date) || Number.isNaN(input.preferredAt.getTime())) {
    throw badRequest('VALIDATION_ERROR', 'preferredAt must be a valid date');
  }
  const doc = await AppointmentModel.create({
    name: input.name.trim(),
    phone: input.phone.trim(),
    preferredAt: input.preferredAt,
    partySize: input.partySize ?? 1,
    note: input.note,
    customerId: input.customerId || undefined,
    status: 'requested',
  });
  return toDto(doc);
}

export async function listAdminAppointments(opts?: { status?: string; limit?: number }) {
  assertDb();
  const filter: Record<string, unknown> = {};
  if (opts?.status) filter.status = opts.status;
  const rows = await AppointmentModel.find(filter)
    .sort({ preferredAt: 1 })
    .limit(Math.min(Math.max(opts?.limit ?? 100, 1), 200))
    .exec();
  return { appointments: rows.map(toDto) };
}

export async function updateAdminAppointment(
  id: string,
  patch: { status?: string; adminNote?: string | null },
) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('APPOINTMENT_NOT_FOUND', 'Appointment not found');
  const doc = await AppointmentModel.findById(id).exec();
  if (!doc) throw notFound('APPOINTMENT_NOT_FOUND', 'Appointment not found');
  if (patch.status) doc.status = patch.status as typeof doc.status;
  if (patch.adminNote !== undefined) doc.adminNote = patch.adminNote || undefined;
  await doc.save();
  return toDto(doc);
}

export async function listMyAppointments(customerId: string) {
  assertDb();
  const rows = await AppointmentModel.find({ customerId })
    .sort({ preferredAt: -1 })
    .limit(50)
    .exec();
  return { appointments: rows.map(toDto) };
}
