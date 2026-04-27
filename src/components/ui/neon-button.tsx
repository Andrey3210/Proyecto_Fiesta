import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative group border text-foreground mx-auto text-center rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-blue-500/5 hover:bg-blue-500/0 border-blue-500/20',
        solid:
          'bg-blue-500 hover:bg-blue-600 text-white border-transparent hover:border-foreground/50 transition-all duration-200',
        ghost: 'border-transparent bg-transparent hover:border-zinc-600 hover:bg-white/10',
      },
      size: {
        default: 'px-7 py-1.5',
        sm: 'px-4 py-0.5',
        lg: 'px-10 py-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  neon?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, neon = true, size, variant, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            'absolute inset-y-0 inset-x-0 mx-auto hidden h-px w-3/4 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 dark:via-blue-500',
            neon && 'block',
          )}
        />
        {children}
        <span
          className={cn(
            'absolute -bottom-px inset-x-0 mx-auto hidden h-px w-3/4 bg-gradient-to-r from-transparent via-blue-600 to-transparent transition-all duration-500 ease-in-out group-hover:opacity-30 dark:via-blue-500',
            neon && 'block',
          )}
        />
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
