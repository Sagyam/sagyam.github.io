'use client';

import { ArrowLeft, BookOpen, Search } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { books } from '@/lib/data';
import { BookCard } from '@/components/book-card';

const BOOKS_PER_PAGE = 6;

export default function BooksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'author'>('recent');
  const [currentPage, setCurrentPage] = useState(1);

  // Get all unique categories
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    books.forEach((book) => {
      book.categories.forEach((category) => categorySet.add(category));
    });
    return Array.from(categorySet).sort();
  }, []);

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((book) => book.categories.includes(selectedCategory));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        const dateA = a.readDate ? new Date(a.readDate).getTime() : 0;
        const dateB = b.readDate ? new Date(b.readDate).getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'author') {
        return a.author.localeCompare(b.author);
      }
      return 0;
    });

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBooks.length / BOOKS_PER_PAGE);
  const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
  const endIndex = startIndex + BOOKS_PER_PAGE;
  const paginatedBooks = filteredAndSortedBooks.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/#books"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-foreground">Reading List</h1>
        <p className="mt-2 text-muted-foreground">
          Books I've read and recommend for software engineers and tech enthusiasts.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Category Filter and Sort */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-2 block">Filter by Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedCategory === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                All
              </button>
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="text-xs text-muted-foreground mb-2 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'title' | 'author')}
              className="px-3 py-1 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="recent">Recently Read</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedBooks.length}{' '}
        {filteredAndSortedBooks.length === 1 ? 'book' : 'books'}
      </div>

      {/* Books List */}
      {paginatedBooks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {paginatedBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="size-12 mx-auto mb-4 opacity-50" />
          <p>No books found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {getPageNumbers().map((pageNum, idx) => (
              <PaginationItem key={`${pageNum}-${idx}`}>
                {pageNum === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(pageNum);
                    }}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
