import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[12px] text-[15px] font-medium transition-all active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-[var(--gold)] text-[var(--bg)] font-semibold hover:opacity-90 shadow-sm',
        secondary: 'bg-[var(--surface)] text-[var(--fg)] border border-[var(--line)] hover:border-[var(--line-strong)]',
        outline: 'border border-[var(--line)] bg-transparent text-[var(--fg)] hover:bg-[var(--surface)]',
        ghost: 'text-[var(--fg)] hover:bg-[var(--surface)]',
        destructive: 'bg-[var(--bad)] text-white hover:opacity-90',
        glow: 'bg-[var(--gold-glow)] text-[var(--gold)] border border-[var(--gold)] hover:opacity-90',
      },
      size: {
        default: 'h-11 px-5 py-2 min-h-[44px]',
        sm: 'h-9 px-3 text-xs min-h-[36px]',
        lg: 'h-13 px-8 text-base min-h-[48px]',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px] p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
