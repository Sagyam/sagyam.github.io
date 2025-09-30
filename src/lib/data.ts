import data from './data.json';

export type Profile = {
  name: string;
  title: string;
  tagline: string;
  about: string[];
};

export type Metadata = {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  siteName: string;
  locale: string;
  twitterHandle: string;
};

export type NavigationItem = {
  id: string;
  label: string;
};

export type SocialLink = {
  id: string;
  label: string;
  url: string;
  icon: string;
};

export type SectionConfig = {
  title: string;
  resumeLink?: string;
  resumeText?: string;
  blogLink?: string;
  blogText?: string;
};

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

export const profile: Profile = data.profile;
export const metadata: Metadata = data.metadata;
export const navigation: NavigationItem[] = data.navigation;
export const socialLinks: SocialLink[] = data.socialLinks;
export const sections: Record<string, SectionConfig> = data.sections;
export const experiences: Experience[] = data.experiences;
export const projects: Project[] = data.projects;
export const certifications: Certification[] = data.certifications;
export const blogPosts: BlogPost[] = data.blogPosts;
