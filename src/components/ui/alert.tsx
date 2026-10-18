import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-xl border p-4 text-sm flex items-start gap-3',
  {
    variants: {
      variant: {
        info: 'border-sky-200 bg-sky-50 text-sky-800 [&>svg]:text-sky-600',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800 [&>svg]:text-emerald-600',
        warning: 'border-amber-200 bg-amber-50 text-amber-800 [&>svg]:text-amber-600',
        danger: 'border-rose-200 bg-rose-50 text-rose-800 [&>svg]:text-rose-600',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
}

export function Alert({ className, variant = 'info', title, children, ...props }: AlertProps) {
  const Icon = iconMap[variant || 'info'];

  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h5 className="font-semibold leading-tight mb-1">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}
