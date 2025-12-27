import { z } from 'zod';
import { SectionConfigSchema } from './schema';
import sectionsData from './data.json';

const SectionsSchema = z.record(SectionConfigSchema);

export const sections = SectionsSchema.parse(sectionsData);
export type { SectionConfig } from './schema';
