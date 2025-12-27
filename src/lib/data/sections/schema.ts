import { z } from 'zod';

export const SectionConfigSchema = z.object({
  title: z.string().min(1, 'Section title is required'),
  resumeLink: z.string().optional(),
  resumeText: z.string().optional(),
  blogLink: z.string().url('Blog link must be a valid URL').optional(),
  blogText: z.string().optional(),
  booksLink: z.string().optional(),
  booksText: z.string().optional(),
});

export type SectionConfig = z.infer<typeof SectionConfigSchema>;
