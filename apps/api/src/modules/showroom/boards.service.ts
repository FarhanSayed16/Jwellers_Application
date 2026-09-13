import { Types } from 'mongoose';
import { getMongoConnectionState } from '../../db/connection';
import { CuratedBoardModel } from '../../db/models/CuratedBoard';
import { ItemModel } from '../../db/models/Item';
import { badRequest, notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

export async function listPublicBoards() {
  assertDb();
  const boards = await CuratedBoardModel.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
  const allIds = boards.flatMap((b) => (b.itemIds ?? []).map((id) => String(id)));
  const items = allIds.length
    ? await ItemModel.find({
        _id: { $in: allIds },
        deletedAt: null,
        status: 'active',
      })
        .select({ sku: 1, title: 1, images: 1, purity: 1, metal: 1, isFeatured: 1 })
        .lean()
    : [];
  const byId = new Map(items.map((i) => [String(i._id), i]));

  return {
    boards: boards.map((b) => ({
      id: String(b._id),
      title: b.title,
      sortOrder: b.sortOrder ?? 0,
      items: (b.itemIds ?? [])
        .map((id) => byId.get(String(id)))
        .filter(Boolean)
        .map((i) => ({
          id: String(i!._id),
          sku: i!.sku,
          title: i!.title,
          primaryImageUrl:
            (i!.images as { url?: string; isPrimary?: boolean }[] | undefined)?.find((x) => x.isPrimary)
              ?.url ||
            (i!.images as { url?: string }[] | undefined)?.[0]?.url ||
            null,
          purity: i!.purity ?? null,
          metal: i!.metal ?? null,
        })),
    })),
  };
}

export async function listAdminBoards() {
  assertDb();
  const boards = await CuratedBoardModel.find().sort({ sortOrder: 1 }).lean();
  return {
    boards: boards.map((b) => ({
      id: String(b._id),
      title: b.title,
      itemIds: (b.itemIds ?? []).map((id) => String(id)),
      sortOrder: b.sortOrder ?? 0,
      isActive: b.isActive !== false,
      createdAt: b.createdAt ? new Date(b.createdAt as Date).toISOString() : null,
    })),
  };
}

export async function upsertBoard(input: {
  id?: string;
  title: string;
  itemIds?: string[];
  sortOrder?: number;
  isActive?: boolean;
}) {
  assertDb();
  if (!input.title.trim()) throw badRequest('VALIDATION_ERROR', 'title required');
  const itemIds = (input.itemIds ?? [])
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  if (input.id) {
    if (!Types.ObjectId.isValid(input.id)) throw notFound('BOARD_NOT_FOUND', 'Board not found');
    const doc = await CuratedBoardModel.findById(input.id).exec();
    if (!doc) throw notFound('BOARD_NOT_FOUND', 'Board not found');
    doc.title = input.title.trim();
    doc.itemIds = itemIds;
    if (input.sortOrder !== undefined) doc.sortOrder = input.sortOrder;
    if (input.isActive !== undefined) doc.isActive = input.isActive;
    await doc.save();
    return {
      id: String(doc._id),
      title: doc.title,
      itemIds: (doc.itemIds ?? []).map((id) => String(id)),
      sortOrder: doc.sortOrder ?? 0,
      isActive: doc.isActive !== false,
    };
  }

  const doc = await CuratedBoardModel.create({
    title: input.title.trim(),
    itemIds,
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive ?? true,
  });
  return {
    id: String(doc._id),
    title: doc.title,
    itemIds: (doc.itemIds ?? []).map((id) => String(id)),
    sortOrder: doc.sortOrder ?? 0,
    isActive: doc.isActive !== false,
  };
}

export async function deleteBoard(id: string) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('BOARD_NOT_FOUND', 'Board not found');
  const res = await CuratedBoardModel.findByIdAndDelete(id).exec();
  if (!res) throw notFound('BOARD_NOT_FOUND', 'Board not found');
  return { deleted: true };
}
