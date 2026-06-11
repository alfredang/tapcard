import { Palette, Globe, Shield, User } from "lucide-react";
import { requireUser } from "@/lib/session";
import { Surface, Badge } from "@/components/ui/card";

export const metadata = { title: "Settings — Tapcard" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and workspace.
        </p>
      </div>

      <div className="space-y-5">
        <Surface className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Profile</h2>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{user.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
          </dl>
        </Surface>

        <Surface className="p-6">
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
        </Surface>

        <Surface className="p-6">
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Connected sign-in methods</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Email &amp; password and email OTP are enabled. Google, Microsoft and
            LinkedIn single sign-on activate automatically once their credentials
            are configured in your environment.
          </p>
        </Surface>
      </div>
    </div>
  );
}
