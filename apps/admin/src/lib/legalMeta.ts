import type { Metadata } from 'next';

export function adminOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_ADMIN_ORIGIN?.replace(/\/$/, '');
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

/** Shared SEO for public /legal/* pages (title, description, OG, canonical). */
export function legalPageMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const origin = adminOrigin();
  const url = `${origin}${input.path.startsWith('/') ? input.path : `/${input.path}`}`;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      type: 'website',
      siteName: 'Jewellery shop legal',
    },
    twitter: {
      card: 'summary',
      title: input.title,
      description: input.description,
    },
  };
}
