import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/data';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  image?: ImagePlaceholder;
}

export function ProjectCard({ project, image }: ProjectCardProps) {
  const displayImage = project.imageUrl || image?.imageUrl;

  return (
    <Link href={project.link || '#'} target={project.link ? "_blank" : "_self"} rel={project.link ? "noopener noreferrer" : ""} className="group relative grid md:grid-cols-8 gap-4 items-start rounded-lg p-4 transition-all duration-300 border border-transparent hover:bg-white/10 hover:shadow-lg hover:backdrop-blur-sm hover:border-white/20">
        <div className="md:col-span-3 mt-1 z-10">
        {displayImage && (
          <div className="aspect-video relative overflow-hidden rounded border border-border">
            <Image
              src={displayImage}
              alt={project.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        </div>
        <div className='md:col-span-5 z-10'>
            <h3 className="font-medium text-foreground group-hover:text-primary flex items-center">
                {project.title}
                {project.link && <ArrowUpRight className="ml-1 size-4 shrink-0 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"/>}
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
