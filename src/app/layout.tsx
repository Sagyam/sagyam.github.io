import {SpeedInsights} from "@vercel/speed-insights/next";
import type { Metadata } from 'next';
import './globals.css';
import { Github, Linkedin, Mail, Rss, FileText } from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import { Work_Sans, Space_Grotesk } from 'next/font/google';

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
  title: 'Sagyam Thapa | Cloud & DevOps Engineer',
  description:
    'A personal portfolio showcasing DevOps and Cloud Engineering projects and skills.',
    icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
    },
    openGraph: {
    title: 'Sagyam Thapa | Cloud & DevOps Engineer',
    description:
      'A personal portfolio showcasing DevOps and Cloud Engineering projects and skills.',
    url: 'https://sagyamthapa.com.np',
    siteName: 'Sagyam Thapa',
    images: [
      {
        url: 'https://sagyamthapa.com.np/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sagyam Thapa',
      },
    ],
    locale: 'en-US',
    type: 'website',
  },
    twitter: {
    card: 'summary_large_image',
    title: 'Sagyam Thapa | Cloud & DevOps Engineer',
    description:
      'A personal portfolio showcasing DevOps and Cloud Engineering projects and skills.',
    images: ['https://sagyamthapa.com.np/og-image.png'],
    creator: '@sagyam21',
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
    }
};

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${workSans.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased bg-background text-foreground">
        <TooltipProvider>
          <div className="mx-auto min-h-screen max-w-screen-xl px-6 py-12 md:px-12 md:py-20 lg:px-24 lg:py-0">
            <div className="lg:flex lg:justify-between lg:gap-16">
              <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-5/12 lg:flex-col lg:justify-between lg:py-24">
                <div>
                  <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Sagyam Thapa
                  </h1>
                  <h2 className="mt-3 font-headline text-lg font-medium tracking-tight text-foreground sm:text-xl">
                    Cloud & DevOps Engineer
                  </h2>
                  <p className="mt-4 max-w-xs leading-normal text-muted-foreground">
                    I build and automate robust, scalable cloud infrastructure.
                  </p>

                  <nav
                    className="mt-16 hidden lg:block"
                    aria-label="In-page navigation"
                  >
                    <ul className="w-max space-y-4">
                      <li>
                        <a
                          className="group flex items-center gap-x-3"
                          href="#about"
                        >
                          <span className="h-px w-8 bg-muted-foreground transition-all duration-300 group-hover:w-16 group-hover:bg-foreground"></span>
                          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                            About
                          </span>
                        </a>
                      </li>
                      <li>
                        <a
                          className="group flex items-center gap-x-3"
                          href="#experience"
                        >
                          <span className="h-px w-8 bg-muted-foreground transition-all duration-300 group-hover:w-16 group-hover:bg-foreground"></span>
                          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                            Experience
                          </span>
                        </a>
                      </li>
                      <li>
                        <a
                          className="group flex items-center gap-x-3"
                          href="#writing"
                        >
                          <span className="h-px w-8 bg-muted-foreground transition-all duration-300 group-hover:w-16 group-hover:bg-foreground"></span>
                          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                            Writing
                          </span>
                        </a>
                      </li>
                      <li>
                        <a
                          className="group flex items-center gap-x-3"
                          href="#projects"
                        >
                          <span className="h-px w-8 bg-muted-foreground transition-all duration-300 group-hover:w-16 group-hover:bg-foreground"></span>
                          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                            Projects
                          </span>
                        </a>
                      </li>
                      <li>
                        <a
                          className="group flex items-center gap-x-3"
                          href="#certifications"
                        >
                          <span className="h-px w-8 bg-muted-foreground transition-all duration-300 group-hover:w-16 group-hover:bg-foreground"></span>
                          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                            Certifications
                          </span>
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
                <div className="mt-8 flex items-center gap-x-4 text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="https://github.com/Sagyam"
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label="GitHub"
                        className="transition-colors hover:text-foreground"
                      >
                        <Github className="size-6" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>GitHub</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="https://www.linkedin.com/in/sagyam"
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label="LinkedIn"
                        className="transition-colors hover:text-foreground"
                      >
                        <Linkedin className="size-6" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>LinkedIn</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="mailto:sagymathpa32@gmail.com"
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label="Email"
                        className="transition-colors hover:text-foreground"
                      >
                        <Mail className="size-6" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Email</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="/sagyam-thapa.pdf"
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label="Resume"
                        className="transition-colors hover:text-foreground"
                      >
                        <FileText className="size-6" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Resume</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="https://twitter.com/sagyam21"
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label="X"
                        className="transition-colors hover:text-foreground"
                      >
                        <XIcon className="size-6" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>X</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="https://blog.sagyamthapa.com.np"
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label="Blog"
                        className="transition-colors hover:text-foreground"
                      >
                        <Rss className="size-6" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Blog</TooltipContent>
                  </Tooltip>
                </div>
              </header>
              <main className="pt-16 lg:w-7/12 lg:py-24">{children}</main>
            </div>
          </div>
        </TooltipProvider>
        <Analytics />
        <SpeedInsights/>
      </body>
    </html>
  );
}
