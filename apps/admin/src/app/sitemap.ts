import type { MetadataRoute } from 'next';

function adminOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_ADMIN_ORIGIN?.replace(/\/$/, '');
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = adminOrigin();
  const paths = [
    '/legal/privacy',
    '/legal/terms',
    '/legal/delete-account',
    '/legal/support',
    '/legal/cookies',
    '/legal/cookie-preferences',
    '/legal/faq',
  ];

  return paths.map((path) => ({
    url: `${origin}${path}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
}
