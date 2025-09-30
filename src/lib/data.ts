import data from './data.json';
export type Project = {
  id: string;
  title: string;
  description: string;
  tech: string[];
  imageId: string;
  link?: string;
  imageUrl?: string;
};

export type Experience = {
  id: string;
  date: string;
  title: string;
  company: string;
  companyLink: string;
  description: string;
  tech: string[];
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  verificationLink: string;
  icon: 'aws' | 'azure' | 'cncf' | 'coursera' | 'databricks' | 'gcp' | 'hashicorp' | 'ibm' | 'linkedin' | 'oracle' | 'pmi' | 'redhat' | 'salesforce' | 'vmware' | 'other';
};

export type BlogPost = {
  id: string;
  title: string;
  summary: string;
  link: string;
  publication: string;
  imageId: string;
  imageUrl?: string;
  tech?: string[];
};

export const experiences: Experience[] = data.experiences;
export const projects: Project[] = data.projects;
export const certifications: Certification[] = data.certifications;
export const blogPosts: BlogPost[] = data.blogPosts;
