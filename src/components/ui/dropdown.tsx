import * as React from "react";
import { cn } from "../../utils/cn";

interface DropdownContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

const DropdownContext = React.createContext<DropdownContextValue | undefined>(
  undefined
);

function useDropdownContext() {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error(
      "Dropdown components must be used within a Dropdown provider"
    );
  }
  return context;
}

export interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({ children, className }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    React.useEffect(() => {
      if (!open) {
        setActiveIndex(-1);
      }
    }, [open]);

    return (
      <DropdownContext.Provider
        value={{ open, setOpen, activeIndex, setActiveIndex }}
      >
        <div
          ref={ref || dropdownRef}
          className={cn("relative inline-block", className)}
        >
          {children}
        </div>
      </DropdownContext.Provider>
    );
  }
);

Dropdown.displayName = "Dropdown";

export interface DropdownTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const DropdownTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownTriggerProps
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useDropdownContext();

  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      className={cn(className)}
      onClick={() => setOpen((prev) => !prev)}
      {...props}
    >
      {children}
    </button>
  );
});

DropdownTrigger.displayName = "DropdownTrigger";

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "left" | "right";
}

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ className, align = "left", children, ...props }, ref) => {
    const { open, setOpen, activeIndex, setActiveIndex } = useDropdownContext();
    const menuRef = React.useRef<HTMLDivElement>(null);
    const itemsRef = React.useRef<(HTMLButtonElement | null)[]>([]);

    const items = React.Children.toArray(children).filter(
      (child) => React.isValidElement(child) && child.type === DropdownItem
    );

    React.useEffect(() => {
      if (open && menuRef.current) {
        menuRef.current.focus();
      }
    }, [open]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          event.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (activeIndex >= 0 && itemsRef.current[activeIndex]) {
            itemsRef.current[activeIndex]?.click();
          }
          break;
        case "Escape":
          event.preventDefault();
          setOpen(false);
          break;
        case "Tab":
          setOpen(false);
          break;
      }
    };

    if (!open) return null;

    return (
      <div
        ref={ref || menuRef}
        role="menu"
        tabIndex={-1}
        className={cn(
          "absolute z-50 mt-1 min-w-[180px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900",
          "animate-in fade-in-0 zoom-in-95 duration-100",
          align === "left" ? "left-0" : "right-0",
          className
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child) && child.type === DropdownItem) {
            return React.cloneElement(child, {
              ...child.props,
              key: index,
              isActive: index === activeIndex,
              ref: (el: HTMLButtonElement | null) => {
                itemsRef.current[index] = el;
              },
            } as DropdownItemProps);
          }
          return child;
        })}
      </div>
    );
  }
);

DropdownMenu.displayName = "DropdownMenu";

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  isActive?: boolean;
}

const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, icon, isActive, children, onClick, ...props }, ref) => {
    const { setOpen } = useDropdownContext();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      setOpen(false);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
          "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
          "focus:bg-slate-100 focus:outline-none dark:focus:bg-slate-800",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isActive && "bg-slate-100 dark:bg-slate-800",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {icon && (
          <span
            className="h-4 w-4 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        {children}
      </button>
    );
  }
);

DropdownItem.displayName = "DropdownItem";

export interface DropdownSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownSeparator = React.forwardRef<
  HTMLDivElement,
  DropdownSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="separator"
      className={cn("my-1 h-px bg-slate-200 dark:bg-slate-700", className)}
      {...props}
    />
  );
});

DropdownSeparator.displayName = "DropdownSeparator";

export {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
};
