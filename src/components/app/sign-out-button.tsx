"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        // Clear the session without Auth.js building an absolute redirect (which
        // can resolve to the server's bind host, e.g. 0.0.0.0, in dev). Navigate
        // relative to whatever origin the user is actually on instead.
        await signOut({ redirect: false });
        window.location.href = "/";
      }}
    >
      <LogOut className="h-4 w-4" /> Sign out
    </Button>
  );
}
