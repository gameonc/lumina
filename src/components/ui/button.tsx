import * as React from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "brand" | "accent";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 rounded-xl hover:scale-[1.02] active:scale-[0.98]";

    const variants = {
      primary:
        "bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-500/20 shadow-sm shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 dark:bg-blue-600 dark:hover:bg-blue-700",
      brand:
        "bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-700 hover:to-brand-600 focus-visible:ring-brand-500/20 shadow-sm shadow-brand-500/10 hover:shadow-lg hover:shadow-brand-500/20",
      accent:
        "bg-gradient-to-r from-accent-600 to-accent-500 text-white hover:from-accent-700 hover:to-accent-600 focus-visible:ring-accent-500/20 shadow-sm shadow-accent-500/10 hover:shadow-lg hover:shadow-accent-500/20",
      secondary:
        "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-500/20 shadow-sm hover:shadow-lg dark:bg-neutral-800 dark:hover:bg-neutral-700",
      ghost:
        "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400/20 dark:text-slate-300 dark:hover:bg-slate-800",
      danger:
        "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500/20 shadow-sm shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 dark:bg-red-600 dark:hover:bg-red-700",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-5 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
