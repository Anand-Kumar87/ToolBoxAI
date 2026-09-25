import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "gradient-btn",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md",
        outline:
          "border border-border/80 bg-background/60 backdrop-blur-md text-foreground hover:bg-primary/5 hover:border-primary/50 hover:text-primary transition-all",
        secondary:
          "bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-border/50 backdrop-blur-sm",
        ghost: "hover:bg-primary/10 hover:text-primary transition-colors",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "gradient-btn",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3.5 text-xs font-semibold",
        lg: "h-14 rounded-2xl px-9 text-base font-extrabold tracking-tight",
        xl: "h-15 rounded-full px-10 text-base sm:text-lg font-black tracking-tight",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
