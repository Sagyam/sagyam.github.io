import { z } from 'zod';
import { CertificationSchema } from './schema';
import certificationsData from './data.json';

const CertificationsArraySchema = z.array(CertificationSchema);

export const certifications = CertificationsArraySchema.parse(certificationsData);
export type { Certification } from './schema';
