import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "cta-base bg-primary text-primary-foreground hover:bg-primary/85 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        accent: "cta-base cta-primary",
        destructive: "transition-colors focus-visible:ring-2 focus-visible:ring-ring bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "cta-base cta-secondary",
        secondary: "transition-colors focus-visible:ring-2 focus-visible:ring-ring bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        link: "cta-text text-foreground",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-[0.95rem]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
