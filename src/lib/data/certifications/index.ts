import { z } from 'zod';
import certificationsData from './data.json';
import { CertificationSchema } from './schema';

const CertificationsArraySchema = z.array(CertificationSchema);

export const certifications = CertificationsArraySchema.parse(certificationsData);
export type { Certification } from './schema';
