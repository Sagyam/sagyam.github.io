import { z } from 'zod';
import { ProjectSchema } from './schema';
import projectsData from './data.json';

const ProjectsArraySchema = z.array(ProjectSchema);

export const projects = ProjectsArraySchema.parse(projectsData);
export type { Project } from './schema';
