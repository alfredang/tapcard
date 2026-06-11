import { requireUser } from "@/lib/session";
import { Sidebar } from "@/components/app/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <Sidebar user={{ name: user.name, email: user.email }} />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
