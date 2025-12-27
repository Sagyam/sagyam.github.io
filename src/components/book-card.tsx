import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Book } from '@/lib/data';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link
      href={`/books/${book.slug}`}
      className="group relative flex gap-4 items-start rounded-lg p-4 transition-all duration-300 border border-transparent hover:bg-white/10 hover:shadow-lg hover:backdrop-blur-sm hover:border-white/20"
    >
      <div className="flex-shrink-0 w-24 sm:w-28 z-10">
        {book.coverImage && (
          <div className="aspect-[2/3] relative overflow-hidden rounded border border-border shadow-md">
            <Image
              src={book.coverImage}
              alt={book.title}
              fill
              sizes="112px"
              className="object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 z-10">
        <h3 className="font-medium text-foreground group-hover:text-primary flex items-center">
          <span className="truncate">{book.title}</span>
          <ArrowUpRight className="ml-1 size-4 shrink-0 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
        {book.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{book.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {book.categories.map((category) => (
            <Badge key={category} variant="default">
              {category}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
