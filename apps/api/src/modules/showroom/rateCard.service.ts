import { getMongoConnectionState } from '../../db/connection';
import { RateModel } from '../../db/models/Rate';
import { ShopConfigModel } from '../../db/models/ShopConfig';
import { badRequest, notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

export async function buildRateShareCard() {
  assertDb();
  const latest = await RateModel.findOne().sort({ effectiveAt: -1 }).lean();
  if (!latest) throw badRequest('NO_RATES', 'Publish a rate before sharing a rate card');

  const shop = await ShopConfigModel.findOne({ isActive: true }).lean();
  const shopName = shop?.shopName ?? 'Jewellers';
  const when = new Date(latest.effectiveAt).toISOString().slice(0, 16).replace('T', ' ');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>${escapeHtml(shopName)} — Today’s rates</title>
<style>
  body { font-family: Georgia, serif; margin: 0; padding: 24px; background: #1a1510; color: #f5e6c8; }
  .card { max-width: 420px; margin: 0 auto; border: 1px solid #c9a227; padding: 24px; border-radius: 8px; }
  h1 { font-size: 22px; margin: 0 0 4px; color: #c9a227; }
  .sub { color: #b8a990; font-size: 13px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 10px 0; border-bottom: 1px solid #3a3228; }
  td:last-child { text-align: right; font-weight: 700; }
  .foot { margin-top: 16px; font-size: 11px; color: #8a7d6a; }
</style></head><body>
<div class="card">
  <h1>${escapeHtml(shopName)}</h1>
  <div class="sub">Today’s rates · ${escapeHtml(when)}</div>
  <table>
    <tr><td>Gold 24K / g</td><td>₹${latest.gold24kPerGram.toFixed(2)}</td></tr>
    <tr><td>Gold 22K / g</td><td>₹${latest.gold22kPerGram.toFixed(2)}</td></tr>
    <tr><td>Gold 18K / g</td><td>₹${latest.gold18kPerGram.toFixed(2)}</td></tr>
    <tr><td>Silver / g</td><td>₹${latest.silverPerGram.toFixed(2)}</td></tr>
  </table>
  <p class="foot">Indicative. Final price at purchase may vary with making &amp; GST.</p>
</div>
</body></html>`;

  const shareText = [
    `${shopName} — today’s rates (${when})`,
    `24K ₹${latest.gold24kPerGram.toFixed(0)}/g · 22K ₹${latest.gold22kPerGram.toFixed(0)}/g`,
    `18K ₹${latest.gold18kPerGram.toFixed(0)}/g · Silver ₹${latest.silverPerGram.toFixed(0)}/g`,
  ].join('\n');

  return {
    shopName,
    effectiveAt: new Date(latest.effectiveAt).toISOString(),
    rates: {
      gold24kPerGram: latest.gold24kPerGram,
      gold22kPerGram: latest.gold22kPerGram,
      gold18kPerGram: latest.gold18kPerGram,
      silverPerGram: latest.silverPerGram,
    },
    html,
    shareText,
  };
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
