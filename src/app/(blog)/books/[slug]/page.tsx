import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { books } from '@/lib/data';

interface BookPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all books
export async function generateStaticParams() {
  return books.map((book) => ({
    slug: book.slug,
  }));
}

// Generate metadata for each book
export async function generateMetadata({ params }: BookPageProps) {
  const { slug } = await params;
  const book = books.find((book) => book.slug === slug);

  if (!book) {
    return {};
  }

  return {
    title: `${book.title} - Sagyam Thapa`,
    description: book.description || `${book.title} by ${book.author}`,
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;
  const book = books.find((book) => book.slug === slug);

  if (!book) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/books"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to books
        </Link>
      </div>

      <article className="flex flex-col gap-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Book Cover */}
          {book.coverImage && (
            <div className="md:col-span-1">
              <div className="aspect-[2/3] relative overflow-hidden rounded-lg border border-border shadow-lg">
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Book Details */}
          <div className={book.coverImage ? 'md:col-span-2' : 'md:col-span-3'}>
            <header>
              <h1 className="text-4xl font-bold text-foreground">{book.title}</h1>
              <p className="mt-2 text-xl text-muted-foreground">by {book.author}</p>

              {book.readDate && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>
                    Read on{' '}
                    {new Date(book.readDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              {book.categories.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {book.categories.map((category) => (
                    <Badge key={category} variant="default">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}

              {book.description && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-foreground mb-2">About this book</h2>
                  <p className="text-muted-foreground leading-relaxed">{book.description}</p>
                </div>
              )}

              {/* External Links */}
              <div className="mt-6 flex flex-wrap gap-3">
                {book.amazonLink && (
                  <Link
                    href={book.amazonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="size-4" />
                    View on Amazon
                  </Link>
                )}
                {book.goodreadsLink && (
                  <Link
                    href={book.goodreadsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ExternalLink className="size-4" />
                    View on Goodreads
                  </Link>
                )}
              </div>
            </header>
          </div>
        </div>

        {/* Related Books */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">More Books</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {books
              .filter((b) => b.id !== book.id)
              .slice(0, 4)
              .map((relatedBook) => (
                <Link
                  key={relatedBook.id}
                  href={`/books/${relatedBook.slug}`}
                  className="group flex flex-col rounded-lg border border-border overflow-hidden transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:border-white/20"
                >
                  {relatedBook.coverImage && (
                    <div className="aspect-[2/3] relative overflow-hidden bg-secondary">
                      <Image
                        src={relatedBook.coverImage}
                        alt={relatedBook.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary line-clamp-2">
                      {relatedBook.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {relatedBook.author}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </article>
    </div>
  );
}
