// Centralized list of technology keywords to highlight in text
// Organized by category for easy maintenance

export const TECH_KEYWORDS = {
  cloud: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'K8s', 'Databricks'],
  infrastructure: [
    'Docker',
    'Helm',
    'Terraform',
    'Nginx',
    'Redis',
    'PostgreSQL',
    'Postgres',
  ],
  observability: [
    'Grafana',
    'Prometheus',
    'Loki',
    'OpenTelemetry',
    'Jaeger',
    'Linkerd',
  ],
  frontend: [
    'React',
    'Next.js',
    'TypeScript',
    'JavaScript',
    'Tailwind',
    'shadcn',
    'shadcn/ui',
    'ECharts',
    'Apache ECharts',
    'React Query',
    'Zustand',
  ],
  backend: ['Node.js', 'NestJS', 'Express', 'Keycloak', 'Prisma', 'Drizzle'],
  databases: ['MongoDB', 'MySQL', 'PostgreSQL', 'Postgres', 'Redis'],
  os: ['NixOS', 'NixOps', 'Flakes', 'Linux'],
  devops: ['GitHub Actions', 'CI/CD', 'IaC'],
  concepts: ['ERP', 'service mesh', 'observability', 'high-availability'],
  companies: ['Bitmosys', 'Ascend Cloud Services', 'Cango', 'Matrice AI'],
} as const;

// Flatten all keywords into a single array
export const ALL_TECH_KEYWORDS = Object.values(TECH_KEYWORDS).flat();
