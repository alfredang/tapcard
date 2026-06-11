"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

const PROVIDERS = [
  { id: "google", label: "Google" },
  { id: "microsoft-entra-id", label: "Microsoft" },
  { id: "linkedin", label: "LinkedIn" },
] as const;

export function OAuthButtons({
  oauth,
}: {
  oauth: { google: boolean; microsoft: boolean; linkedin: boolean };
}) {
  const enabled = PROVIDERS.filter((p) => {
    if (p.id === "google") return oauth.google;
    if (p.id === "microsoft-entra-id") return oauth.microsoft;
    return oauth.linkedin;
  });

  if (!enabled.length) return null;

  return (
    <div className="grid gap-2">
      {enabled.map((p) => (
        <Button
          key={p.id}
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => signIn(p.id, { redirectTo: "/dashboard" })}
        >
          Continue with {p.label}
        </Button>
      ))}
    </div>
  );
}
