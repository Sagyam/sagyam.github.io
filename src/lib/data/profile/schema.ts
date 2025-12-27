import { z } from 'zod';

export const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  about: z.array(z.string().min(1)).min(1, 'At least one about paragraph is required'),
});

export type Profile = z.infer<typeof ProfileSchema>;
