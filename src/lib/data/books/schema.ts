import { z } from 'zod';

export const BookSchema = z.object({
  id: z.string().min(1, 'Book ID is required'),
  slug: z.string().min(1, 'Book slug is required'),
  title: z.string().min(1, 'Book title is required'),
  author: z.string().min(1, 'Author is required'),
  coverImage: z.string().url('Cover image must be a valid URL').optional(),
  categories: z.array(z.string().min(1)).min(1, 'At least one category is required'),
  description: z.string().optional(),
  readDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Read date must be in YYYY-MM-DD format').optional(),
  amazonLink: z.string().url('Amazon link must be a valid URL').optional(),
  goodreadsLink: z.string().url('Goodreads link must be a valid URL').optional(),
});

export type Book = z.infer<typeof BookSchema>;
