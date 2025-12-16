'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import * as runtime from 'react/jsx-runtime';
import { RateLimiterDemo } from './interactive/rate-limiting/RateLimiterDemo';
import { InteractiveDemo } from './interactive/shared/InteractiveDemo';
import { LastUpdated } from './interactive/shared/LastUpdated';

// Custom components that can be used in MDX
const components = {
  // Interactive components
  InteractiveDemo,
  RateLimiterDemo,
  LastUpdated,
  // HTML elements
  Image: (props: any) => (
    <Image {...props} className="rounded-lg border border-border" loading="lazy" />
  ),
  a: ({ href, children, ...props }: any) => {
    const isExternal = href?.startsWith('http');
    return (
      <Link
        href={href || '#'}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : ''}
        className="text-primary hover:underline"
        {...props}
      >
        {children}
      </Link>
    );
  },
  code: ({ children, className, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="rounded bg-white/10 px-1.5 py-0.5 text-sm font-mono text-primary"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: any) => (
    <pre className="overflow-x-auto rounded-lg border border-border bg-black/50 p-4" {...props}>
      {children}
    </pre>
  ),
  h1: ({ children, ...props }: any) => (
    <h1 className="mt-8 mb-4 text-3xl font-bold text-foreground scroll-mt-20" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="mt-8 mb-4 text-2xl font-bold text-foreground scroll-mt-20" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="mt-6 mb-3 text-xl font-semibold text-foreground scroll-mt-20" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 className="mt-4 mb-2 text-lg font-semibold text-foreground scroll-mt-20" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }: any) => (
    <p className="my-4 text-muted-foreground leading-7" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="my-4 ml-6 list-disc text-muted-foreground" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="my-4 ml-6 list-decimal text-muted-foreground" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="my-2" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="my-4 border-l-4 border-primary pl-4 italic text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: any) => (
    <div className="my-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: any) => (
    <th className="px-4 py-2 text-left font-semibold text-foreground bg-white/5" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-4 py-2 text-muted-foreground" {...props}>
      {children}
    </td>
  ),
  hr: (props: any) => <hr className="my-8 border-border" {...props} />,
};

interface MDXContentProps {
  code: string;
}

export function MDXContent({ code }: MDXContentProps) {
  // Evaluate the compiled MDX code from Velite
  const Content = React.useMemo(() => {
    try {
      // Velite compiles MDX to code that uses the magic 'arguments' variable
      // We create a function without named parameters so arguments[0] will work
      const fn = new Function(code);
      // Call it with runtime as the first argument
      const mdxModule = fn.call(undefined, runtime);
      return mdxModule.default;
    } catch (error) {
      console.error('Error evaluating MDX:', error);
      return () => null;
    }
  }, [code]);

  return <Content components={components} />;
}
