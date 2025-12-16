import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { Certification } from '@/lib/data';

interface CertificationCardProps {
  certification: Certification;
}

export function CertificationCard({ certification }: CertificationCardProps) {
  return (
    <div className="group relative grid md:grid-cols-8 gap-4 items-start rounded-lg p-4 transition-all duration-300 border border-transparent hover:bg-white/10 hover:shadow-lg hover:backdrop-blur-sm hover:border-white/20">
      <p className="md:col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground z-10">
        {certification.issueDate}
      </p>
      <div className="md:col-span-6 z-10">
        <h3 className="font-medium text-foreground group-hover:text-primary">
          <Link
            href={certification.verificationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
          >
            {certification.name}
            <ArrowUpRight className="ml-1 size-4 shrink-0 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{certification.issuer}</p>
      </div>
    </div>
  );
}
