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
            "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-5 fade-in duration-300",
            t.type === "success" && "bg-emerald-50 border-emerald-200 text-emerald-800",
            t.type === "error" && "bg-red-50 border-red-200 text-red-800",
            t.type === "info" && "bg-blue-50 border-blue-200 text-blue-800"
          )}
        >
          {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {t.type === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
          {t.type === "info" && <Info className="w-5 h-5 text-blue-600" />}
          <span className="font-medium text-sm">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="ml-2 p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

