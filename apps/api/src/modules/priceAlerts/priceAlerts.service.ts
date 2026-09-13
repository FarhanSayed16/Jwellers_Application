import { Types } from 'mongoose';
import { isFeatureEnabled } from '../../config/features';
import { getMongoConnectionState } from '../../db/connection';
import { PriceAlertModel } from '../../db/models/PriceAlert';
import { notifyCustomers } from '../devices/devices.service';
import { badRequest, notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

function toDto(doc: {
  _id: { toString(): string };
  customerId: { toString(): string };
  purity: string;
  belowAmount: number;
  status: string;
  triggeredAt?: Date | null;
  triggeredRate?: number | null;
  createdAt: Date;
}) {
  return {
    id: String(doc._id),
    customerId: String(doc.customerId),
    purity: doc.purity,
    belowAmount: doc.belowAmount,
    status: doc.status,
    triggeredAt: doc.triggeredAt ? new Date(doc.triggeredAt).toISOString() : null,
    triggeredRate: doc.triggeredRate ?? null,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export async function createPriceAlert(input: {
  customerId: string;
  purity: '24K' | '22K' | '18K' | 'silver';
  belowAmount: number;
}) {
  assertDb();
  if (!Number.isFinite(input.belowAmount) || input.belowAmount <= 0) {
    throw badRequest('VALIDATION_ERROR', 'belowAmount must be positive');
  }
  const doc = await PriceAlertModel.create({
    customerId: input.customerId,
    purity: input.purity,
    belowAmount: input.belowAmount,
    status: 'active',
  });
  return toDto(doc);
}

export async function listMyPriceAlerts(customerId: string) {
  assertDb();
  const rows = await PriceAlertModel.find({ customerId }).sort({ createdAt: -1 }).limit(50).exec();
  return { alerts: rows.map(toDto) };
}

export async function listAdminPriceAlerts(status?: string) {
  assertDb();
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const rows = await PriceAlertModel.find(filter).sort({ createdAt: -1 }).limit(100).exec();
  return { alerts: rows.map(toDto) };
}

/** Called after a new rate is published — marks matching alerts triggered. */
export async function evaluatePriceAlerts(rates: {
  gold24kPerGram: number;
  gold22kPerGram: number;
  gold18kPerGram: number;
  silverPerGram: number;
}) {
  if (!isFeatureEnabled('priceAlerts')) return { triggered: 0 };
  assertDb();
  const active = await PriceAlertModel.find({ status: 'active' }).exec();
  let triggered = 0;
  for (const alert of active) {
    const current =
      alert.purity === '24K'
        ? rates.gold24kPerGram
        : alert.purity === '18K'
          ? rates.gold18kPerGram
          : alert.purity === 'silver'
            ? rates.silverPerGram
            : rates.gold22kPerGram;
    if (current <= alert.belowAmount) {
      alert.status = 'triggered';
      alert.triggeredAt = new Date();
      alert.triggeredRate = current;
      await alert.save();
      triggered += 1;
      const customerId = String(alert.customerId);
      const purity = alert.purity;
      const below = alert.belowAmount;
      void notifyCustomers({
        type: 'price_alert',
        title: 'Price alert',
        body: `${purity} is now ₹${current}/g (your target ≤ ₹${below}/g).`,
        data: { purity, belowAmount: String(below), rate: String(current) },
        customerIds: [customerId],
      }).catch((err) => {
        console.warn(
          '[priceAlerts] FCM notify failed',
          err instanceof Error ? err.message : err,
        );
      });
    }
  }
  return { triggered };
}

export async function cancelPriceAlert(customerId: string, id: string) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('ALERT_NOT_FOUND', 'Alert not found');
  const doc = await PriceAlertModel.findOne({ _id: id, customerId }).exec();
  if (!doc) throw notFound('ALERT_NOT_FOUND', 'Alert not found');
  doc.status = 'cancelled';
  await doc.save();
  return toDto(doc);
}
