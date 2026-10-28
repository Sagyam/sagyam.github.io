import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/lib/data';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  image?: ImagePlaceholder;
}

export function ProjectCard({ project, image }: ProjectCardProps) {
  const displayImage = project.imageUrl || image?.imageUrl;
  const hasMedia = Boolean(project.logoUrl || displayImage);
  const isExternal = project.link?.startsWith('http');

  return (
    <Link
      href={project.link || '#'}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group relative grid md:grid-cols-8 gap-4 items-start rounded-lg p-4 transition-all duration-300 border border-transparent hover:bg-edge/5 hover:shadow-lg hover:backdrop-blur-xs hover:border-edge/10"
    >
      <div className={cn('md:col-span-3 mt-1 z-10', !hasMedia && 'hidden')}>
        {displayImage ? (
          <div className="aspect-video relative overflow-hidden rounded border border-border">
            <Image
              src={displayImage}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : project.logoUrl ? (
          <div className="relative mx-auto aspect-square w-full max-w-[200px]">
            <Image
              src={project.logoUrl}
              alt={`${project.title} logo`}
              fill
              sizes="(max-width: 768px) 50vw, 200px"
              className="object-contain transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>
      <div className={cn('z-10', hasMedia ? 'md:col-span-5' : 'md:col-span-8')}>
        <h3 className="font-medium text-foreground group-hover:text-primary flex items-center">
          {project.title}
          {project.link && (
            <ArrowUpRight className="ml-1 size-4 shrink-0 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
          )}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <Badge key={tech} variant="default">
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
