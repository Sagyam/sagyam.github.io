import { z } from 'zod';
import dataJson from './data.json';

// Zod Schemas with validation rules
const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  about: z
    .array(z.string().min(1))
    .min(1, 'At least one about paragraph is required'),
});

const MetadataSchema = z.object({
  siteTitle: z.string().min(1, 'Site title is required'),
  siteDescription: z.string().min(1, 'Site description is required'),
  siteUrl: z.string().url('Must be a valid URL'),
  siteName: z.string().min(1, 'Site name is required'),
  locale: z
    .string()
    .regex(/^[a-z]{2}-[A-Z]{2}$/, 'Locale must be in format: en-US'),
  twitterHandle: z.string().regex(/^@\w+$/, 'Twitter handle must start with @'),
});

const NavigationItemSchema = z.object({
  id: z.string().min(1, 'Navigation ID is required'),
  label: z.string().min(1, 'Navigation label is required'),
});

const SocialLinkSchema = z.object({
  id: z.string().min(1, 'Social link ID is required'),
  label: z.string().min(1, 'Social link label is required'),
  url: z
    .string()
    .min(1, 'URL is required')
    .refine(
      (val) =>
        val.startsWith('/') ||
        val.startsWith('http://') ||
        val.startsWith('https://') ||
        val.startsWith('mailto:'),
      'URL must be a valid URL or path starting with /'
    ),
  icon: z.string().min(1, 'Icon is required'),
});

const SectionConfigSchema = z.object({
  title: z.string().min(1, 'Section title is required'),
  resumeLink: z.string().optional(),
  resumeText: z.string().optional(),
  blogLink: z.string().url('Blog link must be a valid URL').optional(),
  blogText: z.string().optional(),
});

const ProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  title: z.string().min(1, 'Project title is required'),
  description: z.string().min(1, 'Project description is required'),
  tech: z.array(z.string().min(1)).min(1, 'At least one tech is required'),
  imageId: z.string(),
  link: z.string().url('Project link must be a valid URL').optional(),
  imageUrl: z.string().url('Image URL must be a valid URL').optional(),
});

const ExperienceSchema = z.object({
  id: z.string().min(1, 'Experience ID is required'),
  date: z.string().min(1, 'Date is required'),
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  companyLink: z.string().url('Company link must be a valid URL'),
  description: z.string().min(1, 'Description is required'),
  tech: z.array(z.string().min(1)).min(1, 'At least one tech is required'),
});

const CertificationSchema = z.object({
  id: z.string().min(1, 'Certification ID is required'),
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  issueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be in YYYY-MM-DD format'),
  verificationLink: z.string().url('Verification link must be a valid URL'),
  icon: z.enum([
    'aws',
    'azure',
    'cncf',
    'coursera',
    'databricks',
    'gcp',
    'hashicorp',
    'ibm',
    'linkedin',
    'oracle',
    'pmi',
    'redhat',
    'salesforce',
    'vmware',
    'other',
  ]),
});

const BlogPostSchema = z.object({
  id: z.string().min(1, 'Blog post ID is required'),
  title: z.string().min(1, 'Blog post title is required'),
  summary: z.string().min(1, 'Summary is required'),
  link: z.string().url('Blog post link must be a valid URL'),
  publication: z.string().min(1, 'Publication is required'),
  imageId: z.string().min(1, 'Image ID is required'),
  imageUrl: z.string().url('Image URL must be a valid URL').optional(),
  tech: z.array(z.string().min(1)).optional(),
});

const DataSchema = z.object({
  profile: ProfileSchema,
  metadata: MetadataSchema,
  navigation: z.array(NavigationItemSchema),
  socialLinks: z.array(SocialLinkSchema),
  sections: z.record(SectionConfigSchema),
  experiences: z.array(ExperienceSchema),
  projects: z.array(ProjectSchema),
  certifications: z.array(CertificationSchema),
  blogPosts: z.array(BlogPostSchema),
});

// Validate and parse data
const data = DataSchema.parse(dataJson);

// Export TypeScript types inferred from Zod schemas
export type Profile = z.infer<typeof ProfileSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type NavigationItem = z.infer<typeof NavigationItemSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;
export type SectionConfig = z.infer<typeof SectionConfigSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type BlogPost = z.infer<typeof BlogPostSchema>;

// Export validated data
export const profile = data.profile;
export const metadata = data.metadata;
export const navigation = data.navigation;
export const socialLinks = data.socialLinks;
export const sections = data.sections;
export const experiences = data.experiences;
export const projects = data.projects;
export const certifications = data.certifications;
export const blogPosts = data.blogPosts;
