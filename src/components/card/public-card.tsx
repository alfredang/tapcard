"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserPlus, Loader2, CheckCircle2, Share2 } from "lucide-react";
import { CardView } from "@/components/card/card-view";
import { getTheme } from "@/lib/themes";
import { appUrl } from "@/lib/utils";
import { WHATSAPP_PRESETS, whatsappLink } from "@/lib/whatsapp";
import type { CardData } from "@/lib/card";

export function PublicCard({ card }: { card: CardData }) {
  const slug = card.slug!;
  const t = getTheme(card.theme);
  const accent = card.accentColor || t.accent;
  const search = useSearchParams();
  const [showLead, setShowLead] = useState(false);

  // Fire analytics on mount: a view, plus a QR scan when arriving via ?src=qr.
  useEffect(() => {
    track(slug, "VIEW");
    if (search.get("src") === "qr") track(slug, "QR_SCAN");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTrack = (type: string, meta?: Record<string, string>) =>
    track(slug, type, meta);

  const shareUrl = appUrl(`/c/${slug}`);
  const waShare = whatsappLink(card.whatsapp, "") || "";

  async function share() {
    if (navigator.share) {
      await navigator
        .share({ title: card.fullName, url: shareUrl })
        .catch(() => {});
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center px-4 py-8"
      style={{ background: t.pageBg }}
    >
      <div className="w-full max-w-sm space-y-4">
        <CardView card={card} vcfHref={appUrl(`/api/c/${slug}/vcf`)} onTrack={onTrack} />

        {/* Lead capture */}
        {showLead ? (
          <LeadForm slug={slug} accent={accent} theme={t} onClose={() => setShowLead(false)} />
        ) : (
          <button
            onClick={() => setShowLead(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg"
            style={{ background: accent, color: "#fff" }}
          >
            <UserPlus className="h-4 w-4" /> Exchange details
          </button>
        )}

        <div className="flex gap-2">
          <button
            onClick={share}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
            style={{
              background: t.chipBg,
              color: t.text,
              border: `1px solid ${t.cardBorder}`,
            }}
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
          {waShare && (
            <a
              href={whatsappLink(card.whatsapp, WHATSAPP_PRESETS.share(shareUrl, card.fullName))}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
              style={{
                background: t.chipBg,
                color: t.text,
                border: `1px solid ${t.cardBorder}`,
              }}
            >
              Send via WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function track(slug: string, type: string, meta?: Record<string, string>) {
  const payload = JSON.stringify({ slug, type, meta });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics",
        new Blob([payload], { type: "application/json" }),
      );
      return;
    }
  } catch {}
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

function LeadForm({
  slug,
  accent,
  theme,
  onClose,
}: {
  slug: string;
  accent: string;
  theme: ReturnType<typeof getTheme>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, ...form }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Couldn't send. Please try again.");
      return;
    }
    setDone(true);
  }

  const inputStyle: React.CSSProperties = {
    background: theme.cardBg,
    color: theme.text,
    border: `1px solid ${theme.cardBorder}`,
  };

  if (done) {
    return (
      <div
        className="flex flex-col items-center gap-2 rounded-xl p-6 text-center"
        style={{ background: theme.cardBg, color: theme.text, border: `1px solid ${theme.cardBorder}` }}
      >
        <CheckCircle2 className="h-10 w-10" style={{ color: accent }} />
        <p className="font-semibold">Thanks — your details were sent!</p>
        <p className="text-sm" style={{ color: theme.subtext }}>
          You&apos;ll hear back soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-2.5 rounded-xl p-4"
      style={{ background: theme.cardBg, color: theme.text, border: `1px solid ${theme.cardBorder}` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Leave your details</p>
        <button
          type="button"
          onClick={onClose}
          className="text-xs"
          style={{ color: theme.subtext }}
        >
          Cancel
        </button>
      </div>
      <input
        required
        placeholder="Your name"
        value={form.name}
        onChange={update("name")}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={inputStyle}
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={update("email")}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={inputStyle}
      />
      <input
        placeholder="Phone"
        value={form.phone}
        onChange={update("phone")}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={inputStyle}
      />
      <input
        placeholder="Company"
        value={form.company}
        onChange={update("company")}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={inputStyle}
      />
      <textarea
        placeholder="Message (optional)"
        value={form.message}
        onChange={update("message")}
        rows={2}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={inputStyle}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        style={{ background: accent, color: "#fff" }}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Send my details
      </button>
    </form>
  );
}
