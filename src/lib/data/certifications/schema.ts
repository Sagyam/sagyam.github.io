import { z } from 'zod';

export const CertificationSchema = z.object({
  id: z.string().min(1, 'Certification ID is required'),
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be in YYYY-MM-DD format'),
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

export type Certification = z.infer<typeof CertificationSchema>;
