"use client";

import * as React from "react";
import { cn } from "../../utils/cn";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(
  undefined
);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    { className, defaultValue, value, onValueChange, children, ...props },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const activeTab = value ?? internalValue;

    const setActiveTab = React.useCallback(
      (newValue: string) => {
        if (value === undefined) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [value, onValueChange]
    );

    return (
      <TabsContext.Provider value={{ activeTab, setActiveTab }}>
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = "Tabs";

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabList = React.forwardRef<HTMLDivElement, TabListProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        className={cn(
          "relative flex border-b border-slate-200 dark:border-slate-700",
          className
        )}
        {...props}
      />
    );
  }
);

TabList.displayName = "TabList";

export interface TabProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  ({ className, value, children, ...props }, ref) => {
    const { activeTab, setActiveTab } = useTabsContext();
    const isActive = activeTab === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        tabIndex={isActive ? 0 : -1}
        className={cn(
          "relative px-4 py-2.5 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          isActive
            ? "text-blue-600 dark:text-blue-400"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
          className
        )}
        onClick={() => setActiveTab(value)}
        {...props}
      >
        {children}
        {isActive && (
          <span
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400"
            style={{
              animation: "tabUnderline 150ms ease-out",
            }}
          />
        )}
      </button>
    );
  }
);

Tab.displayName = "Tab";

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  ({ className, value, children, ...props }, ref) => {
    const { activeTab } = useTabsContext();
    const isActive = activeTab === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        tabIndex={0}
        className={cn("mt-4 focus-visible:outline-none", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabPanel.displayName = "TabPanel";

export { Tabs, TabList, Tab, TabPanel };
