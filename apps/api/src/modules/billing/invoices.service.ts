import { Types } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env';
import { getMongoConnectionState } from '../../db/connection';
import { InvoiceModel } from '../../db/models/Invoice';
import { ShopConfigModel } from '../../db/models/ShopConfig';
import { RateModel } from '../../db/models/Rate';
import { badRequest, notFound } from '../../utils/errors';

function assertDb() {
  if (getMongoConnectionState().readyState !== 1) {
    throw notFound('DATABASE_UNAVAILABLE', 'Database is not connected');
  }
}

export type InvoiceLineInput = {
  description: string;
  sku?: string;
  purity?: string;
  weightGrams?: number;
  ratePerGram?: number;
  makingChargeAmount?: number;
  gstAmount?: number;
  lineTotal: number;
};

function toDto(doc: {
  _id: { toString(): string };
  invoiceNumber: string;
  customerId?: { toString(): string } | null;
  enquiryId?: { toString(): string } | null;
  itemId?: { toString(): string } | null;
  lineItems: InvoiceLineInput[];
  subtotal: number;
  gstTotal: number;
  grandTotal: number;
  rateSnapshot?: Record<string, unknown> | null;
  pdfUrl?: string | null;
  status: string;
  issuedAt?: Date | null;
  createdAt: Date;
}) {
  return {
    id: String(doc._id),
    invoiceNumber: doc.invoiceNumber,
    customerId: doc.customerId ? String(doc.customerId) : null,
    enquiryId: doc.enquiryId ? String(doc.enquiryId) : null,
    itemId: doc.itemId ? String(doc.itemId) : null,
    lineItems: doc.lineItems,
    subtotal: doc.subtotal,
    gstTotal: doc.gstTotal,
    grandTotal: doc.grandTotal,
    rateSnapshot: doc.rateSnapshot ?? null,
    pdfUrl: doc.pdfUrl ?? null,
    status: doc.status,
    issuedAt: doc.issuedAt ? new Date(doc.issuedAt).toISOString() : null,
    createdAt: new Date(doc.createdAt).toISOString(),
    shareText: `Invoice ${doc.invoiceNumber} — ₹${doc.grandTotal.toFixed(2)}${doc.pdfUrl ? `\n${doc.pdfUrl}` : ''}`,
  };
}

async function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const last = await InvoiceModel.findOne({ invoiceNumber: new RegExp(`^${prefix}`) })
    .sort({ invoiceNumber: -1 })
    .select({ invoiceNumber: 1 })
    .lean();
  let seq = 1;
  if (last?.invoiceNumber) {
    const n = Number(String(last.invoiceNumber).split('-').pop());
    if (Number.isFinite(n)) seq = n + 1;
  }
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

