import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { Sidebar } from "@/components/app/sidebar";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";

// Mobile-first: on iPhone, Safari shows its native "Open in the Tapcard app"
// banner, since the app is the primary place to manage a card.
export const metadata: Metadata = {
  itunes: { appId: "6780261599" },
};

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
        {/* Bottom padding clears the fixed tab bar (and the home indicator) on phones. */}
        <div className="mx-auto max-w-6xl px-4 pt-5 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 lg:py-8">
          {children}
        </div>
      </div>
      <MobileTabBar />
    </div>
  );
}
