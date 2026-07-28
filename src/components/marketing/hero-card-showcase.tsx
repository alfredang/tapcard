"use client";

import { useEffect, useState } from "react";
import { QrCode, Users, BarChart3 } from "lucide-react";
import { CardView } from "@/components/card/card-view";
import { THEME_LIST } from "@/lib/themes";
import { demoPersonas } from "@/lib/demo-card";
import { qrDataUrl } from "@/lib/qr";

// The hero is a mini product tour: three themed cards, then the three key
// features — share by QR, lead capture, and analytics.
type Step =
  | { kind: "card"; theme: string }
  | { kind: "qr" }
  | { kind: "leads" }
  | { kind: "analytics" };

const STEPS: Step[] = [
  { kind: "card", theme: "MODERN" },
  { kind: "qr" },
  { kind: "card", theme: "OCEAN" },
  { kind: "leads" },
  { kind: "card", theme: "LUXURY" },
  { kind: "analytics" },
];

const FRAME = "h-[430px] rounded-[22px] shadow-2xl";

export function HeroCardShowcase() {
  const [index, setIndex] = useState(0);
  const [qr, setQr] = useState<string>();

  useEffect(() => {
    const timer = setInterval(() => setIndex((v) => (v + 1) % STEPS.length), 3200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    qrDataUrl("https://tapcard.tertiaryinfotech.com/c/jordan-avery?src=qr", {
      dark: "#19112d",
      width: 480,
    }).then(setQr);
  }, []);

  const step = STEPS[index];
  const person = demoPersonas[index % demoPersonas.length];

  return (
    <div className="relative mx-auto w-full max-w-xs">
      <div className="animate-float">
        {step.kind === "card" && (
          <div className={`${FRAME} overflow-hidden`}>
            <div className="hero-pan">
              <CardView
                card={{
                  ...person,
                  theme: step.theme,
                  accentColor: THEME_LIST.find((t) => t.key === step.theme)!.accent,
                }}
              />
            </div>
          </div>
        )}

        {step.kind === "qr" && (
          <div className={`${FRAME} gradient-primary flex flex-col items-center justify-center gap-4 p-8`}>
            <FeatureChip icon={<QrCode className="h-3.5 w-3.5" />} label="Share by QR" light />
            <div className="rounded-2xl bg-white p-4 shadow-xl">
              {qr && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr} alt="QR code for the demo card" className="h-44 w-44" />
              )}
            </div>
            <p className="text-lg font-bold text-white">Jordan Avery</p>
            <p className="text-center text-sm text-white/85">
              Get scanned once — they have everything.
            </p>
          </div>
        )}

        {step.kind === "leads" && (
          <div className={`${FRAME} flex flex-col gap-3 border border-border bg-surface p-6`}>
            <FeatureChip icon={<Users className="h-3.5 w-3.5" />} label="Capture leads" />
            <p className="text-lg font-bold">Leads inbox</p>
            {[
              ["Sophie Tan", "Better Connected", "2m ago"],
              ["Marcus Lee", "Skyline Realty", "1h ago"],
              ["Priya Sharma", "Lumen Wealth", "3h ago"],
              ["Daniel Wong", "Studio North", "Yesterday"],
            ].map(([name, co, when]) => (
              <div key={name} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
                <span className="gradient-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                  {name.split(" ").map((w) => w[0]).join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{co}</span>
                </span>
                <span className="text-[11px] text-muted-foreground">{when}</span>
              </div>
            ))}
            <p className="mt-auto text-center text-xs text-muted-foreground">
              Visitors leave their details right on your card.
            </p>
          </div>
        )}

        {step.kind === "analytics" && (
          <div className={`${FRAME} flex flex-col gap-4 border border-border bg-surface p-6`}>
            <FeatureChip icon={<BarChart3 className="h-3.5 w-3.5" />} label="Analytics" />
            <p className="text-lg font-bold">This month</p>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Card views" value="1,284" delta="+18%" />
              <Stat label="Saves" value="312" delta="+9%" />
              <Stat label="QR scans" value="486" delta="+24%" />
              <Stat label="New leads" value="57" delta="+31%" />
            </div>
            <div className="mt-1 flex flex-1 items-end gap-2">
              {[38, 52, 44, 66, 58, 82, 74].map((h, i) => (
                <div
                  key={i}
                  className="gradient-primary flex-1 rounded-t-md opacity-90"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Views, taps and leads — per card, in real time.
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-center gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureChip({
  icon,
  label,
  light,
}: {
  icon: React.ReactNode;
  label: string;
  light?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-semibold ${
        light ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
      }`}
    >
      {icon} {label}
    </span>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs font-medium text-success">{delta}</p>
    </div>
  );
}
