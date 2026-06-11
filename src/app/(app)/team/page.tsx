import { Building2 } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ComingSoon } from "@/components/app/coming-soon";

export const metadata = { title: "Team — Tapcard" };

export default async function TeamPage() {
  await requireUser();
  return (
    <ComingSoon
      title="Team Management"
      description="Roll out branded cards across your whole company."
      icon={Building2}
      features={[
        "Company directory",
        "Employee cards",
        "Department grouping",
        "Bulk card creation",
        "Team analytics",
        "Role-based access",
      ]}
    />
  );
}
