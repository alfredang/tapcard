"use client";

import { useEffect, useState } from "react";
import { CardView } from "@/components/card/card-view";
import { THEME_LIST } from "@/lib/themes";
import { demoPersonas } from "@/lib/demo-card";
import { qrDataUrl } from "@/lib/qr";

// A compact animated stand-in for a static demo card: the card gently pans
// (like someone scrolling it) while cycling through themes, then ends the
// loop on the share-by-QR frame.
const STEPS = ["MODERN", "OCEAN", "SUNSET", "MIDNIGHT", "FOREST", "LUXURY", "QR"];

export function HeroCardShowcase() {
  const [index, setIndex] = useState(0);
  const [qr, setQr] = useState<string>();

  useEffect(() => {
    const timer = setInterval(() => setIndex((v) => (v + 1) % STEPS.length), 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    qrDataUrl("https://tapcard.tertiaryinfotech.com/c/jordan-avery?src=qr", {
      dark: "#19112d",
      width: 480,
    }).then(setQr);
  }, []);

  const step = STEPS[index];
  const isQR = step === "QR";
  const theme = THEME_LIST.find((t) => t.key === (isQR ? "MODERN" : step))!;
  const person = demoPersonas[index % demoPersonas.length];

  return (
    <div className="relative mx-auto w-full max-w-xs">
      <div className="animate-float">
        {isQR ? (
          <div className="gradient-primary flex h-[430px] flex-col items-center justify-center gap-4 rounded-[22px] p-8 shadow-2xl">
            <div className="rounded-2xl bg-white p-4 shadow-xl">
              {qr && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr} alt="QR code for the demo card" className="h-48 w-48" />
              )}
            </div>
            <p className="text-lg font-bold text-white">Jordan Avery</p>
            <p className="text-center text-sm text-white/85">
              Scan to connect — share your card in one tap
            </p>
          </div>
        ) : (
          <div className="h-[430px] overflow-hidden rounded-[22px] shadow-2xl">
            <div className="hero-pan">
              <CardView
                card={{ ...person, theme: theme.key, accentColor: theme.accent }}
              />
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-center gap-1.5">
          {STEPS.map((key, i) => (
            <span
              key={key}
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
