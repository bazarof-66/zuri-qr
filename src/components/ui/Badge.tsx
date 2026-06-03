type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-primary/15 text-primary border-primary/30',
  warning: 'bg-secondary/15 text-secondary border-secondary/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
  info: 'bg-[#00D4FF]/15 text-[#00D4FF] border-[#00D4FF]/30',
  neutral: 'bg-text-muted/15 text-text-secondary border-border-light',
};

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5
        text-xs font-medium font-mono
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {variant === 'success' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
      {variant === 'warning' && <span className="w-1.5 h-1.5 rounded-full bg-secondary" />}
      {children}
    </span>
  );
}
