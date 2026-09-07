import type { Metadata } from 'next';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

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
      <body className={`${fraunces.variable} ${sourceSans.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
