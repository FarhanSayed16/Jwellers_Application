import { Types } from 'mongoose';
import { env } from '../../config/env';
import { getMongoConnectionState } from '../../db/connection';
import { CustomerModel } from '../../db/models/Customer';
import { OfferModel } from '../../db/models/Offer';
import { WaBroadcastModel } from '../../db/models/WaBroadcast';
import { getLatestRate } from '../rates/rates.service';
import { badRequest, notFound } from '../../utils/errors';
import { writeAuditLog } from '../../utils/audit';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function toDto(doc: any) {
  return {
    id: String(doc._id),
    kind: doc.kind as 'rates' | 'offer',
    status: doc.status as string,
    templateName: doc.templateName ?? '',
    offerId: doc.offerId ? String(doc.offerId) : null,
    recipientCount: doc.recipientCount ?? 0,
    dryRun: Boolean(doc.dryRun),
    provider: doc.provider ?? 'stub',
    payloadPreview: doc.payloadPreview ?? '',
    error: doc.error ?? null,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

/** Recipients who opted into WhatsApp marketing (P-11). */
async function listOptInPhones(): Promise<string[]> {
  const rows = await CustomerModel.find({
    whatsappMarketingOptIn: true,
    isActive: { $ne: false },
    deletedAt: null,
  })
    .select({ phone: 1 })
    .lean()
    .exec();
  return rows
    .map((r) => String(r.phone || '').replace(/\D/g, ''))
    .filter((p) => p.length >= 10);
}

async function countOptInRecipients(): Promise<number> {
  return CustomerModel.countDocuments({
    whatsappMarketingOptIn: true,
    isActive: { $ne: false },
    deletedAt: null,
  });
}

function toE164India(phoneDigits: string): string {
  const d = phoneDigits.replace(/\D/g, '');
  if (d.length === 10) return `91${d}`;
  if (d.startsWith('91') && d.length === 12) return d;
  return d;
}

/**
 * Meta Cloud API template send. Other BSPs often mirror this Graph shape with a bearer token.
 * Keep WA_BSP_DRY_RUN=true until templates are approved.
 */
async function sendMetaTemplate(input: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  templateName: string;
  bodyParams: string[];
  languageCode?: string;
}): Promise<void> {
  const components =
    input.bodyParams.length > 0
      ? [
          {
            type: 'body',
            parameters: input.bodyParams.map((text) => ({ type: 'text', text })),
          },
        ]
      : undefined;

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${input.phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: input.to,
        type: 'template',
        template: {
          name: input.templateName,
          language: { code: input.languageCode || 'en' },
          ...(components ? { components } : {}),
        },
      }),
    },
  );

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message || `Meta Graph HTTP ${res.status}`);
  }
}

/**
 * BSP send — dry-run by default (WA_BSP_DRY_RUN or missing credentials).
 * Live Meta Cloud API when keys present and dry-run off (P-04).
 */
async function dispatchTemplate(input: {
  templateName: string;
  bodyParams: string[];
  phones: string[];
}): Promise<{
  dryRun: boolean;
  provider: string;
  status: 'dry_run' | 'sent' | 'failed';
  error?: string;
  sentCount?: number;
}> {
  const provider = env.WA_BSP_PROVIDER || 'stub';
  const hasCreds = Boolean(env.WA_BSP_API_KEY && env.WA_BSP_PHONE_NUMBER_ID);
  const dryRun = env.WA_BSP_DRY_RUN || !hasCreds;

  if (dryRun) {
    return {
      dryRun: true,
      provider: hasCreds ? provider : 'stub',
      status: 'dry_run',
      sentCount: 0,
    };
  }

  if (input.phones.length === 0) {
    return {
      dryRun: false,
      provider,
      status: 'failed',
      error: 'No customers with WhatsApp marketing opt-in',
      sentCount: 0,
    };
  }

  try {
    let sent = 0;
    const errors: string[] = [];
    for (const phone of input.phones) {
      try {
        await sendMetaTemplate({
          phoneNumberId: env.WA_BSP_PHONE_NUMBER_ID,
          accessToken: env.WA_BSP_API_KEY,
          to: toE164India(phone),
          templateName: input.templateName,
          bodyParams: input.bodyParams,
        });
        sent += 1;
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err));
      }
    }
    if (sent === 0) {
      return {
        dryRun: false,
        provider,
        status: 'failed',
        error: errors[0] || 'All BSP sends failed',
        sentCount: 0,
      };
    }
    return {
      dryRun: false,
      provider,
      status: 'sent',
      sentCount: sent,
      error: errors.length ? `${errors.length} recipient(s) failed` : undefined,
    };
  } catch (err) {
    return {
      dryRun: false,
      provider,
      status: 'failed',
      error: err instanceof Error ? err.message : 'BSP send failed',
      sentCount: 0,
    };
  }
}

