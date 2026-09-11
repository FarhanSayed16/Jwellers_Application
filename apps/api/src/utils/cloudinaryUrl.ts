/**
 * Cloudinary delivery URL helpers — thumbs without re-upload.
 * Safe no-op for non-Cloudinary URLs.
 */
export function cloudinaryThumbUrl(
  url: string,
  opts?: { width?: number; height?: number; quality?: string },
): string {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }
  const w = opts?.width ?? 400;
  const h = opts?.height;
  const q = opts?.quality ?? 'auto';
  const transform = h
    ? `c_fill,w_${w},h_${h},q_${q},f_auto`
    : `c_limit,w_${w},q_${q},f_auto`;
  return url.replace('/upload/', `/upload/${transform}/`);
}