function buildInvoiceHtml(input: {
  shopName: string;
  gstNumber?: string | null;
  invoiceNumber: string;
  lineItems: InvoiceLineInput[];
  subtotal: number;
  gstTotal: number;
  grandTotal: number;
  issuedAt: Date;
}) {
  const rows = input.lineItems
    .map(
      (l) =>
        `<tr><td>${escapeHtml(l.description)}</td><td>${l.weightGrams ?? ''}</td><td>${l.ratePerGram ?? ''}</td><td>${l.lineTotal.toFixed(2)}</td></tr>`,
    )
    .join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${input.invoiceNumber}</title>
<style>body{font-family:system-ui,sans-serif;padding:24px;color:#111}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border:1px solid #ddd;padding:8px;text-align:left}.muted{color:#666;font-size:12px}</style>
</head><body>
<h1>${escapeHtml(input.shopName)}</h1>
<p class="muted">Proforma / estimate — CA review required before GST tax-invoice use.</p>
<p><strong>${escapeHtml(input.invoiceNumber)}</strong> · ${input.issuedAt.toISOString().slice(0, 10)}</p>
${input.gstNumber ? `<p>GSTIN: ${escapeHtml(input.gstNumber)}</p>` : '<p class="muted">GSTIN not set on shop config</p>'}
<table><thead><tr><th>Description</th><th>Wt (g)</th><th>Rate</th><th>Total</th></tr></thead>
<tbody>${rows}</tbody></table>
<p>Subtotal: ₹${input.subtotal.toFixed(2)}<br/>GST: ₹${input.gstTotal.toFixed(2)}<br/><strong>Grand total: ₹${input.grandTotal.toFixed(2)}</strong></p>
</body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function uploadInvoiceHtml(html: string, invoiceNumber: string): Promise<string | null> {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || env.CLOUDINARY_API_SECRET || '').trim();
  if (!cloudName || !apiKey || !apiSecret) return null;

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  const dataUri = `data:text/html;base64,${Buffer.from(html, 'utf8').toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    resource_type: 'raw',
    folder: `clients/${env.CLIENT_SLUG}/invoices`,
    public_id: invoiceNumber.toLowerCase(),
    overwrite: true,
  });
  return result.secure_url as string;
}

export async function createInvoice(input: {
  customerId?: string | null;
  enquiryId?: string | null;
  itemId?: string | null;
  lineItems: InvoiceLineInput[];
  status?: 'draft' | 'issued';
  adminId: string;
}) {
  assertDb();
  if (!input.lineItems?.length) throw badRequest('VALIDATION_ERROR', 'At least one line item required');

  const subtotal = input.lineItems.reduce((s, l) => s + (l.lineTotal - (l.gstAmount ?? 0)), 0);
  const gstTotal = input.lineItems.reduce((s, l) => s + (l.gstAmount ?? 0), 0);
  const grandTotal = input.lineItems.reduce((s, l) => s + l.lineTotal, 0);

  const latest = await RateModel.findOne().sort({ effectiveAt: -1 }).lean();
  const shop = await ShopConfigModel.findOne({ isActive: true }).lean();
  const invoiceNumber = await nextInvoiceNumber();
  const status = input.status ?? 'issued';
  const issuedAt = status === 'issued' ? new Date() : null;

  let pdfUrl: string | null = null;
  if (status === 'issued') {
    const html = buildInvoiceHtml({
      shopName: shop?.shopName ?? 'Jewellers',
      gstNumber: shop?.gstNumber,
      invoiceNumber,
      lineItems: input.lineItems,
      subtotal,
      gstTotal,
      grandTotal,
      issuedAt: issuedAt!,
    });
    try {
      pdfUrl = await uploadInvoiceHtml(html, invoiceNumber);
    } catch {
      pdfUrl = null;
    }
  }

  const doc = await InvoiceModel.create({
    invoiceNumber,
    customerId: input.customerId || undefined,
    enquiryId: input.enquiryId || undefined,
    itemId: input.itemId || undefined,
    lineItems: input.lineItems,
    subtotal,
    gstTotal,
    grandTotal,
    rateSnapshot: latest
      ? {
          gold24k: latest.gold24kPerGram,
          gold22k: latest.gold22kPerGram,
          gold18k: latest.gold18kPerGram,
          silver: latest.silverPerGram,
          effectiveAt: latest.effectiveAt,
        }
      : undefined,
    pdfUrl: pdfUrl || undefined,
    status,
    issuedAt: issuedAt || undefined,
    createdBy: input.adminId,
  });

  return toDto(doc);
}

export async function listAdminInvoices(limit = 50) {
  assertDb();
  const rows = await InvoiceModel.find()
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 100))
    .exec();
  return { invoices: rows.map(toDto) };
}

export async function listCustomerInvoices(customerId: string, limit = 50) {
  assertDb();
  const rows = await InvoiceModel.find({ customerId })
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 100))
    .exec();
  return { invoices: rows.map(toDto) };
}

export async function getInvoiceForActor(
  id: string,
  actor: { adminId?: string; customerId?: string },
) {
  assertDb();
  if (!Types.ObjectId.isValid(id)) throw notFound('INVOICE_NOT_FOUND', 'Invoice not found');
  const doc = await InvoiceModel.findById(id).exec();
  if (!doc) throw notFound('INVOICE_NOT_FOUND', 'Invoice not found');
  if (actor.adminId) return toDto(doc);
  if (actor.customerId && doc.customerId && String(doc.customerId) === actor.customerId) {
    return toDto(doc);
  }
  throw notFound('INVOICE_NOT_FOUND', 'Invoice not found');
}
