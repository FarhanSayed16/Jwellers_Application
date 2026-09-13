import type { Metadata } from 'next';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import { initAdminSentry } from '@/lib/sentry';
import { CookieConsentBanner } from '@/components/legal/CookieConsentBanner';
import { ToastHost } from '@/components/Toast';
import './globals.css';

initAdminSentry();

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
});

const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Retailer Admin | Jwellers',
  description: 'White-label jewellery retailer admin',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${fraunces.variable} ${sourceSans.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <div id="main-content">{children}</div>
          <ToastHost />
          <CookieConsentBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
