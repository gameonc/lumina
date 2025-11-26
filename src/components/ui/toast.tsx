"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X, AlertCircle, Info } from "lucide-react";
import { cn } from "@/utils/cn";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function emitChange() {
  for (const listener of listeners) {
    listener(toasts);
  }
}

export function toast(message: string, type: ToastType = "success") {
  const id = String(++toastId);
  toasts = [...toasts, { id, message, type }];
  emitChange();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emitChange();
  }, 4000);
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    return () => {
      const index = listeners.indexOf(setCurrentToasts);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const removeToast = (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    emitChange();
  };

  if (currentToasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
      {currentToasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "animate-in slide-in-from-right-5 fade-in flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg duration-300",
            t.type === "success" &&
              "border-emerald-200 bg-emerald-50 text-emerald-800",
            t.type === "error" && "border-red-200 bg-red-50 text-red-800",
            t.type === "info" && "border-blue-200 bg-blue-50 text-blue-800"
          )}
        >
          {t.type === "success" && (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          )}
          {t.type === "error" && (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          {t.type === "info" && <Info className="h-5 w-5 text-blue-600" />}
          <span className="text-sm font-medium">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="ml-2 rounded-lg p-1 transition-colors hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
