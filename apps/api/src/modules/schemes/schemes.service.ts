import { getMongoConnectionState } from '../../db/connection';
import { SchemeModel } from '../../db/models/Scheme';
import { badRequest, notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function toDto(doc: {
  _id: { toString(): string };
  title: string;
  description?: string | null;
  makingPercentOverride?: number | null;
  startAt: Date;
  endAt: Date;
  isActive: boolean;
}) {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description ?? null,
    makingPercentOverride: doc.makingPercentOverride ?? null,
    startAt: new Date(doc.startAt).toISOString(),
    endAt: new Date(doc.endAt).toISOString(),
    isActive: doc.isActive !== false,
  };
}

export async function listActiveSchemes() {
  assertDb();
  const now = new Date();
  const rows = await SchemeModel.find({
    isActive: true,
    startAt: { $lte: now },
    endAt: { $gte: now },
  })
    .sort({ startAt: -1 })
    .lean();
  return { schemes: rows.map(toDto) };
}

export async function listAdminSchemes() {
  assertDb();
  const rows = await SchemeModel.find().sort({ startAt: -1 }).limit(50).lean();
  return { schemes: rows.map(toDto) };
}

export async function createScheme(input: {
  title: string;
  description?: string;
  makingPercentOverride?: number;
  startAt: Date;
  endAt: Date;
  isActive?: boolean;
}) {
  assertDb();
  if (input.endAt <= input.startAt) {
    throw badRequest('VALIDATION_ERROR', 'endAt must be after startAt');
  }
  const doc = await SchemeModel.create({
    title: input.title.trim(),
    description: input.description,
    makingPercentOverride: input.makingPercentOverride,
    startAt: input.startAt,
    endAt: input.endAt,
    isActive: input.isActive ?? true,
  });
  return toDto(doc);
}
