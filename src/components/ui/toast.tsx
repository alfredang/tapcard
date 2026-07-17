"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; type: ToastType; message: string };

// Tiny module-level pub/sub so any client component can `toast(...)` without a
// provider — the single <Toaster/> mounted in the root layout renders them.
let listeners: ((t: ToastItem) => void)[] = [];
let counter = 0;

function emit(message: string, type: ToastType) {
  const item = { id: ++counter, type, message };
  listeners.forEach((l) => l(item));
}

export const toast = Object.assign(
  (message: string, type: ToastType = "success") => emit(message, type),
  {
    success: (m: string) => emit(m, "success"),
    error: (m: string) => emit(m, "error"),
    info: (m: string) => emit(m, "info"),
  },
);

const ICON = { success: CheckCircle2, error: AlertCircle, info: Info };
const TONE = { success: "text-success", error: "text-danger", info: "text-primary" };

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onToast = (t: ToastItem) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 3500);
    };
    listeners.push(onToast);
    return () => {
      listeners = listeners.filter((l) => l !== onToast);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end">
      <AnimatePresence>
        {items.map((t) => {
          const Icon = ICON[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-surface/95 p-4 shadow-2xl backdrop-blur"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${TONE[t.type]}`} />
              <p className="flex-1 text-sm leading-snug">{t.message}</p>
              <button
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
