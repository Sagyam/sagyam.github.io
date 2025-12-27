import { z } from 'zod';
import { NavigationItemSchema } from './schema';
import navigationData from './data.json';

const NavigationArraySchema = z.array(NavigationItemSchema);

export const navigation = NavigationArraySchema.parse(navigationData);
export type { NavigationItem } from './schema';
