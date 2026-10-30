# Portfolio

A modern portfolio website built with Next.js 16, React 18, and TypeScript.

## Features

- Built with Next.js 16 and Turbopack for fast development
- UI components powered by Radix UI and Tailwind CSS
- Form handling with React Hook Form and Zod validation
- Analytics with Vercel Analytics and Speed Insights
- Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.2 or higher

### Installation

```bash
# Install dependencies
bun install
```

### Development

```bash
# Start the dev server with Turbopack
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
# Create production build
bun run build

# Start production server
bun start
```

### Code Quality

```bash
# Lint, and apply safe fixes (configured in bunfig.toml)
bun lint
bun lint --fix

# Format
bun fmt

# Check formatting and linting without writing changes
bun run check

# Type checking
bun run typecheck
```

## Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI
- **Forms:** React Hook Form + Zod
- **Analytics:** Vercel Analytics & Speed Insights

## Design system

This site is the source of the design language every project linked from it shares: colours, type,
radii and the chart palette, light and dark. It lives in [`registry/`](registry) and is published
as a [shadcn registry](https://ui.shadcn.com/docs/registry) at `/r/` on every build.

| Item           | Installs                         | For                                         |
| -------------- | -------------------------------- | ------------------------------------------- |
| `theme`        | `src/styles/sagyam.css`          | Any Tailwind 4 project                      |
| `theme-switch` | `components/theme-switch.tsx`    | Next.js sites with next-themes              |

```bash
bunx shadcn@latest add https://sagyamthapa.com.np/r/theme.json --overwrite
bunx shadcn@latest add https://sagyamthapa.com.np/r/theme-switch.json
```

Import the theme right after Tailwind and put a project's own tokens after it. To change the shared
design, edit `registry/theme/sagyam.css` here, deploy, then re-run the command above in each project.
