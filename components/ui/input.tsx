import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 min-h-[44px] w-full rounded-[12px] border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-[15px] text-[var(--fg)] placeholder:text-[var(--faint)] transition-colors focus:border-[var(--gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
