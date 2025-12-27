import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  title: z.string().min(1, 'Project title is required'),
  description: z.string().min(1, 'Project description is required'),
  tech: z.array(z.string().min(1)).min(1, 'At least one tech is required'),
  imageId: z.string(),
  link: z.string().url('Project link must be a valid URL').optional(),
  imageUrl: z.string().url('Image URL must be a valid URL').optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
