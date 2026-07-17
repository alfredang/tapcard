import { redirect } from "next/navigation";

// Tasks + Bookings were merged into a single Planner page.
export default function AppointmentsPage() {
  redirect("/planner");
}
