import { ArrowUpRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface BooksPreviewCardProps {
  bookCount: number;
}

export function BooksPreviewCard({ bookCount }: BooksPreviewCardProps) {
  return (
    <Link
      href="/books"
      className="group relative flex flex-col items-center justify-center rounded-lg p-8 transition-all duration-300 border border-border hover:bg-white/10 hover:shadow-lg hover:backdrop-blur-sm hover:border-white/20"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
          <BookOpen className="size-8 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-foreground group-hover:text-primary flex items-center justify-center gap-1">
            Reading List
            <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {bookCount} {bookCount === 1 ? 'book' : 'books'} I've read and recommend
          </p>
        </div>
        <span className="text-xs text-primary font-medium">View all books</span>
      </div>
    </Link>
  );
}
