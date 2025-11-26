import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, children, className }, ref) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }

      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);

    React.useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape" && open) {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onClose]);

    if (!mounted || !open) return null;

    return createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity dark:bg-black/70"
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Modal Content */}
        <div
          ref={ref}
          className={cn(
            "relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            className
          )}
        >
          {children}
        </div>
      </div>,
      document.body
    );
  }
);

Modal.displayName = "Modal";

export interface ModalHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mb-4 flex items-start justify-between", className)}
        {...props}
      />
    );
  }
);

ModalHeader.displayName = "ModalHeader";

export interface ModalTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn(
          "text-lg font-semibold text-slate-900 dark:text-slate-100",
          className
        )}
        {...props}
      />
    );
  }
);

ModalTitle.displayName = "ModalTitle";

export interface ModalDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  ModalDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
      {...props}
    />
  );
});

ModalDescription.displayName = "ModalDescription";

export interface ModalCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ModalClose = React.forwardRef<HTMLButtonElement, ModalCloseProps>(
  ({ className, onClick, ...props }, ref) => {
    // Get onClose from parent Modal via context if not provided
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      // If no onClick provided, try to find and click the backdrop
      if (!onClick) {
        const backdrop = document.querySelector(
          '[aria-hidden="true"]'
        ) as HTMLElement;
        backdrop?.click();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={cn(
          "rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300",
          className
        )}
        aria-label="Close modal"
        {...props}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    );
  }
);

ModalClose.displayName = "ModalClose";

export interface ModalFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mt-6 flex items-center justify-end gap-3", className)}
        {...props}
      />
    );
  }
);

ModalFooter.displayName = "ModalFooter";

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalClose,
  ModalFooter,
};
