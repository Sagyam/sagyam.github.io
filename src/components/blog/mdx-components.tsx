'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import * as runtime from 'react/jsx-runtime';
import { Callout, Info, Note, Tip, Warning } from './callout';
import { Code, CodeFigcaption, CodeFigure, CodePre } from './code-block';
import { RateLimiterDemo } from './interactive/rate-limiting/RateLimiterDemo';
import { InteractiveDemo } from './interactive/shared/InteractiveDemo';
import { LastUpdated } from './interactive/shared/LastUpdated';
import { ToolEmbed } from './interactive/ToolEmbed';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getNodeText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (React.isValidElement(node) && node.props && (node.props as any).children) {
    return getNodeText((node.props as any).children);
  }
  return '';
}

// Custom components that can be used in MDX
const components = {
  // Callout components
  Callout,
  Tip,
  Note,
  Warning,
  Info,
  // Interactive components
  InteractiveDemo,
  RateLimiterDemo,
  LastUpdated,
  ToolEmbed,
  // HTML elements
  div: ({ children, className, 'data-node-type': nodeType, ...props }: any) => {
    if (nodeType === 'callout') {
      return (
        <aside
          role="note"
          className="my-6 flex items-start gap-3.5 rounded-xl border border-l-4 border-amber-500/30 border-l-amber-500 bg-amber-500/[0.08] p-4 md:p-5 text-amber-100/90 shadow-[0_0_20px_-5px_rgba(245,158,11,0.08)] backdrop-blur-xs text-sm leading-relaxed"
          {...props}
        >
          {children}
        </aside>
      );
    }
    if (nodeType === 'callout-emoji') {
      return (
        <span
          className="text-xl shrink-0 leading-none select-none mt-0.5"
          role="img"
          aria-hidden="true"
          {...props}
        >
          {children}
        </span>
      );
    }
    if (nodeType === 'callout-text') {
      return (
        <div
          className="flex-1 min-w-0 [&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>ul]:my-1.5 [&>ol]:my-1.5 [&>code]:bg-black/30"
          {...props}
        >
          {children}
        </div>
      );
    }
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  },
  img: ({ src, alt, ...props }: any) => (
    <img
      src={src}
      alt={alt || ''}
      className="my-6 rounded-lg border border-border mx-auto max-h-[500px] object-contain"
      loading="lazy"
      {...props}
    />
  ),
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
  code: Code,
  pre: CodePre,
  figure: CodeFigure,
  figcaption: CodeFigcaption,
  h1: ({ children, id, ...props }: any) => {
    const headingText = getNodeText(children);
    const headingId = id || slugify(headingText);
    return (
      <h1
        id={headingId}
        className="mt-8 mb-4 text-3xl font-bold text-foreground scroll-mt-24"
        {...props}
      >
        {children}
      </h1>
    );
  },
  h2: ({ children, id, ...props }: any) => {
    const headingText = getNodeText(children);
    const headingId = id || slugify(headingText);
    return (
      <h2
        id={headingId}
        className="mt-8 mb-4 text-2xl font-bold text-foreground scroll-mt-24"
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, id, ...props }: any) => {
    const headingText = getNodeText(children);
    const headingId = id || slugify(headingText);
    return (
      <h3
        id={headingId}
        className="mt-6 mb-3 text-xl font-semibold text-foreground scroll-mt-24"
        {...props}
      >
        {children}
      </h3>
    );
  },
  h4: ({ children, id, ...props }: any) => {
    const headingText = getNodeText(children);
    const headingId = id || slugify(headingText);
    return (
      <h4
        id={headingId}
        className="mt-4 mb-2 text-lg font-semibold text-foreground scroll-mt-24"
        {...props}
      >
        {children}
      </h4>
    );
  },
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
  iframe: (props: any) => <iframe suppressHydrationWarning {...props} />,
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
