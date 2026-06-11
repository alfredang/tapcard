import { CheckSquare } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ComingSoon } from "@/components/app/coming-soon";

export const metadata = { title: "Tasks — Tapcard" };

export default async function TasksPage() {
  await requireUser();
  return (
    <ComingSoon
      title="Tasks"
      description="Follow-ups, reminders and meeting prep tied to your contacts."
      icon={CheckSquare}
      features={[
        "Follow-up & reminder tasks",
        "Due dates & status",
        "Linked to contacts",
        "Notifications",
      ]}
    />
  );
}
