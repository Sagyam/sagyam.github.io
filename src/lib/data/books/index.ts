import { z } from 'zod';
import booksData from './data.json';
import { BookSchema } from './schema';

const BooksArraySchema = z.array(BookSchema);

export const books = BooksArraySchema.parse(booksData);
export type { Book } from './schema';
