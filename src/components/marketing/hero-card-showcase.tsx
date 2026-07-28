"use client";

import { useEffect, useState } from "react";
import { CardView } from "@/components/card/card-view";
import { THEME_LIST } from "@/lib/themes";
import { demoCard } from "@/lib/demo-card";

// A compact animated stand-in for a static demo card: the card gently pans
// (like someone scrolling it) while cycling through a handful of themes.
const CYCLE = ["MODERN", "OCEAN", "SUNSET", "MIDNIGHT", "FOREST", "LUXURY"];

export function HeroCardShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((v) => (v + 1) % CYCLE.length), 3000);
    return () => clearInterval(timer);
  }, []);

  const theme = THEME_LIST.find((t) => t.key === CYCLE[index])!;

  return (
    <div className="relative mx-auto w-full max-w-xs">
      <div className="animate-float">
        <div className="h-[430px] overflow-hidden rounded-[22px] shadow-2xl">
          <div className="hero-pan">
            <CardView
              card={{ ...demoCard, theme: theme.key, accentColor: theme.accent }}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-1.5">
          {CYCLE.map((key, i) => (
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
