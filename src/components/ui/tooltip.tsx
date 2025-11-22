import * as React from "react";
import { cn } from "../../utils/cn";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: "top" | "right" | "bottom" | "left";
  delay?: number;
  className?: string;
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, position = "top", delay = 200, className }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [shouldRender, setShouldRender] = React.useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const tooltipId = React.useId();

    const showTooltip = React.useCallback(() => {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        setShouldRender(true);
      }, delay);
    }, [delay]);

    const hideTooltip = React.useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 150);
    }, []);

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const positions = {
      top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      right: "left-full top-1/2 -translate-y-1/2 ml-2",
      bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
      left: "right-full top-1/2 -translate-y-1/2 mr-2",
    };

    const arrows = {
      top: "top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent dark:border-t-slate-700",
      right:
        "right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent dark:border-r-slate-700",
      bottom:
        "bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent dark:border-b-slate-700",
      left: "left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent dark:border-l-slate-700",
    };

    return (
      <div ref={ref} className="relative inline-block">
        {React.cloneElement(children, {
          onMouseEnter: showTooltip,
          onMouseLeave: hideTooltip,
          onFocus: showTooltip,
          onBlur: hideTooltip,
          "aria-describedby": isVisible ? tooltipId : undefined,
        })}
        {shouldRender && (
          <div
            id={tooltipId}
            role="tooltip"
            className={cn(
              "absolute z-50 whitespace-nowrap rounded-md bg-slate-800 px-3 py-1.5 text-sm text-white shadow-lg transition-opacity dark:bg-slate-700",
              positions[position],
              isVisible ? "opacity-100" : "opacity-0",
              className
            )}
          >
            {content}
            <span
              className={cn("absolute h-0 w-0 border-4", arrows[position])}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    );
  }
);

Tooltip.displayName = "Tooltip";

export { Tooltip };
