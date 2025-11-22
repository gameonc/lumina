import * as React from "react";
import { cn } from "../../utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rectangle";
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    { className, variant = "rectangle", width, height, style, ...props },
    ref
  ) => {
    const variants = {
      text: "rounded-md h-4",
      circle: "rounded-full aspect-square",
      rectangle: "rounded-lg",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-slate-200 dark:bg-slate-700",
          variants[variant],
          className
        )}
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
          ...style,
        }}
        role="status"
        aria-label="Loading"
        aria-busy="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// Preset skeleton components for common use cases
export interface SkeletonTextProps
  extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ className, lines = 3, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            className={i === lines - 1 ? "w-3/4" : "w-full"}
          />
        ))}
      </div>
    );
  }
);

SkeletonText.displayName = "SkeletonText";

export interface SkeletonCardProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900",
          className
        )}
        {...props}
      >
        <div className="flex items-center space-x-4">
          <Skeleton variant="circle" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
        </div>
        <div className="mt-4">
          <SkeletonText lines={3} />
        </div>
      </div>
    );
  }
);

SkeletonCard.displayName = "SkeletonCard";

export { Skeleton, SkeletonText, SkeletonCard };
