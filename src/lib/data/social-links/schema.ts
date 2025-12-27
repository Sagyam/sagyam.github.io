import { z } from 'zod';

export const SocialLinkSchema = z.object({
  id: z.string().min(1, 'Social link ID is required'),
  label: z.string().min(1, 'Social link label is required'),
  url: z
    .string()
    .min(1, 'URL is required')
    .refine(
      (val) =>
        val.startsWith('/') ||
        val.startsWith('http://') ||
        val.startsWith('https://') ||
        val.startsWith('mailto:'),
      'URL must be a valid URL or path starting with /'
    ),
  icon: z.string().min(1, 'Icon is required'),
});

export type SocialLink = z.infer<typeof SocialLinkSchema>;
