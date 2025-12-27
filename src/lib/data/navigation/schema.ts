import { z } from 'zod';

export const NavigationItemSchema = z.object({
  id: z.string().min(1, 'Navigation ID is required'),
  label: z.string().min(1, 'Navigation label is required'),
});

export type NavigationItem = z.infer<typeof NavigationItemSchema>;
