"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Surface } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

// ─────────────────────────────────────────────────────────────────────────────
// The single auth surface. Two ways in — social sign-on, or a one-time code
// emailed to the user. There is no password.
//
// Sign-in and sign-up are the same flow: verifying a code for an unknown email
// creates the account (see the `otp` provider in src/auth.ts). `mode` therefore
// only changes the wording, so the marketing "Create free card" CTAs can keep
// pointing at /register and land somewhere that reads correctly.
// ─────────────────────────────────────────────────────────────────────────────

type Mode = "login" | "register";

const COPY = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to manage your cards and leads.",
    footer: "New to Tapcard?",
    footerLink: "Create your free card",
    footerHref: "/register",
  },
  register: {
    title: "Create your free card",
    subtitle: "Publish a professional digital business card in under 2 minutes.",
    footer: "Already have an account?",
    footerLink: "Sign in",
    footerHref: "/login",
  },
} as const;

export function AuthForm({
  mode = "login",
  oauth,
}: {
  mode?: Mode;
  oauth: { google: boolean; microsoft: boolean; linkedin: boolean };
}) {
  const router = useRouter();
  const copy = COPY[mode];

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [info, setInfo] = useState<string>();

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setInfo(undefined);
    setLoading(true);
    const res = await fetch("/api/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      // 429 means the throttle in /api/otp tripped — say so rather than blaming
      // the address, otherwise the user just retries and digs in deeper.
      setError(
        res.status === 429
          ? "Too many codes requested. Wait a few minutes and try again."
          : "Couldn't send a code. Check the email and try again.",
      );
      return;
    }
    setOtpSent(true);
    setInfo("We sent a 6-digit code to your email.");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    const res = await signIn("otp", { email, code, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("That code is invalid or expired.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  const hasOAuth = oauth.google || oauth.microsoft || oauth.linkedin;

  return (
    <Surface className="glass p-7 shadow-2xl">
      <h1 className="text-2xl font-bold">{copy.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>

      <form onSubmit={otpSent ? verifyOtp : requestOtp} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            disabled={otpSent}
            required
          />
        </div>

        {otpSent && (
          <div>
            <Label htmlFor="code">6-digit code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="tracking-[0.4em]"
              required
            />
          </div>
        )}

        {info && <p className="text-xs text-success">{info}</p>}
        <FieldError message={error} />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {otpSent ? "Verify & continue" : "Email OTP code"}
        </Button>

        {otpSent && (
          <button
            type="button"
            onClick={() => {
              setOtpSent(false);
              setCode("");
              setInfo(undefined);
              setError(undefined);
            }}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Use a different email
          </button>
        )}
      </form>

      {hasOAuth && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or continue with
            <span className="h-px flex-1 bg-border" />
          </div>
          <OAuthButtons oauth={oauth} />
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {copy.footer}{" "}
        <Link href={copy.footerHref} className="font-medium text-primary hover:underline">
          {copy.footerLink}
        </Link>
      </p>
    </Surface>
  );
}
