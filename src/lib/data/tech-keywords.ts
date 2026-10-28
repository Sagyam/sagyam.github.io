// Centralized list of technology keywords to highlight in text
// Organized by category for easy maintenance

export const TECH_KEYWORDS = {
  cloud: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'K8s', 'EKS', 'Databricks'],
  infrastructure: ['Docker', 'Helm', 'Terraform', 'Ansible', 'Nginx', 'Redis', 'MinIO'],
  observability: [
    'Grafana',
    'Prometheus',
    'Loki',
    'OpenTelemetry',
    'Jaeger',
    'Linkerd',
    'Argo CD',
    'ArgoCD',
    'Flagger',
  ],
  frontend: [
    'React',
    'Next.js',
    'TypeScript',
    'JavaScript',
    'Tailwind CSS',
    'Tailwind',
    'shadcn',
    'shadcn/ui',
    'ECharts',
    'Apache ECharts',
    'Recharts',
    'React Query',
    'Zustand',
  ],
  backend: ['Node.js', 'NestJS', 'Express', 'FastAPI', 'Keycloak', 'Prisma', 'Drizzle'],
  databases: ['PostgreSQL', 'Postgres', 'MongoDB', 'MySQL', 'Redis', 'Turso', 'CloudNativePG'],
  os: ['NixOS', 'NixOps', 'Flakes', 'Linux'],
  devops: [
    'GitHub Actions',
    'CI/CD',
    'IaC',
    'GitOps',
    'DevSecOps',
    'GitGuardian',
    'Trivy',
    'Falco',
    'Vercel',
  ],
  ai: ['PyTorch', 'NeMo', 'Parakeet', 'Whisper', 'ASR', 'RAG'],
  concepts: ['ERP', 'service mesh', 'observability', 'high-availability'],
  companies: ['Tech Axis', 'TechAxis', 'Bitmosys', 'Ascend Cloud Services', 'Cango', 'Matrice AI'],
} as const;

// Flatten all keywords into a single array
export const ALL_TECH_KEYWORDS = Object.values(TECH_KEYWORDS).flat();