export async function getWhatsappBusinessStatus() {
  const optInCount = await countOptInRecipients().catch(() => 0);
  return {
    provider: env.WA_BSP_PROVIDER || 'stub',
    hasApiKey: Boolean(env.WA_BSP_API_KEY),
    hasPhoneNumberId: Boolean(env.WA_BSP_PHONE_NUMBER_ID),
    dryRun: env.WA_BSP_DRY_RUN || !env.WA_BSP_API_KEY || !env.WA_BSP_PHONE_NUMBER_ID,
    optInRecipientCount: optInCount,
    templates: {
      rates: env.WA_TEMPLATE_RATES || 'morning_rates',
      offer: env.WA_TEMPLATE_OFFER || 'offer_broadcast',
    },
    setupGuide: 'docs/phase34/BSP_SETUP_GUIDE.md',
    costDisclosure:
      'Meta conversation + BSP fees are Client-paid (~₹0.30–1.50/conversation). See RUNNING_COSTS.md.',
  };
}

export async function listBroadcasts(limit = 20) {
  assertDb();
  const docs = await WaBroadcastModel.find()
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 100))
    .exec();
  return { broadcasts: docs.map(toDto) };
}

export async function broadcastMorningRates(input: { adminId: string; ip?: string }) {
  assertDb();
  const latest = await getLatestRate();
  if (!latest) {
    throw badRequest('RATES_NOT_SET', 'Publish today’s rates before broadcasting');
  }

  const templateName = env.WA_TEMPLATE_RATES || 'morning_rates';
  const phones = await listOptInPhones();
  const recipientCount = phones.length;
  const bodyParams = [
    String(latest.gold22kPerGram),
    String(latest.gold24kPerGram),
    String(latest.silverPerGram),
  ];
  const payloadPreview = `22K ₹${latest.gold22kPerGram}/g · 24K ₹${latest.gold24kPerGram}/g · Silver ₹${latest.silverPerGram}/g`;

  const result = await dispatchTemplate({ templateName, bodyParams, phones });

  const doc = await WaBroadcastModel.create({
    kind: 'rates',
    status: result.status,
    templateName,
    recipientCount,
    dryRun: result.dryRun,
    provider: result.provider,
    payloadPreview,
    error: result.error,
    createdBy: new Types.ObjectId(input.adminId),
  });

  await writeAuditLog({
    actorType: 'admin',
    actorId: input.adminId,
    action: 'wa.broadcast.rates',
    entityType: 'WaBroadcast',
    entityId: String(doc._id),
    after: toDto(doc),
    ip: input.ip,
  });

  return { broadcast: toDto(doc) };
}

export async function broadcastOffer(input: {
  offerId: string;
  adminId: string;
  ip?: string;
}) {
  assertDb();
  if (!Types.ObjectId.isValid(input.offerId)) {
    throw badRequest('VALIDATION_ERROR', 'Invalid offerId');
  }
  const offer = await OfferModel.findOne({ _id: input.offerId, deletedAt: null }).exec();
  if (!offer) throw notFound('OFFER_NOT_FOUND', 'Offer not found');

  const templateName = env.WA_TEMPLATE_OFFER || 'offer_broadcast';
  const phones = await listOptInPhones();
  const recipientCount = phones.length;
  const bodyParams = [offer.title, offer.description || ''];
  const payloadPreview = `${offer.title}${offer.description ? ` — ${offer.description}` : ''}`;

  const result = await dispatchTemplate({ templateName, bodyParams, phones });

  const doc = await WaBroadcastModel.create({
    kind: 'offer',
    status: result.status,
    templateName,
    offerId: offer._id,
    recipientCount,
    dryRun: result.dryRun,
    provider: result.provider,
    payloadPreview: payloadPreview.slice(0, 500),
    error: result.error,
    createdBy: new Types.ObjectId(input.adminId),
  });

  await writeAuditLog({
    actorType: 'admin',
    actorId: input.adminId,
    action: 'wa.broadcast.offer',
    entityType: 'WaBroadcast',
    entityId: String(doc._id),
    after: toDto(doc),
    ip: input.ip,
  });

  return { broadcast: toDto(doc) };
}

export async function setWhatsappMarketingOptIn(customerId: string, optIn: boolean) {
  assertDb();
  if (!Types.ObjectId.isValid(customerId)) {
    throw badRequest('VALIDATION_ERROR', 'Invalid customerId');
  }
  const doc = await CustomerModel.findByIdAndUpdate(
    customerId,
    {
      $set: {
        whatsappMarketingOptIn: optIn,
        whatsappMarketingOptInAt: optIn ? new Date() : null,
      },
    },
    { returnDocument: 'after' },
  ).exec();
  if (!doc) throw notFound('CUSTOMER_NOT_FOUND', 'Customer not found');
  return {
    whatsappMarketingOptIn: Boolean(doc.whatsappMarketingOptIn),
    whatsappMarketingOptInAt: doc.whatsappMarketingOptInAt
      ? new Date(doc.whatsappMarketingOptInAt).toISOString()
      : null,
  };
}

export async function getWhatsappMarketingOptIn(customerId: string) {
  assertDb();
  const doc = await CustomerModel.findById(customerId)
    .select({ whatsappMarketingOptIn: 1, whatsappMarketingOptInAt: 1 })
    .lean()
    .exec();
  if (!doc) throw notFound('CUSTOMER_NOT_FOUND', 'Customer not found');
  return {
    whatsappMarketingOptIn: Boolean(doc.whatsappMarketingOptIn),
    whatsappMarketingOptInAt: doc.whatsappMarketingOptInAt
      ? new Date(doc.whatsappMarketingOptInAt as Date).toISOString()
      : null,
  };
}
