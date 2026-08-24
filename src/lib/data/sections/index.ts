import { z } from 'zod';
import sectionsData from './data.json';
import { SectionConfigSchema } from './schema';

const SectionsSchema = z.record(SectionConfigSchema);

export const sections = SectionsSchema.parse(sectionsData);
export type { SectionConfig } from './schema';
