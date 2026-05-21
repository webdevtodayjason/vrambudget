import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import { geist, jetbrainsMono } from '@/lib/fonts';
import './globals.css';

const GA_ID = 'G-J1GJMR259T';

export const metadata: Metadata = {
  metadataBase: new URL('https://vrambudget.com'),
  title: { default: 'vrambudget', template: '%s · vrambudget' },
  description:
    'The math behind local LLM memory budgets. VRAM ≈ params × (bits ÷ 8).',
  openGraph: {
    type: 'website',
    siteName: 'vrambudget',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image' },
  // Icons auto-resolved from app/icon.svg and app/apple-icon.tsx (Next 15 file-based metadata).
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
