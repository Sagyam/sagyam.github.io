import { z } from 'zod';
import { SocialLinkSchema } from './schema';
import socialLinksData from './data.json';

const SocialLinksArraySchema = z.array(SocialLinkSchema);

export const socialLinks = SocialLinksArraySchema.parse(socialLinksData);
export type { SocialLink } from './schema';
