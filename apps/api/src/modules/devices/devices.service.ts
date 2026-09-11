import { Types } from 'mongoose';
import { getMongoConnectionState } from '../../db/connection';
import { DeviceModel } from '../../db/models/Device';
import { sendFcmToTokens, type FcmPushType, type FcmSendResult } from '../../services/fcm';
import { badRequest, notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

export type DeviceDto = {
  id: string;
  platform: 'android' | 'ios';
  isActive: boolean;
  lastSeenAt: string | null;
  createdAt: string;
};

function toDto(doc: {
  _id: { toString(): string };
  platform: 'android' | 'ios';
  isActive?: boolean | null;
  lastSeenAt?: Date | null;
  createdAt: Date;
}): DeviceDto {
  return {
    id: String(doc._id),
    platform: doc.platform,
    isActive: Boolean(doc.isActive),
    lastSeenAt: doc.lastSeenAt ? new Date(doc.lastSeenAt).toISOString() : null,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export async function upsertDevice(input: {
  customerId: string;
  fcmToken: string;
  platform: 'android' | 'ios';
}): Promise<DeviceDto> {
  assertDb();
  const fcmToken = input.fcmToken.trim();
  if (!fcmToken || fcmToken.length < 20) {
    throw badRequest('VALIDATION_ERROR', 'fcmToken is required');
  }
  if (!Types.ObjectId.isValid(input.customerId)) {
    throw badRequest('VALIDATION_ERROR', 'customerId is invalid');
  }

  const now = new Date();
  const doc = await DeviceModel.findOneAndUpdate(
    { fcmToken },
    {
      $set: {
        customerId: new Types.ObjectId(input.customerId),
        platform: input.platform,
        isActive: true,
        lastSeenAt: now,
      },
      $setOnInsert: { fcmToken },
    },
    { upsert: true, returnDocument: 'after' },
  ).exec();

  return toDto(doc!);
}

export async function deactivateDevice(input: {
  customerId: string;
  fcmToken?: string;
  deviceId?: string;
}): Promise<{ ok: true; deactivated: number }> {
  assertDb();
  const filter: Record<string, unknown> = {
    customerId: input.customerId,
    isActive: true,
  };
  if (input.deviceId) {
    if (!Types.ObjectId.isValid(input.deviceId)) {
      throw badRequest('VALIDATION_ERROR', 'deviceId is invalid');
    }
    filter._id = input.deviceId;
  } else if (input.fcmToken?.trim()) {
    filter.fcmToken = input.fcmToken.trim();
  } else {
    throw badRequest('VALIDATION_ERROR', 'fcmToken or deviceId is required');
  }

  const res = await DeviceModel.updateMany(filter, {
    $set: { isActive: false, lastSeenAt: new Date() },
  }).exec();
  return { ok: true, deactivated: res.modifiedCount ?? 0 };
}

export async function deactivateTokens(tokens: string[]): Promise<number> {
  if (tokens.length === 0) return 0;
  const res = await DeviceModel.updateMany(
    { fcmToken: { $in: tokens } },
    { $set: { isActive: false } },
  ).exec();
  return res.modifiedCount ?? 0;
}

export async function listActiveTokens(input?: {
  customerIds?: string[];
}): Promise<string[]> {
  assertDb();
  const filter: Record<string, unknown> = { isActive: true };
  if (input?.customerIds?.length) {
    filter.customerId = {
      $in: input.customerIds.filter((id) => Types.ObjectId.isValid(id)),
    };
  }
  const docs = await DeviceModel.find(filter).select({ fcmToken: 1 }).lean().exec();
  return docs.map((d) => d.fcmToken).filter(Boolean);
}

export async function notifyCustomers(input: {
  type: FcmPushType;
  title: string;
  body: string;
  data?: Record<string, string>;
  customerIds?: string[];
}): Promise<FcmSendResult & { deactivated: number }> {
  const tokens = await listActiveTokens({ customerIds: input.customerIds });
  const result = await sendFcmToTokens({
    type: input.type,
    tokens,
    title: input.title,
    body: input.body,
    data: input.data,
  });
  const deactivated = await deactivateTokens(result.invalidTokens);
  return { ...result, deactivated };
}

export async function notifyRatesUpdated() {
  return notifyCustomers({
    type: 'rates_updated',
    title: 'Rates updated',
    body: 'Today’s gold and silver rates are available in the app.',
    data: {},
  });
}

export async function notifyNewArrival(itemId: string) {
  return notifyCustomers({
    type: 'new_arrival',
    title: 'New arrival',
    body: 'A new piece was just added. Tap to explore.',
    data: { itemId },
  });
}

export async function notifyChatMessage(input: {
  customerId: string;
  threadId: string;
}) {
  return notifyCustomers({
    type: 'chat_message',
    title: 'New message',
    body: 'You have a new chat message.',
    data: { threadId: input.threadId },
    customerIds: [input.customerId],
  });
}
