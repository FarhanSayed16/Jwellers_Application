/**
 * Live connectivity check for local .env (Atlas, Cloudinary, mail providers).
 * Does not print secrets. Safe to run: npx tsx src/scripts/checkLiveStack.ts
 */
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import { connectMongo, disconnectMongo } from '../db/connection';
import { env } from '../config/env';
import { ShopConfigModel } from '../db/models/ShopConfig';
import { AdminUserModel } from '../db/models/AdminUser';

type Check = { name: string; ok: boolean; detail: string };

async function checkMongo(): Promise<Check> {
  try {
    await connectMongo();
    const ping = await mongoose.connection.db?.admin().ping();
    const shop = await ShopConfigModel.findOne({ isActive: true }).lean();
    const owners = await AdminUserModel.countDocuments({ role: 'owner', isActive: true });
    return {
      name: 'mongodb',
      ok: Boolean(ping),
      detail: `db=${mongoose.connection.name} shop=${shop?.shopName ?? 'none'} owners=${owners}`,
    };
  } catch (e) {
    return {
      name: 'mongodb',
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

async function checkCloudinary(): Promise<Check> {
  const name = env.CLOUDINARY_CLOUD_NAME?.trim();
  const key = env.CLOUDINARY_API_KEY?.trim();
  const secret = env.CLOUDINARY_API_SECRET?.trim();
  if (!name || !key || !secret) {
    return { name: 'cloudinary', ok: false, detail: 'missing CLOUDINARY_* env' };
  }
  try {
    cloudinary.config({ cloud_name: name, api_key: key, api_secret: secret, secure: true });
    const result = await cloudinary.api.ping();
    return {
      name: 'cloudinary',
      ok: result?.status === 'ok',
      detail: `cloud=${name} folderPrefix=clients/${env.CLIENT_SLUG}/ ping=${result?.status}`,
    };
  } catch (e) {
    return {
      name: 'cloudinary',
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

async function checkResend(): Promise<Check> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { name: 'resend', ok: false, detail: 'RESEND_API_KEY not set' };
  }
  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const body = (await res.json().catch(() => ({}))) as {
      data?: Array<{ name?: string; status?: string }>;
      message?: string;
      name?: string;
    };
    if (!res.ok) {
      return {
        name: 'resend',
        ok: false,
        detail: `HTTP ${res.status} ${body.message ?? body.name ?? 'error'}`,
      };
    }
    const domains = (body.data ?? [])
      .map((d) => `${d.name ?? '?'}(${d.status ?? '?'})`)
      .join(', ');
    return {
      name: 'resend',
      ok: true,
      detail: domains ? `domains: ${domains}` : 'API key valid (no domains listed)',
    };
  } catch (e) {
    return {
      name: 'resend',
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

async function checkSendgrid(): Promise<Check> {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  if (!apiKey) {
    return { name: 'sendgrid', ok: false, detail: 'SENDGRID_API_KEY not set' };
  }
  try {
    const res = await fetch('https://api.sendgrid.com/v3/user/profile', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.status === 401 || res.status === 403) {
      return { name: 'sendgrid', ok: false, detail: `HTTP ${res.status} unauthorized` };
    }
    if (!res.ok) {
      const text = await res.text();
      return {
        name: 'sendgrid',
        ok: false,
        detail: `HTTP ${res.status} ${text.slice(0, 120)}`,
      };
    }
    const body = (await res.json()) as { email?: string; first_name?: string };
    return {
      name: 'sendgrid',
      ok: true,
      detail: `profile ok${body.email ? ` (${body.email})` : ''}`,
    };
  } catch (e) {
    return {
      name: 'sendgrid',
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

async function main() {
  // Load optional email secrets without printing them
  const { config } = await import('dotenv');
  const path = await import('node:path');
  config({ path: path.resolve(__dirname, '../../secrets/optional-email.env') });

  const checks: Check[] = [];
  checks.push(await checkMongo());
  checks.push(await checkCloudinary());
  checks.push(await checkResend());
  checks.push(await checkSendgrid());

  console.log(
    JSON.stringify(
      {
        clientSlug: env.CLIENT_SLUG,
        otpDevBypass: env.OTP_DEV_BYPASS,
        msg91Configured: Boolean(env.MSG91_AUTH_KEY?.trim()),
        checks,
        allCriticalOk: checks
          .filter((c) => c.name === 'mongodb' || c.name === 'cloudinary')
          .every((c) => c.ok),
      },
      null,
      2,
    ),
  );

  await disconnectMongo().catch(() => undefined);
  const criticalFail = checks.some(
    (c) => (c.name === 'mongodb' || c.name === 'cloudinary') && !c.ok,
  );
  process.exit(criticalFail ? 1 : 0);
}

main().catch(async (err) => {
  console.error('[check:live] failed', err instanceof Error ? err.message : err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
