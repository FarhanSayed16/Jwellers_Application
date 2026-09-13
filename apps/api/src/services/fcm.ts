import fs from 'node:fs';
import path from 'node:path';
import admin from 'firebase-admin';
import { env } from '../config/env';

export type FcmPushType = 'rates_updated' | 'chat_message' | 'new_arrival' | 'price_alert';

export type FcmSendInput = {
  type: FcmPushType;
  tokens: string[];
  /** Opaque ids only — never put phone/name/message body here */
  data?: Record<string, string>;
  title: string;
  body: string;
};

export type FcmSendResult = {
  configured: boolean;
  attempted: number;
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
  dryRun: boolean;
};

type MessagingLike = {
  sendEachForMulticast: (message: admin.messaging.MulticastMessage) => Promise<{
    successCount: number;
    failureCount: number;
    responses: Array<{ success: boolean; error?: { code?: string; message?: string } }>;
  }>;
};

let appInitialized = false;
let messagingOverride: MessagingLike | null = null;
const dryRunLog: FcmSendInput[] = [];

export function __setFcmMessagingForTests(mock: MessagingLike | null) {
  messagingOverride = mock;
}

export function __drainFcmDryRunLog(): FcmSendInput[] {
  return dryRunLog.splice(0, dryRunLog.length);
}

function resolveServiceAccountPath(): string | null {
  const raw = env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (!raw) return null;
  if (path.isAbsolute(raw)) return raw;
  // Prefer apps/api root (where secrets/ lives)
  const fromPackage = path.resolve(__dirname, '../../', raw);
  if (fs.existsSync(fromPackage)) return fromPackage;
  return path.resolve(process.cwd(), raw);
}

export function isFcmConfigured(): boolean {
  if (messagingOverride) return true;
  if (env.FCM_DRY_RUN) return true;
  const saPath = resolveServiceAccountPath();
  return Boolean(env.FCM_PROJECT_ID?.trim() && saPath && fs.existsSync(saPath));
}

function ensureFirebaseApp(): admin.app.App | null {
  if (messagingOverride || env.FCM_DRY_RUN) return null;
  if (appInitialized && admin.apps.length > 0) {
    return admin.app();
  }

  const saPath = resolveServiceAccountPath();
  const projectId = env.FCM_PROJECT_ID?.trim();
  if (!saPath || !projectId || !fs.existsSync(saPath)) {
    return null;
  }

  const json = JSON.parse(fs.readFileSync(saPath, 'utf8')) as admin.ServiceAccount;
  admin.initializeApp({
    credential: admin.credential.cert(json),
    projectId,
  });
  appInitialized = true;
  return admin.app();
}

/**
 * Fan-out FCM data+notification. Best-effort; never throws to callers.
 * Invalid / unregistered tokens are returned for deactivation.
 */
export async function sendFcmToTokens(input: FcmSendInput): Promise<FcmSendResult> {
  const tokens = [...new Set(input.tokens.map((t) => t.trim()).filter(Boolean))];
  if (tokens.length === 0) {
    return {
      configured: isFcmConfigured(),
      attempted: 0,
      successCount: 0,
      failureCount: 0,
      invalidTokens: [],
      dryRun: Boolean(env.FCM_DRY_RUN),
    };
  }

  const data: Record<string, string> = {
    type: input.type,
    ...(input.data ?? {}),
  };

  if (env.FCM_DRY_RUN && !messagingOverride) {
    dryRunLog.push({ ...input, tokens, data });
    return {
      configured: true,
      attempted: tokens.length,
      successCount: tokens.length,
      failureCount: 0,
      invalidTokens: [],
      dryRun: true,
    };
  }

  const app = ensureFirebaseApp();
  const messaging = messagingOverride ?? (app ? admin.messaging(app) : null);
  if (!messaging) {
    return {
      configured: false,
      attempted: tokens.length,
      successCount: 0,
      failureCount: tokens.length,
      invalidTokens: [],
      dryRun: false,
    };
  }

  const invalidTokens: string[] = [];
  let successCount = 0;
  let failureCount = 0;

  // FCM multicast limit is 500
  const chunkSize = 500;
  for (let i = 0; i < tokens.length; i += chunkSize) {
    const chunk = tokens.slice(i, i + chunkSize);
    try {
      const res = await messaging.sendEachForMulticast({
        tokens: chunk,
        notification: {
          title: input.title,
          body: input.body,
        },
        data,
        android: {
          priority: 'high',
          notification: { channelId: 'jwellers_default' },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              contentAvailable: true,
            },
          },
        },
      });
      successCount += res.successCount;
      failureCount += res.failureCount;
      res.responses.forEach((r, idx) => {
        if (r.success) return;
        const code = r.error?.code ?? '';
        if (
          code.includes('registration-token-not-registered') ||
          code.includes('invalid-registration-token') ||
          code.includes('invalid-argument')
        ) {
          invalidTokens.push(chunk[idx]!);
        }
      });
    } catch (err) {
      console.warn('[fcm] send failed', err instanceof Error ? err.message : err);
      failureCount += chunk.length;
    }
  }

  return {
    configured: true,
    attempted: tokens.length,
    successCount,
    failureCount,
    invalidTokens,
    dryRun: false,
  };
}
