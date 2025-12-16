import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { posts } from '#site/content';
import { ProjectCard } from '@/components/project-card';

export const metadata = {
  title: 'Blog - Sagyam Thapa',
  description: 'Technical blog posts about software engineering, system design, and more.',
};

export default async function BlogPage() {
  // Filter published posts and sort by date (newest first)
  const publishedPosts = posts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/#writing"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-foreground">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Technical writing on software engineering, system design, and interactive tutorials.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {publishedPosts.map((post) => (
          <ProjectCard
            key={post.slug}
            project={{
              id: post.slug,
              title: post.title,
              description: post.description || '',
              link: `/blog/${post.slugAsParams}`,
              tech: post.tech,
              imageUrl: post.coverImage,
            }}
          />
        ))}
      </div>

      {publishedPosts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No blog posts published yet.</p>
        </div>
      )}
    </div>
  );
}
