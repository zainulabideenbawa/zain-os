import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, JetBrains_Mono, Amiri } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Zain OS',
  description: 'Single-user accountability engine for Zain',
  applicationName: 'Zain OS',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Zain OS',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0F0F0F',
};

import { Providers } from '@/app/providers';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jetbrainsMono.variable} ${amiri.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased selection:bg-[var(--gold-glow)] selection:text-[var(--gold)]">
        <Providers>
          <ServiceWorkerRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}
