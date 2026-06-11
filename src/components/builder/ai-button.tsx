"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export function AiButton({
  action,
  seed,
  onResult,
}: {
  action: "bio" | "about" | "company" | "pitch";
  seed: { fullName?: string; jobTitle?: string; company?: string };
  onResult: (text: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...seed }),
      });
      const data = await res.json();
      if (data.text) onResult(data.text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-1 text-xs font-medium text-primary transition hover:bg-primary/25 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      AI write
    </button>
  );
}
