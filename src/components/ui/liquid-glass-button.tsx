"use client"

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const liquidbuttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-slate-900/90 text-white border border-white/10 hover:bg-slate-800',
        cool:
          'bg-slate-950/70 text-white border border-cyan-200/10 hover:bg-slate-900 shadow-[0_18px_50px_rgba(2,6,23,0.48)] backdrop-blur-xl',
      },
      size: {
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6',
        xl: 'h-14 px-8 text-base',
        xxl: 'h-16 px-10 text-lg',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'cool',
      size: 'xxl',
    },
  },
);

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidbuttonVariants> {
  asChild?: boolean;
}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(liquidbuttonVariants({ variant, size, className }))}
        {...props}
      >
        <span className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_42%),linear-gradient(135deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0.01))]" />
        <span className="absolute inset-px rounded-2xl bg-gradient-to-b from-white/8 to-black/10 backdrop-blur-2xl" />
        <span className="relative z-10">{children}</span>
      </Comp>
    );
  },
);

LiquidButton.displayName = 'LiquidButton';

export { LiquidButton };
