import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-lg hover:bg-blue-500 hover:shadow-xl disabled:bg-neutral-700 disabled:text-neutral-400",
        destructive:
          "bg-red-600 text-white shadow-lg hover:bg-red-500 hover:shadow-xl disabled:bg-neutral-700 disabled:text-neutral-400",
        outline:
          "border border-blue-500 bg-transparent text-blue-400 shadow-sm hover:bg-blue-500 hover:text-white hover:border-blue-400 disabled:border-neutral-600 disabled:text-neutral-500",
        secondary:
          "bg-neutral-700 text-white shadow-sm hover:bg-neutral-600 disabled:bg-neutral-800 disabled:text-neutral-500",
        ghost: "text-white hover:bg-neutral-700 hover:text-white disabled:text-neutral-500",
        link: "text-blue-400 underline-offset-4 hover:underline hover:text-blue-300 disabled:text-neutral-500",
        success:
          "bg-green-600 text-white shadow-lg hover:bg-green-500 hover:shadow-xl disabled:bg-neutral-700 disabled:text-neutral-400",
        warning:
          "bg-orange-600 text-white shadow-lg hover:bg-orange-500 hover:shadow-xl disabled:bg-neutral-700 disabled:text-neutral-400",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
