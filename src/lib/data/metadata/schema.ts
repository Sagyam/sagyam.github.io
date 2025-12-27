import { z } from 'zod';

export const MetadataSchema = z.object({
  siteTitle: z.string().min(1, 'Site title is required'),
  siteDescription: z.string().min(1, 'Site description is required'),
  siteUrl: z.string().url('Must be a valid URL'),
  siteName: z.string().min(1, 'Site name is required'),
  locale: z.string().regex(/^[a-z]{2}-[A-Z]{2}$/, 'Locale must be in format: en-US'),
  twitterHandle: z.string().regex(/^@\w+$/, 'Twitter handle must start with @'),
});

export type Metadata = z.infer<typeof MetadataSchema>;
