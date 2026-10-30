import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
import { ThemeProvider } from 'next-themes';
import { JetBrains_Mono, Space_Grotesk, Work_Sans } from 'next/font/google';
import Script from 'next/script';

import { metadata as siteMetadata } from '@/lib/data';

// The bare domain redirects to www, so Umami has to accept both.
const siteHost = new URL(siteMetadata.siteUrl).hostname.replace(/^www\./, '');

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-work-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: siteMetadata.siteTitle,
  description: siteMetadata.siteDescription,
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: siteMetadata.siteTitle,
    description: siteMetadata.siteDescription,
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.siteName,
    locale: siteMetadata.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteMetadata.siteTitle,
    description: siteMetadata.siteDescription,
    creator: siteMetadata.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        {/* No switch on this site: it follows the OS. A fresh storage key drops any choice made with
            the switch it briefly had. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="portfolio-theme"
        >
          {children}
        </ThemeProvider>
        {/* Umami Cloud, through the /u proxy in next.config.ts. Only counts the live domain, so
            localhost and Vercel previews stay out of the stats. */}
        <Script
          src="/u/script.js"
          data-host-url="/u"
          data-website-id="799ae957-587f-41bd-a520-4a18f6b94763"
          data-domains={`${siteHost},www.${siteHost}`}
        />
      </body>
    </html>
  );
}
