import { MetadataSchema } from './schema';
import metadataData from './data.json';

export const metadata = MetadataSchema.parse(metadataData);
export type { Metadata } from './schema';
