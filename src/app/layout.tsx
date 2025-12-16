import type { Metadata } from 'next';
import './globals.css';
import '@/styles/blog.css';
import { Space_Grotesk, Work_Sans } from 'next/font/google';
import { metadata as siteMetadata } from '@/lib/data';

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

export const metadata: Metadata = {
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
      className={`dark ${workSans.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased bg-background text-foreground">{children}</body>
    </html>
  );
}
