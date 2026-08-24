'use client';

import { Check, Code2, Copy, Database, FileCode, Terminal } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

// Language name display formatting
const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TypeScript (React)',
  jsx: 'JavaScript (React)',
  py: 'Python',
  python: 'Python',
  sh: 'Bash',
  bash: 'Bash',
  shell: 'Shell',
  zsh: 'Zsh',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  sql: 'SQL',
  pgsql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  dockerfile: 'Dockerfile',
  docker: 'Docker',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  rust: 'Rust',
  rs: 'Rust',
  go: 'Go',
  golang: 'Go',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  cs: 'C#',
  md: 'Markdown',
  mdx: 'MDX',
  graphql: 'GraphQL',
  gql: 'GraphQL',
  toml: 'TOML',
  env: 'Env',
  diff: 'Diff',
};

function formatLanguageName(lang?: string): string {
  if (!lang) return '';
  const clean = lang.toLowerCase().trim();
  return LANGUAGE_DISPLAY_NAMES[clean] || clean.toUpperCase();
}

function getLanguageIcon(lang?: string) {
  if (!lang) return Code2;
  const clean = lang.toLowerCase().trim();
  if (['bash', 'sh', 'shell', 'zsh'].includes(clean)) {
    return Terminal;
  }
  if (['sql', 'pgsql', 'postgres'].includes(clean)) {
    return Database;
  }
  return Code2;
}

// Context to track if a <pre> is nested inside our CodeFigure wrapper
const CodeBlockContext = React.createContext<{ isInsideWrapper: boolean }>({
  isInsideWrapper: false,
});

interface CopyButtonProps {
  onCopy: () => void;
  copied: boolean;
  className?: string;
}

export function CopyButton({ onCopy, copied, className }: CopyButtonProps) {
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? 'Copied code to clipboard' : 'Copy code to clipboard'}
      className={cn(
        'group/copy relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200',
        'border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary active:scale-95',
        copied
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_-3px_rgba(16,185,129,0.25)]'
          : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/10 hover:text-foreground',
        className
      )}
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-emerald-400 transition-transform duration-200 scale-110" />
          <span className="text-emerald-400 font-medium">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="size-3.5 transition-transform duration-200 group-hover/copy:scale-105" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

interface CodeFigureProps extends React.ComponentPropsWithoutRef<'figure'> {
  'data-rehype-pretty-code-figure'?: string;
  [key: string]: unknown;
}

export function CodeFigure({ children, className, ...props }: CodeFigureProps) {
  const isPrettyCode = props['data-rehype-pretty-code-figure'] !== undefined;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  if (!isPrettyCode) {
    return (
      <figure className={cn('my-6', className)} {...props}>
        {children}
      </figure>
    );
  }

  // Extract metadata (title, language) from children
  let title: string | null = null;
  let language: string | null = null;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const childProps = child.props as Record<string, unknown>;
      if (
        child.type === 'figcaption' ||
        childProps?.['data-rehype-pretty-code-title'] !== undefined
      ) {
        title = typeof childProps.children === 'string' ? childProps.children : null;
      }
      if (child.type === 'pre' || childProps?.['data-language']) {
        language = (childProps['data-language'] as string) || null;
      }
    }
  });

  const handleCopy = async () => {
    if (!containerRef.current) return;
    const preElement = containerRef.current.querySelector('pre');
    if (!preElement) return;

    const codeToCopy = preElement.textContent || '';

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(codeToCopy);
      } else {
        // Fallback for older browsers or insecure contexts
        const textarea = document.createElement('textarea');
        textarea.value = codeToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code block:', err);
    }
  };

  const LangIcon = getLanguageIcon(language || undefined);
  const formattedLang = formatLanguageName(language || undefined);

  return (
    <CodeBlockContext.Provider value={{ isInsideWrapper: true }}>
      <div
        ref={containerRef}
        className={cn(
          'group/code relative my-6 overflow-hidden rounded-xl border border-border/80 bg-[#090d16] shadow-xl shadow-black/30 transition-all duration-200 hover:border-slate-700/80',
          className
        )}
        data-code-block=""
      >
        {/* Code Block Header */}
        <div className="flex h-10 items-center justify-between border-b border-border/60 bg-[#0e1626]/90 backdrop-blur-sm px-4 select-none">
          {/* Left Side: Window dots + Title or Language */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* macOS-style decorative dots */}
            <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-rose-500/60" />
              <span className="size-2.5 rounded-full bg-amber-500/60" />
              <span className="size-2.5 rounded-full bg-emerald-500/60" />
            </div>

            {title ? (
              <div className="flex items-center gap-1.5 truncate font-mono text-xs text-foreground/90 font-medium tracking-tight">
                <FileCode className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{title}</span>
              </div>
            ) : formattedLang ? (
              <div className="flex items-center gap-1.5">
                <LangIcon className="size-3.5 text-sky-400/90" />
                <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-sky-400/90">
                  {formattedLang}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Code2 className="size-3.5 text-muted-foreground/70" />
                <span className="font-mono text-[11px] font-medium tracking-wider uppercase text-muted-foreground/70">
                  Code
                </span>
              </div>
            )}
          </div>

          {/* Right Side: Optional secondary language badge (when title exists) + Copy Button */}
          <div className="flex items-center gap-2 shrink-0">
            {title && formattedLang && (
              <span className="hidden sm:inline-block font-mono text-[10px] font-semibold tracking-wider uppercase text-sky-400/80 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                {formattedLang}
              </span>
            )}
            <CopyButton onCopy={handleCopy} copied={copied} />
          </div>
        </div>

        {/* Code Content Container (Children contains <pre>) */}
        <div className="relative">{children}</div>
      </div>
    </CodeBlockContext.Provider>
  );
}

