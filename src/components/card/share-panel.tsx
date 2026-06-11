"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { qrDataUrl, qrSvg } from "@/lib/qr";
import { appUrl } from "@/lib/utils";
import { whatsappLink, mailtoLink, WHATSAPP_PRESETS } from "@/lib/whatsapp";
import type { CardData } from "@/lib/card";

type QrMode = "card" | "save" | "whatsapp" | "email" | "website";

const MODES: { key: QrMode; label: string }[] = [
  { key: "card", label: "Open Card" },
  { key: "save", label: "Save Contact" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "website", label: "Website" },
];

export function SharePanel({ card }: { card: CardData }) {
  const slug = card.slug!;
  const publicUrl = appUrl(`/c/${slug}`);
  const [mode, setMode] = useState<QrMode>("card");
  const [dark, setDark] = useState("#0b1020");
  const [light, setLight] = useState("#ffffff");
  const [png, setPng] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const payload = useMemo(() => {
    switch (mode) {
      case "save":
        return appUrl(`/api/c/${slug}/vcf`);
      case "whatsapp":
        return (
          whatsappLink(card.whatsapp, WHATSAPP_PRESETS.message(card.fullName)) ||
          publicUrl
        );
      case "email":
        return mailtoLink(card.email) || publicUrl;
      case "website":
        return card.website || publicUrl;
      default:
        return publicUrl;
    }
  }, [mode, slug, card, publicUrl]);

  useEffect(() => {
    let cancelled = false;
    qrDataUrl(payload, { dark, light, width: 320 }).then((url) => {
      if (!cancelled) setPng(url);
    });
    return () => {
      cancelled = true;
    };
  }, [payload, dark, light]);

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadPng() {
    const a = document.createElement("a");
    a.href = png;
    a.download = `${slug}-qr.png`;
    a.click();
  }

  async function downloadSvg() {
    const svg = await qrSvg(payload, { dark, light });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface-2/40 p-4">
        {png ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={png}
            alt="QR code"
            className="h-40 w-40 rounded-lg bg-white p-2"
          />
        ) : (
          <div className="flex h-40 w-40 items-center justify-center text-muted-foreground">
            <QrCode className="h-8 w-8 animate-pulse" />
          </div>
        )}
        <div className="grid w-full grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={downloadPng}>
            <Download className="h-4 w-4" /> PNG
          </Button>
          <Button variant="outline" size="sm" onClick={downloadSvg}>
            <Download className="h-4 w-4" /> SVG
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          QR action
        </p>
        <div className="flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                mode === m.key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Fg
          <input
            type="color"
            value={dark}
            onChange={(e) => setDark(e.target.value)}
            className="h-7 w-7 cursor-pointer rounded border border-border bg-transparent"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Bg
          <input
            type="color"
            value={light}
            onChange={(e) => setLight(e.target.value)}
            className="h-7 w-7 cursor-pointer rounded border border-border bg-transparent"
          />
        </label>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-border bg-surface-2/40 px-3 py-2">
        <span className="flex-1 truncate text-xs text-muted-foreground">
          {publicUrl}
        </span>
        <button
          onClick={copyLink}
          className="text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
