import { Types } from 'mongoose';
import { getMongoConnectionState } from '../../db/connection';
import { CustomRequestModel } from '../../db/models/CustomRequest';
import { ShopConfigModel } from '../../db/models/ShopConfig';
import { resolveNotifyRecipients, sendEmail } from '../../services/email';
import { badRequest, notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function toDto(doc: any) {
  return {
    id: String(doc._id),
    customerId: String(doc.customerId),
    description: doc.description,
    referenceImageUrls: doc.referenceImageUrls ?? [],
    budgetHint: doc.budgetHint ?? null,
    status: doc.status,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

export async function createCustomRequest(input: {
  customerId: string;
  description: string;
  referenceImageUrls?: string[];
  budgetHint?: string;
}) {
  assertDb();
  const description = input.description.trim();
  if (!description) throw badRequest('VALIDATION_ERROR', 'description is required');

  const doc = await CustomRequestModel.create({
    customerId: input.customerId,
    description,
    referenceImageUrls: input.referenceImageUrls ?? [],
    budgetHint: input.budgetHint,
    status: 'new',
  });

  void notifyShopNewCustomRequest({
    id: String(doc._id),
    customerId: input.customerId,
    description,
    budgetHint: input.budgetHint,
  }).catch(() => undefined);

  return toDto(doc);
}

async function notifyShopNewCustomRequest(input: {
  id: string;
  customerId: string;
  description: string;
  budgetHint?: string;
}) {
  const shop = await ShopConfigModel.findOne({ isActive: true }).lean();
  const to = resolveNotifyRecipients(shop?.contactEmail);
  if (to.length === 0) return;

  const shopName = shop?.shopName ?? 'Ratnaraj Jewellers';
  await sendEmail({
    to,
    subject: `[${shopName}] New custom request`,
    text: [
      `A new custom jewellery request was submitted.`,
      ``,
      `Request ID: ${input.id}`,
      `Customer ID: ${input.customerId}`,
      `Budget hint: ${input.budgetHint ?? 'n/a'}`,
      ``,
      `Description:`,
      input.description,
    ].join('\n'),
  });
}

export async function listMyCustomRequests(customerId: string) {
  assertDb();
  const docs = await CustomRequestModel.find({ customerId, deletedAt: null })
    .sort({ createdAt: -1 })
    .exec();
  return { customRequests: docs.map(toDto) };
}

export async function listAdminCustomRequests(input?: { status?: string }) {
  assertDb();
  const filter: Record<string, unknown> = { deletedAt: null };
  if (input?.status) filter.status = input.status;
  const docs = await CustomRequestModel.find(filter).sort({ createdAt: -1 }).limit(200).exec();
  return { customRequests: docs.map(toDto) };
}

export async function updateAdminCustomRequest(
  id: string,
  input: { status?: 'new' | 'in_progress' | 'quoted' | 'closed' },
) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) {
    throw notFound('CUSTOM_REQUEST_NOT_FOUND', 'Custom request not found');
  }
  const doc = await CustomRequestModel.findOne({ _id: id, deletedAt: null }).exec();
  if (!doc) throw notFound('CUSTOM_REQUEST_NOT_FOUND', 'Custom request not found');
  if (input.status !== undefined) doc.status = input.status;
  await doc.save();
  return toDto(doc);
}
