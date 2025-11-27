import * as React from "react";
import { cn } from "../../utils/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showValue?: boolean;
  variant?: "default" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      showValue = false,
      variant = "default",
      size = "md",
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variants = {
      default: "bg-blue-500 dark:bg-blue-400",
      success: "bg-green-500 dark:bg-green-400",
      warning: "bg-amber-500 dark:bg-amber-400",
      error: "bg-red-500 dark:bg-red-400",
    };

    const sizes = {
      sm: "h-1.5",
      md: "h-2.5",
      lg: "h-4",
    };

    return (
      <div className={cn("w-full", className)} {...props}>
        {showValue && (
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-300">Progress</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${Math.round(percentage)}% complete`}
          className={cn(
            "w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700",
            sizes[size]
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out",
              variants[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

// Indeterminate progress bar
export interface ProgressIndeterminateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
}

const ProgressIndeterminate = React.forwardRef<
  HTMLDivElement,
  ProgressIndeterminateProps
>(({ className, variant = "default", size = "md", ...props }, ref) => {
  const variants = {
    default: "bg-blue-500 dark:bg-blue-400",
    success: "bg-green-500 dark:bg-green-400",
    warning: "bg-amber-500 dark:bg-amber-400",
    error: "bg-red-500 dark:bg-red-400",
  };

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-busy="true"
      aria-label="Loading"
      className={cn(
        "w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700",
        sizes[size],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "animate-progress-indeterminate h-full w-1/3 rounded-full",
          variants[variant]
        )}
        style={{
          animation: "progressIndeterminate 1.5s ease-in-out infinite",
        }}
      />
    </div>
  );
});

ProgressIndeterminate.displayName = "ProgressIndeterminate";

// Circular progress
export interface ProgressCircularProps extends React.SVGAttributes<SVGSVGElement> {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "default" | "success" | "warning" | "error";
}

const ProgressCircular = React.forwardRef<SVGSVGElement, ProgressCircularProps>(
  (
    {
      className,
      value,
      max = 100,
      size = 40,
      strokeWidth = 4,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const isIndeterminate = value === undefined;
    const percentage = isIndeterminate
      ? 25
      : Math.min(Math.max((value / max) * 100, 0), 100);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const variants = {
      default: "text-blue-500 dark:text-blue-400",
      success: "text-green-500 dark:text-green-400",
      warning: "text-amber-500 dark:text-amber-400",
      error: "text-red-500 dark:text-red-400",
    };

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn(
          isIndeterminate && "animate-spin",
          variants[variant],
          className
        )}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: isIndeterminate
              ? "none"
              : "stroke-dashoffset 0.3s ease",
          }}
        />
      </svg>
    );
  }
);

ProgressCircular.displayName = "ProgressCircular";

export { Progress, ProgressIndeterminate, ProgressCircular };
