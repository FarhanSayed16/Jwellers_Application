import QRCode from 'qrcode';
import { env } from '../../config/env';
import { getMongoConnectionState } from '../../db/connection';
import { ItemModel } from '../../db/models/Item';
import { ShopConfigModel } from '../../db/models/ShopConfig';
import { notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

export function itemDeepLink(sku: string) {
  const scheme = (env.APP_DEEP_LINK_SCHEME || 'jwellers').replace(/:\/\/*$/, '');
  const normalized = sku.trim().toUpperCase();
  return `${scheme}://items/sku/${encodeURIComponent(normalized)}`;
}

export async function buildItemPrintTag(itemId: string) {
  assertDb();
  const doc = await ItemModel.findById(itemId).exec();
  if (!doc || doc.deletedAt) throw notFound('ITEM_NOT_FOUND', 'Item not found');

  const shop = await ShopConfigModel.findOne({ isActive: true }).lean();
  const deepLink = itemDeepLink(doc.sku);
  const qrDataUrl = await QRCode.toDataURL(deepLink, {
    margin: 1,
    width: 280,
    errorCorrectionLevel: 'M',
  });

  const purity = doc.purity ?? '—';
  const weight =
    typeof doc.netWeightGrams === 'number'
      ? `${doc.netWeightGrams} g net`
      : typeof doc.grossWeightGrams === 'number'
        ? `${doc.grossWeightGrams} g gross`
        : '—';

  const tagHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Tag ${escapeHtml(doc.sku)}</title>
<style>
  @page { size: 50mm 30mm; margin: 2mm; }
  body { font-family: system-ui, sans-serif; margin: 0; color: #111; }
  .tag { display: flex; gap: 8px; align-items: center; border: 1px solid #ccc; padding: 8px; width: 180px; }
  img { width: 72px; height: 72px; }
  .meta { font-size: 11px; line-height: 1.35; }
  .sku { font-weight: 700; font-size: 13px; }
  .muted { color: #666; font-size: 10px; }
</style></head><body>
<div class="tag">
  <img src="${qrDataUrl}" alt="QR"/>
  <div class="meta">
    <div class="sku">${escapeHtml(doc.sku)}</div>
    <div>${escapeHtml(doc.title)}</div>
    <div>${escapeHtml(String(purity))} · ${escapeHtml(weight)}</div>
    <div class="muted">${escapeHtml(shop?.shopName ?? 'Jewellers')}</div>
  </div>
</div>
<p class="muted">Scan opens ${escapeHtml(deepLink)}</p>
</body></html>`;

  return {
    itemId: String(doc._id),
    sku: doc.sku,
    title: doc.title,
    purity: doc.purity ?? null,
    netWeightGrams: doc.netWeightGrams ?? null,
    grossWeightGrams: doc.grossWeightGrams ?? null,
    deepLink,
    qrDataUrl,
    tagHtml,
  };
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
