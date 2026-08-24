import profileData from './data.json';
import { ProfileSchema } from './schema';

export const profile = ProfileSchema.parse(profileData);
export type { Profile } from './schema';
