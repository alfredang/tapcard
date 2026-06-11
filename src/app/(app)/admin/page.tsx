import { ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ComingSoon } from "@/components/app/coming-soon";

export const metadata = { title: "Admin — Tapcard" };

// Scaffold: platform admin. Gate behind a proper role check before exposing.
export default async function AdminPage() {
  await requireUser();
  return (
    <ComingSoon
      title="Admin Dashboard"
      description="Platform-wide controls for owners and administrators."
      icon={ShieldCheck}
      features={[
        "User & org management",
        "Plan & billing controls",
        "Global analytics",
        "Audit log",
        "Feature flags",
        "Role-based access",
      ]}
    />
  );
}
