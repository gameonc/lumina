import * as React from "react";
import { cn } from "../../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "brand"
    | "accent";
  size?: "sm" | "md";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants = {
      default:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      brand:
        "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
      accent:
        "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300",
      success:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      warning:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      info: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-3 py-1 text-sm",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full font-semibold",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
