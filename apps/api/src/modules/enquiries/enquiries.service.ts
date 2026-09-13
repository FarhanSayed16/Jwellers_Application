import { Types } from 'mongoose';
import { getMongoConnectionState } from '../../db/connection';
import { AdminUserModel } from '../../db/models/AdminUser';
import { EnquiryModel } from '../../db/models/Enquiry';
import { ItemModel } from '../../db/models/Item';
import { ShopConfigModel } from '../../db/models/ShopConfig';
import { resolveNotifyRecipients, sendEmail } from '../../services/email';
import { badRequest, notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function toEnquiryDto(doc: any) {
  return {
    id: String(doc._id),
    customerId: String(doc.customerId),
    itemId: doc.itemId ? String(doc.itemId) : null,
    message: doc.message,
    status: doc.status,
    assignedTo: doc.assignedTo ? String(doc.assignedTo) : null,
    channel: doc.channel,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

export async function createEnquiry(input: {
  customerId: string;
  itemId?: string | null;
  message: string;
  channel?: 'app' | 'whatsapp_deeplink';
}) {
  assertDb();
  const message = input.message.trim();
  if (!message) throw badRequest('VALIDATION_ERROR', 'message is required');

  if (input.itemId) {
    if (!Types.ObjectId.isValid(input.itemId)) {
      throw badRequest('INVALID_ITEM', 'itemId is invalid');
    }
    const item = await ItemModel.findOne({
      _id: input.itemId,
      deletedAt: null,
      status: 'active',
    }).exec();
    if (!item) throw notFound('ITEM_NOT_FOUND', 'Item not found');
  }

  const doc = await EnquiryModel.create({
    customerId: input.customerId,
    itemId: input.itemId || undefined,
    message,
    channel: input.channel ?? 'app',
    status: 'new',
  });

  void notifyShopNewEnquiry({
    enquiryId: String(doc._id),
    customerId: input.customerId,
    itemId: input.itemId ?? null,
    message,
  }).catch(() => undefined);

  const { recordFeatureEventSafe } = await import('../analytics/analytics.service');
  void recordFeatureEventSafe({
    type: 'enquiry_create',
    customerId: input.customerId,
    itemId: input.itemId,
  });

  return toEnquiryDto(doc);
}

async function notifyShopNewEnquiry(input: {
  enquiryId: string;
  customerId: string;
  itemId: string | null;
  message: string;
}) {
  const shop = await ShopConfigModel.findOne({ isActive: true }).lean();
  const to = resolveNotifyRecipients(shop?.contactEmail);
  if (to.length === 0) return;

  const shopName = shop?.shopName ?? 'Ratnaraj Jewellers';
  await sendEmail({
    to,
    subject: `[${shopName}] New enquiry`,
    text: [
      `A new customer enquiry was submitted.`,
      ``,
      `Enquiry ID: ${input.enquiryId}`,
      `Customer ID: ${input.customerId}`,
      `Item ID: ${input.itemId ?? 'n/a'}`,
      ``,
      `Message:`,
      input.message,
    ].join('\n'),
  });
}

export async function listMyEnquiries(customerId: string) {
  assertDb();
  const docs = await EnquiryModel.find({ customerId, deletedAt: null })
    .sort({ createdAt: -1 })
    .exec();
  return { enquiries: docs.map(toEnquiryDto) };
}

export async function listAdminEnquiries(input?: { status?: string }) {
  assertDb();
  const filter: Record<string, unknown> = { deletedAt: null };
  if (input?.status) filter.status = input.status;
  const docs = await EnquiryModel.find(filter).sort({ createdAt: -1 }).limit(200).exec();
  return { enquiries: docs.map(toEnquiryDto) };
}

export async function updateAdminEnquiry(
  id: string,
  input: { status?: 'new' | 'in_progress' | 'closed' | 'converted'; assignedTo?: string | null },
) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('ENQUIRY_NOT_FOUND', 'Enquiry not found');
  const doc = await EnquiryModel.findOne({ _id: id, deletedAt: null }).exec();
  if (!doc) throw notFound('ENQUIRY_NOT_FOUND', 'Enquiry not found');

  if (input.status !== undefined) doc.status = input.status;
  if (input.assignedTo !== undefined) {
    if (input.assignedTo === null || input.assignedTo === '') {
      doc.assignedTo = undefined;
    } else {
      if (!Types.ObjectId.isValid(input.assignedTo)) {
        throw badRequest('INVALID_ASSIGNEE', 'assignedTo is invalid');
      }
      const admin = await AdminUserModel.findOne({
        _id: input.assignedTo,
        deletedAt: null,
        isActive: true,
      }).exec();
      if (!admin) throw badRequest('INVALID_ASSIGNEE', 'Admin user not found');
      doc.assignedTo = input.assignedTo;
    }
  }

  await doc.save();
  return toEnquiryDto(doc);
}
