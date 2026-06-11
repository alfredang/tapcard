import { CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ComingSoon } from "@/components/app/coming-soon";

export const metadata = { title: "Bookings — Tapcard" };

export default async function AppointmentsPage() {
  await requireUser();
  return (
    <ComingSoon
      title="Appointment Booking"
      description="Let visitors book meetings straight from your card."
      icon={CalendarDays}
      features={[
        "Calendar booking",
        "Available slots",
        "Google Calendar sync",
        "Microsoft Calendar sync",
      ]}
    />
  );
}
