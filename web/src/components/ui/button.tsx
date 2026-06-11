import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-[var(--motion-instant)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copa-gold-bright [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[var(--shadow-1)] hover:bg-copa-gold-bright rounded-xl min-h-12 px-6 text-base",
        outline:
          "border-2 border-border-strong bg-card-muted text-foreground shadow-[var(--shadow-1)] hover:bg-card hover:border-primary/40 rounded-xl min-h-12 px-6 text-base",
        ghost:
          "rounded-xl min-h-12 px-4 text-base text-foreground hover:bg-card",
        link: "text-primary underline-offset-4 hover:text-copa-gold-bright hover:underline min-h-12 px-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
