import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardView } from "@/components/card/card-view";
import { THEME_LIST } from "@/lib/themes";
import { demoCard } from "@/lib/demo-card";

export const metadata: Metadata = {
  title: "Card themes — Tapcard",
  description:
    "Browse all Tapcard card themes — 20 designs from boardroom Corporate to vivid Sunset, each with its own palette, banner and button style.",
};

/**
 * The full theme gallery. The home page features three; this page shows every
 * design rendered on the same sample card so they're easy to compare.
 */
export default function ThemesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Templates
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
          All {THEME_LIST.length} themes
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Every theme restyles your whole card — banner, buttons, accents and
          background. Switch any time; your details stay put.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {THEME_LIST.map((theme) => (
          <div key={theme.key} className="flex flex-col items-center gap-3">
            <CardView
              card={{ ...demoCard, theme: theme.key, accentColor: theme.accent }}
            />
            <span className="text-sm font-medium text-muted-foreground">
              {theme.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-14 flex justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/#templates">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </Button>
        <Button asChild>
          <Link href="/register">Create free card</Link>
        </Button>
      </div>
    </section>
  );
}
