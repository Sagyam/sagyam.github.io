import { z } from 'zod';
import socialLinksData from './data.json';
import { SocialLinkSchema } from './schema';

const SocialLinksArraySchema = z.array(SocialLinkSchema);

export const socialLinks = SocialLinksArraySchema.parse(socialLinksData);
export type { SocialLink } from './schema';
