"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Check, Download, QrCode, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { qrDataUrl, qrSvg } from "@/lib/qr";
import { appUrl } from "@/lib/utils";
import { whatsappChatQr, whatsappNumber, linkedinUrl, mailtoLink } from "@/lib/whatsapp";
import type { CardData } from "@/lib/card";
import { QrZoom } from "@/components/card/qr-zoom";

type QrMode = "card" | "save" | "whatsapp" | "linkedin" | "email" | "website";

const MODES: { key: QrMode; label: string }[] = [
  { key: "card", label: "Open Card" },
  { key: "save", label: "Save Contact" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "email", label: "Email" },
  { key: "website", label: "Website" },
];

/// The account's synced default (User.qrMode, set in the app or /settings).
const INITIAL_MODE: Record<string, QrMode> = {
  WHATSAPP: "whatsapp",
  LINKEDIN: "linkedin",
  CARD: "card",
};

export function SharePanel({
  card,
  qrMode,
  whatsappQr,
}: {
  card: CardData;
  qrMode?: string;
  /// The owner's WhatsApp contact link (wa.me/qr/…) from /settings, if set.
  whatsappQr?: string;
}) {
  const slug = card.slug!;
  const publicUrl = appUrl(`/c/${slug}`);
  const [mode, setMode] = useState<QrMode>(INITIAL_MODE[qrMode ?? ""] ?? "card");
  const [dark, setDark] = useState("#0b1020");
  const [light, setLight] = useState("#ffffff");
  const [png, setPng] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(false);

  const payload = useMemo(() => {
    switch (mode) {
      case "save":
        return appUrl(`/api/c/${slug}/vcf`);
      case "whatsapp":
        // With the owner's WhatsApp contact link on file, the QR is the same
        // as WhatsApp's own: scanning adds them as a contact.
        if (whatsappQr) return whatsappQr;
        // Otherwise wa.me itself (same as the app's QR), so both WhatsApp's
        // scanner and the phone camera open a chat with the owner.
        return (
          whatsappChatQr(whatsappNumber(card), card.fullName, card.countryCode) ||
          publicUrl
        );
      case "linkedin":
        return linkedinUrl(card.linkedin) || publicUrl;
      case "email":
        return mailtoLink(card.email) || publicUrl;
      case "website":
        return card.website || publicUrl;
      default:
        return publicUrl;
    }
  }, [mode, slug, card, publicUrl, whatsappQr]);

  // What the full-screen view says about the QR on show, and a nudge when
  // the field it needs isn't on the card (the QR then opens the card).
  const first =
    (card.fullName || "").trim().split(/\s+/).find((w) =>
      !/^(dr|mr|mrs|ms|mdm|miss|prof)\.?$/i.test(w),
    ) || "";
  const who = first ? ` with ${first}` : "";
  const zoomText = ((): { subtitle: string; hint?: string } => {
    switch (mode) {
      case "whatsapp":
        if (whatsappQr) return { subtitle: "Scan to add me on WhatsApp" };
        return whatsappNumber(card)
          ? { subtitle: `Scan to chat${who} on WhatsApp` }
          : { subtitle: "Scan to open my card", hint: "Add a WhatsApp or mobile number to the card for a WhatsApp QR." };
      case "linkedin":
        return linkedinUrl(card.linkedin)
          ? { subtitle: `Scan to connect${who} on LinkedIn` }
          : { subtitle: "Scan to open my card", hint: "Add your LinkedIn profile to the card for a LinkedIn QR." };
      case "save":
        return { subtitle: "Scan to save my contact" };
      case "email":
        return card.email
          ? { subtitle: "Scan to email me" }
          : { subtitle: "Scan to open my card", hint: "Add an email to the card for an email QR." };
      case "website":
        return card.website
          ? { subtitle: "Scan to visit my website" }
          : { subtitle: "Scan to open my card", hint: "Add a website to the card for a website QR." };
      default:
        return { subtitle: "Scan to open my digital card" };
    }
  })();
  const modeLabel = MODES.find((m) => m.key === mode)?.label ?? "";
  const zoomTitle = [card.fullName, modeLabel].filter(Boolean).join(" · ");

  useEffect(() => {
    let cancelled = false;
    qrDataUrl(payload, { dark, light, width: 320 }).then((url) => {
      if (!cancelled) setPng(url);
    });
    return () => {
      cancelled = true;
    };
  }, [payload, dark, light]);

  const closeZoom = useCallback(() => setZoom(false), []);

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
      <div className="relative flex flex-col items-center gap-3 rounded-lg border border-border bg-surface-2/40 p-4">
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label="Show QR full screen"
          title="Show full screen"
          className="border-border bg-surface text-primary hover:bg-primary/10 absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm transition"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        {png ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={png}
            alt="QR code"
            onClick={() => setZoom(true)}
            className="h-40 w-40 cursor-zoom-in rounded-lg bg-white p-2"
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

      <QrZoom
        open={zoom}
        onClose={closeZoom}
        payload={payload}
        title={zoomTitle}
        subtitle={zoomText.subtitle}
        hint={zoomText.hint}
        dark={dark}
        light={light}
        modes={MODES}
        mode={mode}
        onModeChange={(k) => setMode(k as QrMode)}
      />
    </div>
  );
}
