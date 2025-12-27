import { z } from 'zod';

export const ExperienceSchema = z.object({
  id: z.string().min(1, 'Experience ID is required'),
  date: z.string().min(1, 'Date is required'),
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  companyLink: z.string().url('Company link must be a valid URL'),
  description: z.string().min(1, 'Description is required'),
  tech: z.array(z.string().min(1)).min(1, 'At least one tech is required'),
});

export type Experience = z.infer<typeof ExperienceSchema>;
