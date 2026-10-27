import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = inputId && error ? `${inputId}-error` : undefined;
    const helperId = inputId && helperText ? `${inputId}-helper` : undefined;
    const describedBy = errorId || helperId || props['aria-describedby'];

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          ref={ref}
          aria-invalid={error ? 'true' : props['aria-invalid']}
          aria-describedby={describedBy}
          className={cn(
            'flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors',
            'focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20',
            'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
            error && 'border-rose-500 focus:border-rose-600 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p id={helperId} className="text-xs text-slate-500">
            {helperText}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
