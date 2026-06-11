import {
  Eye,
  QrCode,
  Download,
  MessageCircle,
  Mail,
  Globe,
  Phone,
  Share2,
  UserPlus,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Surface } from "@/components/ui/card";

export const metadata = { title: "Analytics — Tapcard" };

const META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  VIEW: { label: "Card Views", icon: Eye },
  QR_SCAN: { label: "QR Scans", icon: QrCode },
  VCF_DOWNLOAD: { label: "Contact Downloads", icon: Download },
  WHATSAPP_CLICK: { label: "WhatsApp Clicks", icon: MessageCircle },
  EMAIL_CLICK: { label: "Email Clicks", icon: Mail },
  WEBSITE_CLICK: { label: "Website Clicks", icon: Globe },
  PHONE_CLICK: { label: "Phone Clicks", icon: Phone },
  SOCIAL_CLICK: { label: "Social Clicks", icon: Share2 },
  LEAD_SUBMIT: { label: "Leads Captured", icon: UserPlus },
};

const ORDER = Object.keys(META);

export default async function AnalyticsPage() {
  const user = await requireUser();

  const grouped = await prisma.analyticsEvent.groupBy({
    by: ["type"],
    where: { card: { userId: user.id } },
    _count: { _all: true },
  });
  const counts: Record<string, number> = {};
  for (const g of grouped) counts[g.type] = g._count._all;

  const cards = await prisma.card.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      fullName: true,
      slug: true,
      published: true,
      _count: { select: { events: true, leads: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const maxCount = Math.max(1, ...ORDER.map((k) => counts[k] ?? 0));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track how your cards perform across every channel.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {ORDER.map((key) => {
          const m = META[key];
          return (
            <Surface key={key} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{m.label}</span>
                <m.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-3xl font-bold">{counts[key] ?? 0}</p>
            </Surface>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Surface className="p-5">
          <h2 className="mb-4 font-semibold">Engagement breakdown</h2>
          <div className="space-y-3">
            {ORDER.map((key) => {
              const value = counts[key] ?? 0;
              return (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {META[key].label}
                    </span>
                    <span className="font-medium">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="gradient-primary h-full transition-all"
                      style={{ width: `${(value / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Surface>

        <Surface className="p-5">
          <h2 className="mb-4 font-semibold">Per-card performance</h2>
          {cards.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No cards yet.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {cards.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      /c/{c.slug}
                    </p>
                  </div>
                  <div className="flex gap-4 text-right text-xs">
                    <div>
                      <p className="font-semibold">{c._count.events}</p>
                      <p className="text-muted-foreground">events</p>
                    </div>
                    <div>
                      <p className="font-semibold">{c._count.leads}</p>
                      <p className="text-muted-foreground">leads</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Surface>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Time-series charts and team analytics are coming in a later phase.
      </p>
    </div>
  );
}
