import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { posts } from '#site/content';
import { MDXContent } from '@/components/blog/mdx-components';
import { Badge } from '@/components/ui/badge';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slugAsParams,
  }));
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = posts.find((post) => post.slugAsParams === slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} - Sagyam Thapa`,
    description: post.description,
  };
}

function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = posts.find((post) => post.slugAsParams === slug);

  if (!post || !post.published) {
    notFound();
  }

  const readingTime = getReadingTime(post.body);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to blog
        </Link>
      </div>

      <article className="flex flex-col gap-8">
        <header>
          <h1 className="text-4xl font-bold text-foreground">{post.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span>{readingTime} min read</span>
            </div>
          </div>

          {post.tech.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tech.map((tech) => (
                <Badge key={tech} variant="default">
                  {tech}
                </Badge>
              ))}
            </div>
          )}

          {post.description && (
            <p className="mt-4 text-lg text-muted-foreground">{post.description}</p>
          )}
        </header>

        <div className="prose prose-invert max-w-none">
          <MDXContent code={post.body} />
        </div>
      </article>
    </div>
  );
}

// ISR Configuration: Revalidate every day
// This enables Incremental Static Regeneration for posts marked with renderStrategy: "isr"
// SSG posts will still be fully static, but ISR posts will regenerate periodically
export const revalidate = 86400;

// Note: All posts share this revalidate time. For true per-post revalidation,
// you would need separate route files or use the pages directory with getStaticProps
