import { z } from 'zod';
import experiencesData from './data.json';
import { ExperienceSchema } from './schema';

const ExperiencesArraySchema = z.array(ExperienceSchema);

export const experiences = ExperiencesArraySchema.parse(experiencesData);
export type { Experience } from './schema';
