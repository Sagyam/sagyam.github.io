import { z } from 'zod';
import navigationData from './data.json';
import { NavigationItemSchema } from './schema';

const NavigationArraySchema = z.array(NavigationItemSchema);

export const navigation = NavigationArraySchema.parse(navigationData);
export type { NavigationItem } from './schema';
