import Link from "next/link";
import { Palette, Globe, Shield, User, SlidersHorizontal } from "lucide-react";
import { requireUser } from "@/lib/session";
import { Card, Badge } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { SignOutButton } from "@/components/app/sign-out-button";
import { initials } from "@/lib/utils";
import { PreferencesForm } from "@/components/app/preferences-form";
import { getUserPrefs } from "@/lib/user-prefs";

export const metadata = { title: "Settings — Tapcard" };

export default async function SettingsPage() {
  const user = await requireUser();
  const prefs = await getUserPrefs(user.id!);

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and workspace." />

      <div className="space-y-5">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Profile</h2>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="gradient-primary flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white">
                {initials(user.name || user.email)}
              </div>
              <div>
                <p className="font-semibold">{user.name || "Account"}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Sharing preferences</h2>
          </div>
          <PreferencesForm initial={prefs} />
        </Card>

        <Card className="p-6">
          <div className="mb-2 flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Card design</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Pick from 20 designs and an accent colour in the card editor here, or
            in the app under Settings → Card design. Both edit the same card.
          </p>
          <Link href="/cards" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            Open my cards →
          </Link>
        </Card>

        <Card className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">White-label branding</h2>
            </div>
            <Badge tone="primary">Enterprise</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Custom logo, brand colors and a custom domain
            (e.g. <code className="text-foreground">card.company.com/john-smith</code>)
            for your organization. Available on the Enterprise plan.
          </p>
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
            {[
              { icon: Palette, label: "Custom logo & colors" },
              { icon: Globe, label: "Custom domain" },
              { icon: Shield, label: "SSO & admin controls" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 rounded-md border border-border bg-surface-2/40 px-3 py-2 text-muted-foreground"
              >
                <f.icon className="h-4 w-4" /> {f.label}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Sign-in methods</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in with a password, a one-time code emailed to you, or Google.
            Accounts created with a code or with Google have no password until
            you set one.
          </p>
        </Card>
      </div>
    </div>
  );
}
