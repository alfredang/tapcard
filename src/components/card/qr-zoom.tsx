"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { QrCode, X } from "lucide-react";
import { qrDataUrl } from "@/lib/qr";

export type ZoomMode = { key: string; label: string };

/**
 * Full-screen QR for flashing at someone across a table — same pattern as the
 * LMS "Take Attendance" zoom: a blurred backdrop, a big heading, the code on
 * a white tile as large as the screen allows, and its link underneath. The
 * mode chips switch between the WhatsApp, LinkedIn and other QRs in place.
 * Escape, the close button or a tap outside closes it; focus returns to the
 * zoom button. The screen is kept awake while it's open (where supported).
 */
export function QrZoom({
  open,
  onClose,
  payload,
  title,
  subtitle,
  hint,
  dark,
  light,
  modes,
  mode,
  onModeChange,
}: {
  open: boolean;
  onClose: () => void;
  payload: string;
  title: string;
  subtitle: string;
  /// Shown when the chosen QR falls back to the card link (field not set).
  hint?: string;
  dark: string;
  light: string;
  modes: ZoomMode[];
  mode: string;
  onModeChange: (key: string) => void;
}) {
  const [png, setPng] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    qrDataUrl(payload, { dark, light, width: 1024, margin: 1 }).then((url) => {
      if (!cancelled) setPng(url);
    });
    return () => {
      cancelled = true;
    };
  }, [open, payload, dark, light]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Keep the phone/laptop screen on while the QR is being shown.
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
    };
    nav.wakeLock
      ?.request("screen")
      .then((l) => (lock = l))
      .catch(() => {});

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      lock?.release().catch(() => {});
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} QR code`}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-3 overflow-y-auto p-4 sm:gap-4 sm:p-6"
    >
      <div
        className="bg-background/85 absolute inset-0 backdrop-blur-md"
        onClick={onClose}
      />

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close full-screen QR"
        className="border-border bg-surface text-muted-foreground hover:text-foreground absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-xl border shadow-sm"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative z-10 flex flex-col items-center gap-1 px-12 text-center">
        <h2 className="text-primary text-2xl leading-tight font-bold sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        <p className="text-foreground text-base sm:text-xl">{subtitle}</p>
      </div>

      <div className="relative z-10 rounded-3xl bg-white p-3 shadow-2xl sm:p-5">
        {png ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={png}
            alt={`${title} QR code`}
            className="block h-[min(86vw,calc(100dvh-19rem))] w-[min(86vw,calc(100dvh-19rem))] max-h-[720px] max-w-[720px] min-h-48 min-w-48 [image-rendering:pixelated]"
          />
        ) : (
          <div className="flex h-[min(86vw,calc(100dvh-19rem))] w-[min(86vw,calc(100dvh-19rem))] min-h-48 min-w-48 items-center justify-center text-slate-400">
            <QrCode className="h-10 w-10 animate-pulse" />
          </div>
        )}
      </div>

      {hint && (
        <p className="text-warning relative z-10 max-w-xl text-center text-sm">
          {hint}
        </p>
      )}
      <p className="text-muted-foreground relative z-10 max-w-2xl text-center text-xs break-all sm:text-sm">
        {payload}
      </p>

      <div className="relative z-10 flex flex-wrap justify-center gap-2">
        {modes.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => onModeChange(m.key)}
            aria-pressed={mode === m.key}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              mode === m.key
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}
