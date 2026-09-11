/**
 * Cloudinary upload policy — Phase 11 conventions.
 *
 * Folder shape: clients/<CLIENT_SLUG>/(items|chat|branding)
 * Clients upload directly to Cloudinary with signed params from POST /media/sign.
 * Never use unsigned public presets in production.
 */

export const MEDIA_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

/** Admin catalog / branding uploads */
export const MEDIA_ADMIN_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/** Customer chat / custom-request uploads (tighter) */
export const MEDIA_CUSTOMER_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export const MEDIA_ADMIN_PURPOSES = ['items', 'banners', 'branding'] as const;
export const MEDIA_CUSTOMER_PURPOSES = ['chat', 'custom_requests'] as const;

export type MediaAdminPurpose = (typeof MEDIA_ADMIN_PURPOSES)[number];
export type MediaCustomerPurpose = (typeof MEDIA_CUSTOMER_PURPOSES)[number];
export type MediaPurpose = MediaAdminPurpose | MediaCustomerPurpose;

/** Map API purpose → Cloudinary folder suffix under clients/<slug>/ */
export function purposeToFolderSuffix(purpose: MediaPurpose): 'items' | 'chat' | 'branding' {
  switch (purpose) {
    case 'items':
      return 'items';
    case 'banners':
    case 'branding':
      return 'branding';
    case 'chat':
    case 'custom_requests':
      return 'chat';
    default:
      return 'items';
  }
}
