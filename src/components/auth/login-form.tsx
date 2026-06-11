"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, KeyRound, Loader2 } from "lucide-react";
import { Surface } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

type Mode = "password" | "otp";

export function LoginForm({
  oauth,
}: {
  oauth: { google: boolean; microsoft: boolean; linkedin: boolean };
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [info, setInfo] = useState<string>();

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    const res = await signIn("password", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

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
      setError("Couldn't send a code. Check the email and try again.");
      return;
    }
    setOtpSent(true);
    setInfo("We sent a 6-digit code. (Dev mode: check the server console.)");
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
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sign in to manage your cards and leads.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1">
        <button
          onClick={() => setMode("password")}
          className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition ${
            mode === "password"
              ? "bg-background text-foreground shadow"
              : "text-muted-foreground"
          }`}
        >
          <KeyRound className="h-4 w-4" /> Password
        </button>
        <button
          onClick={() => setMode("otp")}
          className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition ${
            mode === "otp"
              ? "bg-background text-foreground shadow"
              : "text-muted-foreground"
          }`}
        >
          <Mail className="h-4 w-4" /> Email OTP
        </button>
      </div>

      {mode === "password" ? (
        <form onSubmit={handlePassword} className="mt-5 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <FieldError message={error} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      ) : (
        <form
          onSubmit={otpSent ? verifyOtp : requestOtp}
          className="mt-5 space-y-4"
        >
          <div>
            <Label htmlFor="otp-email">Email</Label>
            <Input
              id="otp-email"
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
            {otpSent ? "Verify & sign in" : "Send code"}
          </Button>
          {otpSent && (
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setCode("");
                setInfo(undefined);
              }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Use a different email
            </button>
          )}
        </form>
      )}

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
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one free
        </Link>
      </p>
    </Surface>
  );
}
