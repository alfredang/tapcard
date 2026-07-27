"use client";

import { useState } from "react";
import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CHECKLIST = [
  "The 12-point event follow-up checklist",
  "Lead-capture scripts that do not feel pushy",
  "A 5-touch follow-up sequence you can copy",
];

/**
 * Email-capture lead magnet. Posts through the existing contact-form endpoint
 * with a tagged message so these submissions are distinguishable from sales
 * inquiries without needing a second table or endpoint.
 */
export function LeadMagnet() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Guide download",
          email: email.trim(),
          message:
            "[Lead magnet] Requested the networking follow-up playbook.",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong.");
      }
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  return (
    <section
      id="playbook"
      className="from-primary to-accent bg-gradient-to-br text-white"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-20">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The Networking Follow-Up Playbook
          </h2>
          <p className="mt-4 max-w-lg text-base text-white/90">
            Most leads go cold because nobody follows up. Get the free guide we
            use to turn a scanned card into a booked meeting.
          </p>
          <ul className="mt-6 space-y-2.5">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white/12 p-6 ring-1 ring-white/25 backdrop-blur-sm sm:p-8">
          {state === "done" ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10" aria-hidden="true" />
              <p className="mt-3 text-lg font-semibold">Check your inbox</p>
              <p className="mt-1 text-sm text-white/85">
                We sent the playbook to {email}.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="lm-name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="lm-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Avery"
                  autoComplete="name"
                  className="border-white/30 bg-white/95 text-zinc-900 placeholder:text-zinc-500"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="lm-email" className="text-sm font-medium">
                  Work email
                </label>
                <Input
                  id="lm-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="border-white/30 bg-white/95 text-zinc-900 placeholder:text-zinc-500"
                />
              </div>
              {error && (
                <p role="alert" className="text-sm font-medium text-white">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                variant="outline"
                disabled={state === "loading"}
                className="text-primary w-full border-transparent bg-white shadow-lg hover:bg-white/90 hover:text-primary"
              >
                {state === "loading" ? (
                  "Sending..."
                ) : (
                  <>
                    <Download className="h-4 w-4" /> Send me the playbook
                  </>
                )}
              </Button>
              <p className="text-xs text-white/75">
                Free, no card required. Unsubscribe any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
