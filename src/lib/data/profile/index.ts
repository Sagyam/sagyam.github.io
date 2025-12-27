import { ProfileSchema } from './schema';
import profileData from './data.json';

export const profile = ProfileSchema.parse(profileData);
export type { Profile } from './schema';
