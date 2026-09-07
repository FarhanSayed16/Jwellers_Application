import { api, ApiClientError } from './api';
import type { MediaSign } from './catalogTypes';

export type UploadedImage = {
  url: string;
  publicId: string | null;
};

/**
 * Signed Cloudinary upload for admin (purpose: items | branding | banners).
 * Falls back to error if Cloudinary not configured — use add-by-URL in UI.
 */
export async function uploadAdminImage(
  file: File,
  purpose: 'items' | 'branding' | 'banners' = 'items',
): Promise<UploadedImage> {
  const sign = await api.post<MediaSign>('/media/sign', {
    purpose,
    resourceType: 'image',
  });

  if (file.size > sign.maxBytes) {
    throw new Error(`File too large (max ${Math.round(sign.maxBytes / (1024 * 1024))} MB)`);
  }
  if (sign.allowedMimeTypes.length && !sign.allowedMimeTypes.includes(file.type)) {
    throw new Error(`Unsupported type ${file.type || 'unknown'}`);
  }

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('signature', sign.signature);
  form.append('folder', sign.folder);

  const res = await fetch(sign.uploadUrl, { method: 'POST', body: form });
  const json = (await res.json()) as {
    secure_url?: string;
    url?: string;
    public_id?: string;
    error?: { message?: string };
  };
  if (!res.ok || !(json.secure_url || json.url)) {
    throw new Error(json.error?.message || 'Cloudinary upload failed');
  }
  return {
    url: (json.secure_url || json.url) as string,
    publicId: json.public_id ?? null,
  };
}

export function isMediaConfiguredError(err: unknown): boolean {
  return err instanceof ApiClientError && err.code === 'MEDIA_NOT_CONFIGURED';
}