interface PreProps extends React.ComponentPropsWithoutRef<'pre'> {
  'data-language'?: string;
  'data-theme'?: string;
  [key: string]: unknown;
}

export function CodePre({ children, className, ...props }: PreProps) {
  const { isInsideWrapper } = React.useContext(CodeBlockContext);
  const preRef = React.useRef<HTMLPreElement>(null);
  const [copied, setCopied] = React.useState(false);

  // If already wrapped by CodeFigure, render clean <pre>
  if (isInsideWrapper) {
    return (
      <pre
        ref={preRef}
        className={cn(
          'overflow-x-auto p-4 font-mono text-sm leading-relaxed text-slate-100 subpixel-antialiased selection:bg-sky-500/30 selection:text-white',
          className
        )}
        {...props}
      >
        {children}
      </pre>
    );
  }

  // Standalone <pre> fallback: wrap with container and copy button
  const language = (props['data-language'] as string) || '';
  const formattedLang = formatLanguageName(language);
  const LangIcon = getLanguageIcon(language);

  const handleCopy = async () => {
    if (!preRef.current) return;
    const codeToCopy = preRef.current.textContent || '';

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(codeToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = codeToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code block:', err);
    }
  };

  return (
    <div
      className="group/code relative my-6 overflow-hidden rounded-xl border border-border/80 bg-[#090d16] shadow-xl shadow-black/30 transition-all duration-200 hover:border-slate-700/80"
      data-code-block=""
    >
      <div className="flex h-10 items-center justify-between border-b border-border/60 bg-[#0e1626]/90 backdrop-blur-sm px-4 select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-rose-500/60" />
            <span className="size-2.5 rounded-full bg-amber-500/60" />
            <span className="size-2.5 rounded-full bg-emerald-500/60" />
          </div>
          {formattedLang ? (
            <div className="flex items-center gap-1.5">
              <LangIcon className="size-3.5 text-sky-400/90" />
              <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-sky-400/90">
                {formattedLang}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Code2 className="size-3.5 text-muted-foreground/70" />
              <span className="font-mono text-[11px] font-medium tracking-wider uppercase text-muted-foreground/70">
                Code
              </span>
            </div>
          )}
        </div>
        <CopyButton onCopy={handleCopy} copied={copied} />
      </div>

      <pre
        ref={preRef}
        className={cn(
          'overflow-x-auto p-4 font-mono text-sm leading-relaxed text-slate-100 subpixel-antialiased selection:bg-sky-500/30 selection:text-white',
          className
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}

interface CodeProps extends React.ComponentPropsWithoutRef<'code'> {
  'data-language'?: string;
  'data-theme'?: string;
  [key: string]: unknown;
}

export function Code({ children, className, ...props }: CodeProps) {
  const isBlockCode =
    props['data-language'] !== undefined ||
    props['data-theme'] !== undefined ||
    className?.includes('language-');

  if (isBlockCode) {
    return (
      <code className={cn('grid w-full font-mono text-sm', className)} {...props}>
        {children}
      </code>
    );
  }

  // Inline code styling matching website design
  return (
    <code
      className={cn(
        'rounded-md bg-secondary/80 border border-border/70 px-1.5 py-0.5 text-[0.875em] font-mono text-primary font-medium tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}

// Suppress duplicate standalone figcaption rendering since CodeFigure handles it in header
export function CodeFigcaption({
  children,
  ...props
}: React.ComponentPropsWithoutRef<'figcaption'> & { [key: string]: unknown }) {
  if (props['data-rehype-pretty-code-title'] !== undefined) {
    return null;
  }
  return <figcaption {...props}>{children}</figcaption>;
}
