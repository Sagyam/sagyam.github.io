# Interactive Blog System - Usage Guide

Complete guide to using all features of the interactive blog system integrated into your portfolio.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Creating Blog Posts](#creating-blog-posts)
- [Rendering Strategies](#rendering-strategies)
- [Using Interactive Components](#using-interactive-components)
- [Code Syntax Highlighting](#code-syntax-highlighting)
- [Custom Components](#custom-components)
- [Metadata & Frontmatter](#metadata--frontmatter)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Route Structure

The portfolio uses **Next.js Route Groups** to separate blog and portfolio layouts:

```
src/app/
├── layout.tsx              # Root layout (minimal, provides HTML/fonts)
├── (portfolio)/            # Route group for portfolio (has sidebar)
│   ├── layout.tsx         # Portfolio layout with sidebar
│   ├── page.tsx           # Homepage
│   └── opengraph-image.tsx
└── (blog)/                # Route group for blog (no sidebar)
    └── blog/
        ├── layout.tsx     # Blog layout (centered, no sidebar)
        ├── page.tsx       # Blog listing
        └── [slug]/
            └── page.tsx   # Individual blog posts
```

**Important**: Route groups `(portfolio)` and `(blog)` don't affect URLs - they're only for organizing layouts.

### Content Location

Blog posts are written in MDX and stored in:

```
content/blog/
├── typescript-utility-types-guide.mdx        (SSG example)
├── web-performance-benchmarks.mdx            (ISR example)
└── react-server-components-deep-dive.mdx     (RSC example)
```

---

## Creating Blog Posts

### Basic Structure

Create a new `.mdx` file in `content/blog/`:

```mdx
---
title: "Your Blog Post Title"
slug: "your-blog-post-slug"
description: "A brief description for SEO and previews"
publishedAt: "2024-01-20"
coverImage: "/blog/your-slug/cover.png"
tech: ["React", "TypeScript", "Next.js"]
published: true
renderStrategy: "ssg"
---

# Your Blog Post Title

Your content here...
```

### Frontmatter Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Blog post title (max 99 chars) |
| `slug` | string | ✅ | URL slug (auto-derived from file path) |
| `description` | string | ❌ | SEO description (max 999 chars) |
| `publishedAt` | ISO date | ✅ | Publication date (YYYY-MM-DD) |
| `published` | boolean | ✅ | Show/hide post (default: true) |
| `tech` | string[] | ❌ | Technology tags displayed as badges |
| `coverImage` | string | ❌ | Path to cover image |
| `renderStrategy` | enum | ❌ | "ssg", "isr", or "rsc" (default: "ssg") |
| `revalidate` | number | ❌ | Seconds for ISR revalidation |

---

## Rendering Strategies

### 1. Static Site Generation (SSG)

**Use for**: Content that rarely changes (tutorials, guides, documentation)

```mdx
---
title: "TypeScript Patterns"
renderStrategy: "ssg"
---
```

**Benefits**:
- ✅ Fastest possible load times
- ✅ Fully pre-rendered at build time
- ✅ Perfect for SEO
- ✅ No server needed

**Example**: `typescript-utility-types-guide.mdx`

### 2. Incremental Static Regeneration (ISR)

**Use for**: Content that needs periodic updates (benchmarks, stats, news)

```mdx
---
title: "Web Performance Benchmarks"
renderStrategy: "isr"
revalidate: 3600  # Revalidate every hour
---
```

**Benefits**:
- ✅ Static performance with fresh data
- ✅ Automatic background revalidation
- ✅ No downtime during updates
- ✅ Stale-while-revalidate pattern

**Revalidation Times**:
- `3600` = 1 hour
- `86400` = 24 hours
- `604800` = 1 week

**Example**: `web-performance-benchmarks.mdx`

### 3. React Server Components (RSC)

**Use for**: Heavy computation, server-side data fetching, dynamic content

```mdx
---
title: "React Server Components Deep Dive"
renderStrategy: "rsc"
---
```

**Benefits**:
- ✅ Direct database/API access
- ✅ Server-side computation
- ✅ Smaller client bundles
- ✅ Automatic code splitting

**Example**: `react-server-components-deep-dive.mdx`

**Note**: Currently all blog posts share the same revalidation time (1 hour). For true per-post ISR, you would need separate route files or use the Pages Router.

---

## Using Interactive Components

### Available Components

#### 1. InteractiveDemo

A card-based container for interactive demos with counter example.

```mdx
<InteractiveDemo
  title="Try This Demo"
  description="Click to interact with the counter"
/>
```

**Props**:
- `title` (string): Demo title
- `description` (string): Demo description
- `children` (ReactNode): Custom content

#### 2. RateLimiterDemo

Rate limiting visualization with live request tracking.

```mdx
<RateLimiterDemo
  algorithm="token-bucket"
  limit={10}
/>
```

**Props**:
- `algorithm`: "token-bucket" | "leaky-bucket" | "fixed-window" | "sliding-window"
- `limit` (number): Requests per minute

#### 3. LastUpdated

Displays when content was last updated (useful for ISR posts).

```mdx
<LastUpdated timestamp={new Date().toISOString()} />
```

**Props**:
- `timestamp` (string): ISO date string

### Creating Custom Components

#### Step 1: Create Component

Create in `src/components/blog/interactive/`:

```tsx
// src/components/blog/interactive/shared/MyComponent.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MyComponentProps {
  title: string;
  data: number;
}

export function MyComponent({ title, data }: MyComponentProps) {
  return (
    <Card className="my-6 border-primary/20 bg-white/5">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Data: {data}</p>
      </CardContent>
    </Card>
  );
}
```

**Important**: Mark as `'use client'` if using hooks or browser APIs.

#### Step 2: Register Component

Add to `src/components/blog/mdx-components.tsx`:

```tsx
import { MyComponent } from './interactive/shared/MyComponent';

const components = {
  InteractiveDemo,
  RateLimiterDemo,
  LastUpdated,
  MyComponent,  // Add your component
  // ... rest
};
```

#### Step 3: Use in MDX

```mdx
<MyComponent title="Hello" data={42} />
```

### Lazy Loading Interactive Components

For heavy components, use dynamic imports:

```tsx
// src/components/blog/interactive/HeavyChart.tsx
'use client';

import dynamic from 'next/dynamic';

const ChartLibrary = dynamic(() => import('chart.js'), {
  ssr: false,
  loading: () => <div>Loading chart...</div>
});

export function HeavyChart() {
  return <ChartLibrary data={chartData} />;
}
```

**Benefits**:
- Only loads when component is visible
- Reduces initial bundle size
- Improves Time to Interactive (TTI)

---

## Code Syntax Highlighting

### Supported Languages

All languages supported by Shiki (180+):
- TypeScript, JavaScript, JSX, TSX
- Python, Rust, Go, Java, C++
- HTML, CSS, SCSS
- JSON, YAML, TOML
- Bash, PowerShell
- SQL, GraphQL
- And many more...

### Basic Code Blocks

````mdx
```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}
```
````

### Inline Code

Use single backticks for inline code:

```mdx
Use the `useState` hook for state management.
```

Renders as: Use the `useState` hook for state management.

### Code Features

The syntax highlighter (rehype-pretty-code with Shiki) provides:

- ✅ **Theme**: GitHub Dark
- ✅ **Line highlighting**: Highlight specific lines
- ✅ **Word highlighting**: Highlight specific words/tokens
- ✅ **Hover states**: Line hover effect
- ✅ **Server-side**: No JavaScript needed on client

### Styling Code Blocks

Styles are in `src/styles/blog.css`:

```css
/* Highlighted lines */
.line--highlighted {
  background: rgba(255, 255, 255, 0.1);
  border-left: 2px solid var(--primary);
}

/* Highlighted words */
.word--highlighted {
  background: rgba(var(--primary-rgb), 0.2);
  border-radius: 2px;
}
```

---

## Custom Components

### Built-in HTML Components

The MDX system customizes standard HTML elements:

#### Links

```mdx
[External Link](https://example.com)  <!-- Auto-detects external, opens in new tab -->
[Internal Link](/blog/other-post)     <!-- Internal navigation -->
```

#### Images

```mdx
![Alt text](/blog/image.png)
```

Auto-wrapped with Next.js `<Image>`:
- Optimized loading
- Responsive sizing
- Lazy loading
- Border styling

#### Tables

```mdx
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

Styled with:
- Header background
- Border styling
- Responsive overflow

#### Blockquotes

```mdx
> This is a blockquote
> with multiple lines
```

Styled with:
- Left border accent
- Italic text
- Muted color

#### Lists

```mdx
- Unordered list
- Item 2

1. Ordered list
2. Item 2
```

---

## Metadata & Frontmatter

### SEO Optimization

Each blog post automatically generates:

1. **Page Title**: `{post.title} - Sagyam Thapa`
2. **Meta Description**: From frontmatter `description`
3. **Open Graph Tags**: For social media sharing
4. **Twitter Card**: For Twitter/X sharing
5. **Canonical URL**: For SEO

### Reading Time

Automatically calculated at ~200 words/minute:

```tsx
function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
```

Displayed with clock icon in post header.

### Technology Badges

```mdx
---
tech: ["React", "TypeScript", "Next.js"]
---
```

Renders as styled badges using `shadcn/ui`:
- Primary color scheme
- Hover effects
- Consistent spacing

---

## Deployment

### Build Process

1. **Velite processes MDX**:
   ```bash
   # Compiles MDX to executable JavaScript
   # Generates .velite/posts.json with metadata
   # Validates frontmatter with Zod
   ```

2. **Next.js builds app**:
   ```bash
   pnpm build

   # Outputs:
   # - Static pages for SSG posts
   # - ISR-enabled pages with revalidation config
   # - RSC pages with server-side rendering
   ```

3. **Deploy**:
   ```bash
   # Vercel (recommended)
   vercel deploy

   # Or other platforms supporting Next.js 15
   ```

### Environment Setup

No special environment variables needed! The blog system works out of the box.

### Vercel Deployment

The ISR configuration works automatically on Vercel:
- Pages revalidate every 3600 seconds (1 hour)
- On-demand revalidation available via API
- Edge caching for optimal performance

### Build Output

```
Route (app)                    Size    First Load JS  Revalidate
├ ○ /blog                     173 B   108 kB
├ ● /blog/[slug]            3.59 kB   120 kB         1h
├   ├ /blog/typescript-utility-types-guide           1h
├   ├ /blog/web-performance-benchmarks               1h
├   └ /blog/react-server-components-deep-dive        1h
```

- `○` = Static (SSG)
- `●` = SSG with ISR
- `ƒ` = Server-rendered (RSC)

---

## Troubleshooting

### Build Errors

#### "Module not found: #site/content"

**Cause**: Velite hasn't generated content yet.

**Solution**:
```bash
# Run build once to generate .velite directory
pnpm build
```

#### "Cannot destructure property 'Fragment'"

**Cause**: MDX runtime issue.

**Solution**: Ensure `react/jsx-runtime` is imported in `mdx-components.tsx`:
```tsx
import * as runtime from 'react/jsx-runtime';
```

### Content Not Updating

#### SSG post not updating

**Cause**: Static pages don't update automatically.

**Solution**:
1. Make content changes
2. Rebuild: `pnpm build`
3. Redeploy

#### ISR post not updating

**Cause**: Waiting for revalidation period.

**Solution**:
1. Wait for revalidation period (default: 1 hour)
2. Or trigger rebuild manually
3. Or use on-demand revalidation:
   ```tsx
   import { revalidatePath } from 'next/cache';

   revalidatePath('/blog/your-post');
   ```

### Interactive Components Not Working

#### Component not rendering

**Checks**:
1. ✅ Component registered in `mdx-components.tsx`?
2. ✅ Component marked `'use client'`?
3. ✅ Props match component interface?
4. ✅ Component exported as named export?

#### Hydration errors

**Cause**: Server/client mismatch.

**Solution**: Use `'use client'` and avoid server-only APIs:
```tsx
'use client';

// ✅ Good
const [state, setState] = useState(0);

// ❌ Bad - don't use window/document without checking
if (typeof window !== 'undefined') {
  // Now safe to use window
}
```

### Syntax Highlighting Not Working

#### Code blocks not styled

**Check**:
1. ✅ `blog.css` imported in root layout?
2. ✅ rehype-pretty-code configured in `velite.config.ts`?
3. ✅ Using triple backticks with language?

**Example**:
````mdx
```typescript  <!-- ✅ Has language -->
const x = 1;
```

```  <!-- ❌ No language -->
const x = 1;
```
````

### Performance Issues

#### Large bundle sizes

**Solutions**:
1. Use dynamic imports for heavy components
2. Check bundle with:
   ```bash
   ANALYZE=true pnpm build
   ```
3. Remove unused dependencies

#### Slow build times

**Solutions**:
1. Limit number of posts during development
2. Use `pnpm dev` for fast refresh
3. Check Velite processing time in build logs

---

## Best Practices

### Content Organization

```
content/blog/
├── typescript-utility-types-guide.mdx
├── web-performance-benchmarks.mdx
├── react-server-components-deep-dive.mdx
└── images/
    └── blog-name/
        ├── cover.png
        └── diagram.png
```

### Component Design

1. **Keep components focused**: One responsibility per component
2. **Use TypeScript**: Define prop interfaces
3. **Style with Tailwind**: Match existing design system
4. **Test interactivity**: Verify client-side behavior
5. **Optimize bundles**: Lazy load heavy dependencies

### Writing MDX

1. **Use semantic HTML**: Proper heading hierarchy (h1 → h2 → h3)
2. **Add alt text**: For all images
3. **Include code examples**: Practical demonstrations
4. **Link to resources**: External references
5. **Test locally**: Preview before publishing

### SEO Optimization

1. **Write descriptive titles**: 50-60 characters
2. **Craft compelling descriptions**: 150-160 characters
3. **Use relevant tags**: In `tech` array
4. **Include keywords**: Naturally in content
5. **Add cover images**: For social sharing

---

## Quick Reference

### File Locations

- **Blog posts**: `content/blog/*.mdx`
- **Components**: `src/components/blog/`
- **Styles**: `src/styles/blog.css`
- **Config**: `velite.config.ts`
- **Types**: `.velite/index.d.ts` (generated)

### Commands

```bash
# Development
pnpm dev

# Build
pnpm build

# Production
pnpm start

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### Component Template

```tsx
'use client';

import { Card } from '@/components/ui/card';

interface MyComponentProps {
  title: string;
}

export function MyComponent({ title }: MyComponentProps) {
  return (
    <Card className="my-6">
      <h3>{title}</h3>
    </Card>
  );
}
```

### Blog Post Template

```mdx
---
title: "Your Title"
slug: "your-slug"
description: "Your description"
publishedAt: "2024-01-20"
tech: ["Tag1", "Tag2"]
published: true
renderStrategy: "ssg"
---

# Your Title

Introduction paragraph...

## Section 1

Content here...

<InteractiveDemo title="Demo" />

## Conclusion

Wrap up...
```

---

## Support

For issues or questions:
1. Check this guide first
2. Review the three example blog posts
3. Examine component source code
4. Check Next.js and Velite documentation

---

**Happy blogging!** 🎉
