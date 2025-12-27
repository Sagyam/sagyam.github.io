import { z } from 'zod';
import { ExperienceSchema } from './schema';
import experiencesData from './data.json';

const ExperiencesArraySchema = z.array(ExperienceSchema);

export const experiences = ExperiencesArraySchema.parse(experiencesData);
export type { Experience } from './schema';
