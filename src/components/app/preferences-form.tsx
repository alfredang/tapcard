"use client";

import { useState } from "react";
import { MessageCircle, UserPlus, IdCard, Smartphone } from "lucide-react";
import { COUNTRY_CODES } from "@/lib/countries";
import { toast } from "@/components/ui/toast";
import type { UserPrefs, QrModeKey } from "@/lib/user-prefs";

const QR_OPTIONS: {
  key: QrModeKey;
  label: string;
  hint: string;
  icon: typeof MessageCircle;
}[] = [
  {
    key: "WHATSAPP",
    label: "WhatsApp",
    hint: "Scanning opens a WhatsApp chat with you",
    icon: MessageCircle,
  },
  {
    key: "LINKEDIN",
    label: "LinkedIn",
    hint: "Scanning opens your LinkedIn profile",
    icon: UserPlus,
  },
  {
    key: "CARD",
    label: "Card link",
    hint: "Scanning opens your digital card",
    icon: IdCard,
  },
];

/// Account preferences, saved on change. The same values are edited in the
/// iOS app's Settings tab — whichever you touch last wins.
export function PreferencesForm({ initial }: { initial: UserPrefs }) {
  const [prefs, setPrefs] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function save(patch: Partial<UserPrefs>) {
    const previous = prefs;
    setPrefs({ ...prefs, ...patch });
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Couldn't save");
      setPrefs(json.settings);
      toast.success("Saved — synced to your app");
    } catch (e) {
      setPrefs(previous);
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  const known = COUNTRY_CODES.some((c) => c.code === prefs.countryCode);

  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="countryCode"
          className="mb-1.5 block text-sm font-medium"
        >
          Default country code
        </label>
        <select
          id="countryCode"
          value={prefs.countryCode}
          disabled={saving}
          onChange={(e) => save({ countryCode: e.target.value })}
          className="border-border bg-background w-full rounded-md border px-3 py-2 text-sm sm:max-w-sm"
        >
          {!known && (
            <option value={prefs.countryCode}>+{prefs.countryCode}</option>
          )}
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name} (+{c.code})
            </option>
          ))}
        </select>
        <p className="text-muted-foreground mt-1.5 text-xs">
          Added to numbers on your card that don&apos;t start with +, so
          WhatsApp and phone links work for anyone who scans your QR.
        </p>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">Your QR code opens</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {QR_OPTIONS.map((o) => {
            const active = prefs.qrMode === o.key;
            return (
              <button
                key={o.key}
                type="button"
                disabled={saving}
                onClick={() => !active && save({ qrMode: o.key })}
                className={`flex items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition ${
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <o.icon className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <span className="text-foreground block font-medium">
                    {o.label}
                  </span>
                  <span className="text-xs">{o.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Smartphone className="h-3.5 w-3.5" /> Also in the Tapcard iOS app under
        Settings — changes sync both ways.
      </p>
    </div>
  );
}
