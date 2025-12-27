import { z } from 'zod';
import { BookSchema } from './schema';
import booksData from './data.json';

const BooksArraySchema = z.array(BookSchema);

export const books = BooksArraySchema.parse(booksData);
export type { Book } from './schema';
