import * as React from "react";
import { cn } from "../../utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: "sm" | "md" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      inputSize = "md",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const sizes = {
      sm: "h-8 text-sm px-3",
      md: "h-10 text-sm px-4",
      lg: "h-12 text-base px-4",
    };

    const iconSizes = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-5 w-5",
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className={cn(
                "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500",
                iconSizes[inputSize]
              )}
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              "w-full rounded-lg border bg-white transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "dark:bg-slate-900",
              sizes[inputSize],
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-600 dark:focus:border-blue-500",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "text-slate-900 dark:text-slate-100",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div
              className={cn(
                "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500",
                iconSizes[inputSize]
              )}
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1.5 text-sm text-slate-500 dark:text-slate-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
