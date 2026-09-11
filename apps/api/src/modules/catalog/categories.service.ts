import { Types } from 'mongoose';
import { getMongoConnectionState } from '../../db/connection';
import { CategoryModel } from '../../db/models/Category';
import { ItemModel } from '../../db/models/Item';
import { badRequest, conflict, notFound } from '../../utils/errors';
import { isDuplicateKeyError, slugify } from '../../utils/slug';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

export type CategoryDto = {
  id: string;
  name: string;
  slug: string;
  coverImageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: CategoryDto[];
};

function toCategoryDto(doc: {
  _id: { toString(): string };
  name: string;
  slug: string;
  coverImageUrl?: string | null;
  parentId?: { toString(): string } | null;
  sortOrder?: number;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}): CategoryDto {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    coverImageUrl: doc.coverImageUrl ?? null,
    parentId: doc.parentId ? String(doc.parentId) : null,
    sortOrder: doc.sortOrder ?? 0,
    isActive: doc.isActive !== false,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

async function assertValidParent(parentId: string | null | undefined, selfId?: string) {
  if (!parentId) return null;
  if (!Types.ObjectId.isValid(parentId)) {
    throw badRequest('INVALID_PARENT', 'parentId is not a valid id');
  }
  if (selfId && parentId === selfId) {
    throw badRequest('INVALID_PARENT', 'Category cannot be its own parent');
  }
  const parent = await CategoryModel.findOne({ _id: parentId, deletedAt: null }).exec();
  if (!parent) {
    throw badRequest('INVALID_PARENT', 'Parent category not found');
  }
  // MVP: only one level of nesting (parent must be a root)
  if (parent.parentId) {
    throw badRequest('INVALID_PARENT', 'Subcategories cannot have children (max 2 levels)');
  }
  return parent;
}

export async function listCategories(input: {
  parentId?: string | null;
  tree?: boolean;
  includeInactive?: boolean;
}) {
  assertDb();
  const filter: Record<string, unknown> = { deletedAt: null };
  if (!input.includeInactive) filter.isActive = true;

  if (input.tree) {
    const all = await CategoryModel.find(filter).sort({ sortOrder: 1, name: 1 }).exec();
    const dtos = all.map(toCategoryDto);
    const byId = new Map(dtos.map((c) => [c.id, { ...c, children: [] as CategoryDto[] }]));
    const roots: CategoryDto[] = [];
    for (const node of byId.values()) {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children!.push(node);
      } else if (!node.parentId) {
        roots.push(node);
      }
    }
    return { tree: roots };
  }

  if (input.parentId !== undefined) {
    filter.parentId = input.parentId === null || input.parentId === '' ? null : input.parentId;
  }

  const docs = await CategoryModel.find(filter).sort({ sortOrder: 1, name: 1 }).exec();
  return { categories: docs.map(toCategoryDto) };
}

export async function getCategoryById(id: string, opts?: { includeInactive?: boolean }) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('CATEGORY_NOT_FOUND', 'Category not found');
  const filter: Record<string, unknown> = { _id: id, deletedAt: null };
  if (!opts?.includeInactive) filter.isActive = true;
  const doc = await CategoryModel.findOne(filter).exec();
  if (!doc) throw notFound('CATEGORY_NOT_FOUND', 'Category not found');
  return toCategoryDto(doc);
}

export async function createCategory(input: {
  name: string;
  slug?: string;
  coverImageUrl?: string;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}) {
  assertDb();
  const name = input.name.trim();
  if (!name) throw badRequest('VALIDATION_ERROR', 'name is required');
  const slug = (input.slug ? slugify(input.slug) : slugify(name)) || undefined;
  if (!slug) throw badRequest('VALIDATION_ERROR', 'Could not derive a valid slug');

  await assertValidParent(input.parentId ?? null);

  try {
    const doc = await CategoryModel.create({
      name,
      slug,
      coverImageUrl: input.coverImageUrl,
      parentId: input.parentId || null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    });
    return toCategoryDto(doc);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw conflict('SLUG_EXISTS', 'Category slug already exists');
    }
    throw err;
  }
}

export async function updateCategory(
  id: string,
  input: {
    name?: string;
    slug?: string;
    coverImageUrl?: string | null;
    parentId?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  },
) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('CATEGORY_NOT_FOUND', 'Category not found');
  const doc = await CategoryModel.findOne({ _id: id, deletedAt: null }).exec();
  if (!doc) throw notFound('CATEGORY_NOT_FOUND', 'Category not found');

  if (input.parentId !== undefined) {
    await assertValidParent(input.parentId, id);
    // If this category has children, cannot become a subcategory
    if (input.parentId) {
      const childCount = await CategoryModel.countDocuments({
        parentId: id,
        deletedAt: null,
      }).exec();
      if (childCount > 0) {
        throw badRequest(
          'INVALID_PARENT',
          'Cannot nest a category that already has subcategories',
        );
      }
    }
    doc.parentId = input.parentId || null;
  }

  if (input.name !== undefined) doc.name = input.name.trim();
  if (input.slug !== undefined) {
    const slug = slugify(input.slug);
    if (!slug) throw badRequest('VALIDATION_ERROR', 'Invalid slug');
    doc.slug = slug;
  }
  if (input.coverImageUrl !== undefined) doc.coverImageUrl = input.coverImageUrl;
  if (input.sortOrder !== undefined) doc.sortOrder = input.sortOrder;
  if (input.isActive !== undefined) doc.isActive = input.isActive;

  try {
    await doc.save();
    return toCategoryDto(doc);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw conflict('SLUG_EXISTS', 'Category slug already exists');
    }
    throw err;
  }
}

export async function softDeleteCategory(id: string) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('CATEGORY_NOT_FOUND', 'Category not found');
  const doc = await CategoryModel.findOne({ _id: id, deletedAt: null }).exec();
  if (!doc) throw notFound('CATEGORY_NOT_FOUND', 'Category not found');

  const childCount = await CategoryModel.countDocuments({
    parentId: id,
    deletedAt: null,
  }).exec();
  if (childCount > 0) {
    throw conflict('CATEGORY_HAS_CHILDREN', 'Soft-delete or move subcategories first');
  }

  const itemCount = await ItemModel.countDocuments({
    deletedAt: null,
    $or: [{ categoryId: id }, { subcategoryId: id }],
  }).exec();
  if (itemCount > 0) {
    throw conflict('CATEGORY_HAS_ITEMS', 'Move or soft-delete items in this category first');
  }

  doc.deletedAt = new Date();
  doc.isActive = false;
  await doc.save();
  return { ok: true };
}
