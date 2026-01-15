import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Experience } from '@/lib/data';
import { highlightTechKeywords } from '@/lib/text-highlight';

interface ExperienceCardProps {
  experience: Experience;
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <div className="group relative grid rounded-lg p-4 transition-all duration-300 border border-transparent hover:bg-white/10 hover:shadow-lg hover:backdrop-blur-sm hover:border-white/20 md:grid-cols-8 md:gap-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground md:col-span-2 z-10">
        {experience.date}
      </p>
      <div className="md:col-span-6 z-10">
        <h3 className="font-medium text-foreground group-hover:text-primary">
          <Link
            href={experience.companyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
          >
            {experience.title} · {experience.company}
            <ArrowUpRight className="ml-1 size-4 shrink-0 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
          </Link>
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {highlightTechKeywords(experience.description)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {experience.tech.map((tech) => (
            <Badge key={tech} variant="default">
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
