import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Toast } from "@/types";

interface AppUserPreferences {
  theme: "light" | "dark" | "system";
  defaultChartType:
    | "line"
    | "bar"
    | "pie"
    | "scatter"
    | "area"
    | "radar"
    | "heatmap";
  autoAnalysis: boolean;
  emailNotifications: boolean;
}

interface AppState {
  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Active dataset
  activeDatasetId: string | null;
  setActiveDatasetId: (id: string | null) => void;

  // User preferences
  preferences: AppUserPreferences;
  setPreferences: (preferences: Partial<AppUserPreferences>) => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Loading states
  isLoading: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;

  // Modal state
  activeModal: string | null;
  modalData: unknown;
  openModal: (modal: string, data?: unknown) => void;
  closeModal: () => void;
}

const defaultPreferences: AppUserPreferences = {
  theme: "system",
  defaultChartType: "bar",
  autoAnalysis: true,
  emailNotifications: true,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Sidebar
        sidebarOpen: true,
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

        // Active dataset
        activeDatasetId: null,
        setActiveDatasetId: (id) => set({ activeDatasetId: id }),

        // Preferences
        preferences: defaultPreferences,
        setPreferences: (newPreferences) =>
          set({
            preferences: { ...get().preferences, ...newPreferences },
          }),

        // Toasts
        toasts: [],
        addToast: (toast) => {
          const id = Math.random().toString(36).substring(2, 9);
          const newToast = { ...toast, id };
          set({ toasts: [...get().toasts, newToast] });

          // Auto-remove toast after duration
          const duration = toast.duration ?? 5000;
          if (duration > 0) {
            setTimeout(() => {
              get().removeToast(id);
            }, duration);
          }
        },
        removeToast: (id) =>
          set({ toasts: get().toasts.filter((t) => t.id !== id) }),
        clearToasts: () => set({ toasts: [] }),

        // Loading
        isLoading: {},
        setLoading: (key, loading) =>
          set({ isLoading: { ...get().isLoading, [key]: loading } }),

        // Modal
        activeModal: null,
        modalData: null,
        openModal: (modal, data) =>
          set({ activeModal: modal, modalData: data }),
        closeModal: () => set({ activeModal: null, modalData: null }),
      }),
      {
        name: "app-storage",
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          preferences: state.preferences,
        }),
      }
    ),
    { name: "AppStore" }
  )
);
