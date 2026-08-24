import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info as InfoIcon,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalloutType = 'tip' | 'note' | 'info' | 'warning' | 'danger' | 'success';

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: CalloutType;
  title?: string;
  emoji?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const calloutConfig = {
  tip: {
    icon: Lightbulb,
    defaultEmoji: '💡',
    containerClass:
      'border-amber-500/30 bg-amber-500/[0.08] text-amber-100/90 shadow-[0_0_20px_-5px_rgba(245,158,11,0.08)]',
    borderAccent: 'border-l-amber-500',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-300',
  },
  note: {
    icon: InfoIcon,
    defaultEmoji: '📝',
    containerClass:
      'border-sky-500/30 bg-sky-500/[0.08] text-sky-100/90 shadow-[0_0_20px_-5px_rgba(14,165,233,0.08)]',
    borderAccent: 'border-l-sky-500',
    iconColor: 'text-sky-400',
    titleColor: 'text-sky-300',
  },
  info: {
    icon: InfoIcon,
    defaultEmoji: 'ℹ️',
    containerClass:
      'border-blue-500/30 bg-blue-500/[0.08] text-blue-100/90 shadow-[0_0_20px_-5px_rgba(59,130,246,0.08)]',
    borderAccent: 'border-l-blue-500',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-300',
  },
  warning: {
    icon: AlertTriangle,
    defaultEmoji: '⚠️',
    containerClass:
      'border-orange-500/30 bg-orange-500/[0.08] text-orange-100/90 shadow-[0_0_20px_-5px_rgba(249,115,22,0.08)]',
    borderAccent: 'border-l-orange-500',
    iconColor: 'text-orange-400',
    titleColor: 'text-orange-300',
  },
  danger: {
    icon: AlertCircle,
    defaultEmoji: '🚨',
    containerClass:
      'border-rose-500/30 bg-rose-500/[0.08] text-rose-100/90 shadow-[0_0_20px_-5px_rgba(244,63,94,0.08)]',
    borderAccent: 'border-l-rose-500',
    iconColor: 'text-rose-400',
    titleColor: 'text-rose-300',
  },
  success: {
    icon: CheckCircle2,
    defaultEmoji: '✅',
    containerClass:
      'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-100/90 shadow-[0_0_20px_-5px_rgba(16,185,129,0.08)]',
    borderAccent: 'border-l-emerald-500',
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-300',
  },
};

export function Callout({
  type = 'tip',
  title,
  emoji,
  icon,
  className,
  children,
  ...props
}: CalloutProps) {
  const config = calloutConfig[type] || calloutConfig.tip;
  const Icon = config.icon;

  const renderIcon = () => {
    if (icon) {
      return <span className={cn('shrink-0 mt-0.5', config.iconColor)}>{icon}</span>;
    }
    if (emoji) {
      return (
        <span
          className="text-xl shrink-0 leading-none select-none mt-0.5"
          role="img"
          aria-hidden="true"
        >
          {emoji}
        </span>
      );
    }
    return <Icon className={cn('size-5 shrink-0 mt-0.5', config.iconColor)} aria-hidden="true" />;
  };

  return (
    <aside
      className={cn(
        'my-6 flex items-start gap-3.5 rounded-xl border border-l-4 p-4 md:p-5 backdrop-blur-xs transition-colors',
        config.containerClass,
        config.borderAccent,
        className
      )}
      role="note"
      {...props}
    >
      {renderIcon()}
      <div className="flex-1 min-w-0 text-sm leading-relaxed [&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>ul]:my-1.5 [&>ol]:my-1.5 [&>code]:bg-black/30">
        {title && (
          <h5 className={cn('mb-1.5 font-semibold text-sm tracking-tight', config.titleColor)}>
            {title}
          </h5>
        )}
        {children}
      </div>
    </aside>
  );
}

export function Tip(props: Omit<CalloutProps, 'type'>) {
  return <Callout type="tip" emoji="💡" {...props} />;
}

export function Note(props: Omit<CalloutProps, 'type'>) {
  return <Callout type="note" {...props} />;
}

export function Warning(props: Omit<CalloutProps, 'type'>) {
  return <Callout type="warning" {...props} />;
}

export function Info(props: Omit<CalloutProps, 'type'>) {
  return <Callout type="info" {...props} />;
}
