import { v2 as cloudinary } from 'cloudinary';
import { env, isProd } from '../../config/env';
import { AppError, badRequest, forbidden } from '../../utils/errors';
import {
  MEDIA_ADMIN_MAX_BYTES,
  MEDIA_ADMIN_PURPOSES,
  MEDIA_ALLOWED_MIME_TYPES,
  MEDIA_CUSTOMER_MAX_BYTES,
  MEDIA_CUSTOMER_PURPOSES,
  purposeToFolderSuffix,
  type MediaPurpose,
} from './media.policy';

function readCloudinaryCreds() {
  // Prefer live process.env so verify scripts can inject without reloading Zod env
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || env.CLOUDINARY_API_SECRET || '').trim();
  return { cloudName, apiKey, apiSecret };
}

function assertCloudinaryConfigured() {
  const creds = readCloudinaryCreds();
  if (!creds.cloudName || !creds.apiKey || !creds.apiSecret) {
    throw new AppError(
      503,
      'MEDIA_NOT_CONFIGURED',
      'Cloudinary is not configured for this environment',
    );
  }
  cloudinary.config({
    cloud_name: creds.cloudName,
    api_key: creds.apiKey,
    api_secret: creds.apiSecret,
    secure: true,
  });
  return creds;
}

export function getMediaPolicyPublic() {
  return {
    allowedMimeTypes: [...MEDIA_ALLOWED_MIME_TYPES],
    adminMaxBytes: MEDIA_ADMIN_MAX_BYTES,
    customerMaxBytes: MEDIA_CUSTOMER_MAX_BYTES,
    folderPattern: 'clients/<slug>/(items|chat|branding)',
    adminPurposes: [...MEDIA_ADMIN_PURPOSES],
    customerPurposes: [...MEDIA_CUSTOMER_PURPOSES],
    unsignedPresetsAllowed: false,
  };
}

export function createUploadSignature(input: {
  purpose: string;
  resourceType?: string;
  uploadPreset?: string | null;
  unsigned?: boolean;
  actor: 'admin' | 'customer';
}) {
  if (input.unsigned || input.uploadPreset) {
    if (isProd || env.NODE_ENV === 'production') {
      throw forbidden(
        'UNSIGNED_PRESET_FORBIDDEN',
        'Unsigned Cloudinary upload presets are not allowed in production',
      );
    }
    throw forbidden(
      'UNSIGNED_PRESET_FORBIDDEN',
      'Only signed uploads are supported; do not pass uploadPreset/unsigned',
    );
  }

  const purpose = input.purpose as MediaPurpose;
  if (input.actor === 'admin') {
    if (!(MEDIA_ADMIN_PURPOSES as readonly string[]).includes(purpose)) {
      throw badRequest(
        'INVALID_PURPOSE',
        `Admin purpose must be one of: ${MEDIA_ADMIN_PURPOSES.join(', ')}`,
      );
    }
  } else if (!(MEDIA_CUSTOMER_PURPOSES as readonly string[]).includes(purpose)) {
    throw badRequest(
      'INVALID_PURPOSE',
      `Customer purpose must be one of: ${MEDIA_CUSTOMER_PURPOSES.join(', ')}`,
    );
  }

  const resourceType = input.resourceType ?? 'image';
  if (resourceType !== 'image') {
    throw badRequest('INVALID_RESOURCE_TYPE', 'Only resourceType=image is allowed');
  }

  const creds = assertCloudinaryConfigured();
  const folder = `clients/${env.CLIENT_SLUG}/${purposeToFolderSuffix(purpose)}`;
  const timestamp = Math.round(Date.now() / 1000);
  const maxBytes = input.actor === 'admin' ? MEDIA_ADMIN_MAX_BYTES : MEDIA_CUSTOMER_MAX_BYTES;

  // Params included in the signature must match what the client sends to Cloudinary
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, creds.apiSecret);

  return {
    cloudName: creds.cloudName,
    apiKey: creds.apiKey,
    timestamp,
    signature,
    folder,
    resourceType,
    // Client-side guidance (not part of Cloudinary signature)
    allowedMimeTypes: [...MEDIA_ALLOWED_MIME_TYPES],
    maxBytes,
    purpose,
    actor: input.actor,
    uploadUrl: `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`,
  };
}
