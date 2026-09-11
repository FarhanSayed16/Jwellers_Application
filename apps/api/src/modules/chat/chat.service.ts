import { Types } from 'mongoose';
import { getMongoConnectionState } from '../../db/connection';
import { ChatMessageModel } from '../../db/models/ChatMessage';
import { ChatThreadModel } from '../../db/models/ChatThread';
import { CustomerModel } from '../../db/models/Customer';
import { ItemModel } from '../../db/models/Item';
import { badRequest, forbidden, notFound } from '../../utils/errors';
import { isDuplicateKeyError } from '../../utils/slug';
import { notifyChatMessage } from '../devices/devices.service';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

const THREAD_STATUSES = ['open', 'pending_customer', 'pending_staff', 'closed'] as const;
export type ThreadStatus = (typeof THREAD_STATUSES)[number];

export type ChatThreadDto = {
  id: string;
  customerId: string;
  customerName?: string | null;
  customerPhone?: string | null;
  subject: string | null;
  itemId: string | null;
  itemSku?: string | null;
  itemTitle?: string | null;
  status: ThreadStatus;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCustomer: number;
  unreadStaff: number;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessageDto = {
  id: string;
  threadId: string;
  senderType: 'customer' | 'staff';
  senderId: string;
  body: string | null;
  attachmentUrls: string[];
  clientMessageId: string | null;
  sentAt: string;
  readAt: string | null;
};

function previewFrom(body?: string | null, attachments?: string[]): string {
  const text = (body ?? '').trim();
  if (text) return text.slice(0, 160);
  if (attachments && attachments.length > 0) return '[Attachment]';
  return '';
}

function toThreadDto(
  doc: any,
  extras?: {
    customerName?: string | null;
    customerPhone?: string | null;
    itemSku?: string | null;
    itemTitle?: string | null;
  },
): ChatThreadDto {
  return {
    id: String(doc._id),
    customerId: String(doc.customerId),
    customerName: extras?.customerName ?? null,
    customerPhone: extras?.customerPhone ?? null,
    subject: doc.subject ?? null,
    itemId: doc.itemId ? String(doc.itemId) : null,
    itemSku: extras?.itemSku ?? null,
    itemTitle: extras?.itemTitle ?? null,
    status: doc.status,
    lastMessageAt: doc.lastMessageAt ? new Date(doc.lastMessageAt).toISOString() : null,
    lastMessagePreview: doc.lastMessagePreview ?? null,
    unreadCustomer: doc.unreadCustomer ?? 0,
    unreadStaff: doc.unreadStaff ?? 0,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

function toMessageDto(doc: any): ChatMessageDto {
  return {
    id: String(doc._id),
    threadId: String(doc.threadId),
    senderType: doc.senderType,
    senderId: String(doc.senderId),
    body: doc.body ?? null,
    attachmentUrls: doc.attachmentUrls ?? [],
    clientMessageId: doc.clientMessageId ?? null,
    sentAt: new Date(doc.sentAt ?? doc.createdAt).toISOString(),
    readAt: doc.readAt ? new Date(doc.readAt).toISOString() : null,
  };
}

async function enrichThread(doc: any): Promise<ChatThreadDto> {
  const [customer, item] = await Promise.all([
    CustomerModel.findById(doc.customerId).select('name phone').lean().exec(),
    doc.itemId
      ? ItemModel.findById(doc.itemId).select('sku title').lean().exec()
      : Promise.resolve(null),
  ]);
  return toThreadDto(doc, {
    customerName: (customer as any)?.name ?? null,
    customerPhone: (customer as any)?.phone ?? null,
    itemSku: (item as any)?.sku ?? null,
    itemTitle: (item as any)?.title ?? null,
  });
}

export async function createOrGetThread(input: {
  customerId: string;
  itemId?: string | null;
  subject?: string | null;
}): Promise<{ thread: ChatThreadDto; created: boolean }> {
  assertDb();
  if (!Types.ObjectId.isValid(input.customerId)) {
    throw badRequest('VALIDATION_ERROR', 'Invalid customerId');
  }

  let itemOid: Types.ObjectId | null = null;
  let subject = input.subject?.trim() || null;

  if (input.itemId) {
    if (!Types.ObjectId.isValid(input.itemId)) {
      throw badRequest('VALIDATION_ERROR', 'Invalid itemId');
    }
    itemOid = new Types.ObjectId(input.itemId);
    const item = await ItemModel.findOne({
      _id: itemOid,
      deletedAt: null,
      status: 'active',
    })
      .select('sku title')
      .lean()
      .exec();
    if (!item) throw notFound('ITEM_NOT_FOUND', 'Item not found');
    if (!subject) subject = `Item ${(item as any).sku}`;
  }

  const openFilter: Record<string, unknown> = {
    customerId: new Types.ObjectId(input.customerId),
    deletedAt: null,
    status: { $in: ['open', 'pending_customer', 'pending_staff'] },
  };
  if (itemOid) {
    openFilter.itemId = itemOid;
  } else {
    openFilter.itemId = null;
  }

  const existing = await ChatThreadModel.findOne(openFilter)
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .exec();
  if (existing) {
    return { thread: await enrichThread(existing), created: false };
  }

  const created = await ChatThreadModel.create({
    customerId: new Types.ObjectId(input.customerId),
    itemId: itemOid,
    subject: subject ?? 'General',
    status: 'open',
    unreadCustomer: 0,
    unreadStaff: 0,
  });

  return { thread: await enrichThread(created), created: true };
}

export async function listCustomerThreads(customerId: string): Promise<{ threads: ChatThreadDto[] }> {
  assertDb();
  const docs = await ChatThreadModel.find({
    customerId: new Types.ObjectId(customerId),
    deletedAt: null,
  })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .limit(100)
    .exec();
  const threads = await Promise.all(docs.map((d) => enrichThread(d)));
  return { threads };
}

export async function listAdminThreads(input: {
  status?: ThreadStatus;
}): Promise<{ threads: ChatThreadDto[] }> {
  assertDb();
  const filter: Record<string, unknown> = { deletedAt: null };
  if (input.status) filter.status = input.status;
  const docs = await ChatThreadModel.find(filter)
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .limit(200)
    .exec();
  const threads = await Promise.all(docs.map((d) => enrichThread(d)));
  return { threads };
}

async function loadThreadForActor(input: {
  threadId: string;
  customerId?: string;
  isAdmin?: boolean;
}) {
  assertDb();
  if (!Types.ObjectId.isValid(input.threadId)) {
    throw badRequest('VALIDATION_ERROR', 'Invalid threadId');
  }
  const thread = await ChatThreadModel.findOne({
    _id: input.threadId,
    deletedAt: null,
  }).exec();
  if (!thread) throw notFound('THREAD_NOT_FOUND', 'Chat thread not found');

  if (input.isAdmin) return thread;
  if (!input.customerId || String(thread.customerId) !== input.customerId) {
    throw forbidden('FORBIDDEN', 'You do not have access to this thread');
  }
  return thread;
}

export async function getThreadForActor(input: {
  threadId: string;
  customerId?: string;
  isAdmin?: boolean;
}): Promise<ChatThreadDto> {
  const thread = await loadThreadForActor(input);
  return enrichThread(thread);
}

export async function listMessages(input: {
  threadId: string;
  customerId?: string;
  isAdmin?: boolean;
  limit?: number;
  before?: string;
}): Promise<{ messages: ChatMessageDto[]; nextCursor: string | null }> {
  const thread = await loadThreadForActor(input);
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
  const filter: Record<string, unknown> = {
    threadId: thread._id,
    deletedAt: null,
  };
  if (input.before && Types.ObjectId.isValid(input.before)) {
    filter._id = { $lt: new Types.ObjectId(input.before) };
  }

  const docs = await ChatMessageModel.find(filter)
    .sort({ sentAt: -1, _id: -1 })
    .limit(limit + 1)
    .exec();

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const chronological = [...page].reverse();
  return {
    messages: chronological.map(toMessageDto),
    nextCursor: hasMore ? String(page[page.length - 1]._id) : null,
  };
}

export async function sendMessage(input: {
  threadId: string;
  senderType: 'customer' | 'staff';
  senderId: string;
  body?: string | null;
  attachmentUrls?: string[];
  clientMessageId?: string | null;
  customerId?: string;
  isAdmin?: boolean;
}): Promise<{ message: ChatMessageDto; created: boolean }> {
  const thread = await loadThreadForActor({
    threadId: input.threadId,
    customerId: input.customerId,
    isAdmin: input.isAdmin,
  });

  const body = input.body?.trim() || null;
  const attachmentUrls = (input.attachmentUrls ?? []).filter(Boolean).slice(0, 10);
  if (!body && attachmentUrls.length === 0) {
    throw badRequest('VALIDATION_ERROR', 'Message body or attachment required');
  }
  if (body && body.length > 4000) {
    throw badRequest('VALIDATION_ERROR', 'Message body too long');
  }

  const clientMessageId = input.clientMessageId?.trim() || null;
  if (clientMessageId) {
    const existing = await ChatMessageModel.findOne({
      threadId: thread._id,
      clientMessageId,
    }).exec();
    if (existing) {
      return { message: toMessageDto(existing), created: false };
    }
  }

  try {
    const msg = await ChatMessageModel.create({
      threadId: thread._id,
      senderType: input.senderType,
      senderId: new Types.ObjectId(input.senderId),
      body,
      attachmentUrls,
      clientMessageId,
      sentAt: new Date(),
    });

    const preview = previewFrom(body, attachmentUrls);
    thread.lastMessageAt = msg.sentAt;
    thread.lastMessagePreview = preview;
    if (input.senderType === 'customer') {
      thread.unreadStaff = (thread.unreadStaff ?? 0) + 1;
      if (thread.status === 'pending_customer' || thread.status === 'open') {
        thread.status = 'pending_staff';
      }
    } else {
      thread.unreadCustomer = (thread.unreadCustomer ?? 0) + 1;
      if (thread.status !== 'closed') {
        thread.status = 'pending_customer';
      }
    }
    await thread.save();

    // Opaque FCM nudge — customer only when staff replies
    if (input.senderType === 'staff') {
      const customerId = String(thread.customerId);
      try {
        await notifyChatMessage({
          customerId,
          threadId: String(thread._id),
        });
      } catch {
        /* best-effort */
      }
    }

    return { message: toMessageDto(msg), created: true };
  } catch (err) {
    if (isDuplicateKeyError(err) && clientMessageId) {
      const existing = await ChatMessageModel.findOne({
        threadId: thread._id,
        clientMessageId,
      }).exec();
      if (existing) return { message: toMessageDto(existing), created: false };
    }
    throw err;
  }
}

export async function markThreadRead(input: {
  threadId: string;
  customerId?: string;
  isAdmin?: boolean;
}): Promise<ChatThreadDto> {
  const thread = await loadThreadForActor(input);
  const now = new Date();

  if (input.isAdmin) {
    thread.unreadStaff = 0;
    await ChatMessageModel.updateMany(
      {
        threadId: thread._id,
        senderType: 'customer',
        readAt: null,
        deletedAt: null,
      },
      { $set: { readAt: now } },
    ).exec();
  } else {
    thread.unreadCustomer = 0;
    await ChatMessageModel.updateMany(
      {
        threadId: thread._id,
        senderType: 'staff',
        readAt: null,
        deletedAt: null,
      },
      { $set: { readAt: now } },
    ).exec();
  }
  await thread.save();
  return enrichThread(thread);
}

export async function patchThreadStatus(input: {
  threadId: string;
  status: ThreadStatus;
}): Promise<ChatThreadDto> {
  assertDb();
  if (!THREAD_STATUSES.includes(input.status)) {
    throw badRequest('VALIDATION_ERROR', 'Invalid status');
  }
  const thread = await ChatThreadModel.findOne({
    _id: input.threadId,
    deletedAt: null,
  }).exec();
  if (!thread) throw notFound('THREAD_NOT_FOUND', 'Chat thread not found');
  thread.status = input.status;
  await thread.save();
  return enrichThread(thread);
}
