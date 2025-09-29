import { ProjectCard } from '@/components/project-card';
import { projects, certifications, experiences } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowUpRight, Rss } from 'lucide-react';
import Link from 'next/link';
import { CertificationCard } from '@/components/certification-card';
import { ExperienceCard } from '@/components/experience-card';
import { getBlogPosts } from '@/lib/rss';

export default async function Home() {
  const blogPosts = await getBlogPosts(3);

  return (
    <div className="flex flex-col gap-24">
      <section id="about" className="scroll-mt-16 lg:scroll-mt-24">
        <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>
            As a backend developer, I specialize in building robust and scalable systems. My experience includes designing database schemas, architecting ERP applications, and deploying high-availability infrastructure. I have a passion for creating self-managed observability stacks with tools like Grafana, Prometheus, and Loki to ensure system health and performance.
          </p>
          <p>
            I am currently preparing for the Azure and AWS DevOps and Developer Associate exams, as well as the CKS and CKAD certifications to deepen my expertise in cloud-native technologies. I thrive on tackling complex challenges and am always eager to explore new technologies that drive efficiency and resilience.
          </p>
          <p>
            When I'm not coding, I enjoy collecting books, catching up on my favorite TV series, and hunting for the best coffee in town.
          </p>
        </div>
      </section>

      <section id="experience" className="scroll-mt-16 lg:scroll-mt-24">
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Experience</h2>
        <div className="mt-8 space-y-4">
          {experiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
        <div className="mt-8">
          <Link href="/sagyam-thapa.pdf" target='_blank' rel='noopener noreferrer' className="inline-flex items-center font-medium text-foreground hover:text-primary">
            View full resume <ArrowUpRight className="ml-1 size-4" />
          </Link>
        </div>
      </section>

      <section id="writing" className="scroll-mt-16 lg:scroll-mt-24">
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Writing</h2>
        <div className="mt-8 grid grid-cols-1 gap-4">
          {blogPosts.map((post) => {
            return (
              <ProjectCard
                key={post.id}
                project={{
                  id: post.id,
                  title: post.title,
                  description: post.summary,
                  link: post.link,
                  tech: post.tech || [],
                  imageId: post.imageId,
                  imageUrl: post.imageUrl
                }}
              />
            )
          })}
        </div>
         <div className="mt-8">
          <Link href="https://blog.sagyamthapa.com.np" target='_blank' rel='noopener noreferrer' className="inline-flex items-center font-medium text-foreground hover:text-primary">
            View all posts <Rss className="ml-2 size-4" />
          </Link>
        </div>
      </section>

      <section id="projects" className="scroll-mt-16 lg:scroll-mt-24">
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Projects</h2>
        <div className="mt-8 grid grid-cols-1 gap-4">
           {projects.map((project) => {
            const image = PlaceHolderImages.find(img => img.id === project.imageId);
            return (
              <ProjectCard
                key={project.id}
                project={project}
                image={image}
              />
            )
          })}
        </div>
      </section>

      <section id="certifications" className="scroll-mt-16 lg:scroll-mt-24">
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Certifications</h2>
        <div className="mt-8 space-y-4">
          {certifications.map((cert) => (
            <CertificationCard key={cert.id} certification={cert} />
          ))}
        </div>
      </section>

    </div>
  );
}
