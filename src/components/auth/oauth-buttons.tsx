"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { GoogleIcon, MicrosoftIcon, LinkedInIcon } from "@/components/icons/brand";

const PROVIDERS = [
  { id: "google", label: "Google", Icon: GoogleIcon },
  { id: "microsoft-entra-id", label: "Microsoft", Icon: MicrosoftIcon },
  { id: "linkedin", label: "LinkedIn", Icon: LinkedInIcon },
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
          <p.Icon className="h-4 w-4" /> Continue with {p.label}
        </Button>
      ))}
    </div>
  );
}
