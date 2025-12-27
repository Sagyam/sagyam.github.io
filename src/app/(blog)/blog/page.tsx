import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { posts } from '#site/content';
import { ProjectCard } from '@/components/project-card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export const metadata = {
  title: 'Blog - Sagyam Thapa',
  description: 'Technical blog posts about software engineering, system design, and more.',
};

const POSTS_PER_PAGE = 6;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Number(pageParam) || 1;

  // Filter published posts and sort by date (newest first)
  const publishedPosts = posts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const totalPages = Math.ceil(publishedPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = publishedPosts.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 2) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // Show current page and surrounding pages
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

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
        {paginatedPosts.map((post) => (
          <ProjectCard
            key={post.slug}
            project={{
              id: post.slug,
              title: post.title,
              description: post.description || '',
              link: `/blog/${post.slugAsParams}`,
              tech: post.tech,
              imageId: post.slug,
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

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={currentPage > 1 ? `/blog?page=${currentPage - 1}` : '#'}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {getPageNumbers().map((pageNum, idx) => (
              <PaginationItem key={`${pageNum}-${idx}`}>
                {pageNum === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink href={`/blog?page=${pageNum}`} isActive={currentPage === pageNum}>
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href={currentPage < totalPages ? `/blog?page=${currentPage + 1}` : '#'}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
