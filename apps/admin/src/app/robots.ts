import type { MetadataRoute } from 'next';

/**
 * Public legal pages may be indexed for Play policy URLs.
 * Private retailer admin routes must not be crawled.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/legal/', '/legal'],
        disallow: ['/', '/login', '/forgot-password', '/reset-password', '/api/'],
      },
    ],
  };
}
