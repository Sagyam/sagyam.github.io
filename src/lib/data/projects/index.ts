import { z } from 'zod';
import projectsData from './data.json';
import { ProjectSchema } from './schema';

const ProjectsArraySchema = z.array(ProjectSchema);

export const projects = ProjectsArraySchema.parse(projectsData);
export type { Project } from './schema';
