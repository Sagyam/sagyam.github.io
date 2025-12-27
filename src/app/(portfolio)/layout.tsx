import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { FileText, GithubIcon, Linkedin, Mail, Rss } from 'lucide-react';
import type React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { navigation, profile, socialLinks } from '@/lib/data';

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: GithubIcon,
  linkedin: Linkedin,
  mail: Mail,
  'file-text': FileText,
  x: XIcon,
  rss: Rss,
};

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <div className="mx-auto min-h-screen max-w-screen-xl px-6 py-12 md:px-12 md:py-20 lg:px-24 lg:py-0">
        <div className="lg:flex lg:justify-between lg:gap-16">
          <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-5/12 lg:flex-col lg:justify-between lg:py-24">
            <div>
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {profile.name}
              </h1>
              <h2 className="mt-3 font-headline text-lg font-medium tracking-tight text-foreground sm:text-xl">
                {profile.title}
              </h2>
              <p className="mt-4 max-w-xs leading-normal text-muted-foreground">
                {profile.tagline}
              </p>

              <nav className="mt-16 hidden lg:block" aria-label="In-page navigation">
                <ul className="w-max space-y-4">
                  {navigation.map((item) => (
                    <li key={item.id}>
                      <a className="group flex items-center gap-x-3" href={`#${item.id}`}>
                        <span className="h-px w-8 bg-muted-foreground transition-all duration-300 group-hover:w-16 group-hover:bg-foreground" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                          {item.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="mt-8 flex items-center gap-x-4 text-muted-foreground">
              {socialLinks.map((link) => {
                const Icon = iconMap[link.icon];
                return (
                  <Tooltip key={link.id}>
                    <TooltipTrigger asChild>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={link.label}
                        className="transition-colors hover:text-foreground"
                      >
                        <Icon className="size-6" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>{link.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </header>
          <main className="pt-16 lg:w-7/12 lg:py-24">{children}</main>
        </div>
      </div>
      <Analytics />
      <SpeedInsights />
    </TooltipProvider>
  );
}
