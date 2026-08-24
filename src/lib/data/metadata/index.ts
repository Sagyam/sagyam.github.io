import metadataData from './data.json';
import { MetadataSchema } from './schema';

export const metadata = MetadataSchema.parse(metadataData);
export type { Metadata } from './schema';
