"use client";

import { useAppStore } from "@/stores";
import type { Toast } from "@/types";

type ToastType = Toast["type"];

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

export function useToast() {
  const { addToast, removeToast, toasts } = useAppStore();

  const toast = (options: ToastOptions & { type?: ToastType }) => {
    addToast({
      type: options.type || "info",
      title: options.title,
      description: options.description,
      duration: options.duration,
    });
  };

  const success = (options: ToastOptions) => {
    addToast({
      type: "success",
      ...options,
    });
  };

  const error = (options: ToastOptions) => {
    addToast({
      type: "error",
      ...options,
    });
  };

  const warning = (options: ToastOptions) => {
    addToast({
      type: "warning",
      ...options,
    });
  };

  const info = (options: ToastOptions) => {
    addToast({
      type: "info",
      ...options,
    });
  };

  const dismiss = (id: string) => {
    removeToast(id);
  };

  return {
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    toasts,
  };
}
