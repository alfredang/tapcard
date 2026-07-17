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
  BarChart3,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Analytics — Tapcard" };

type Tone = "primary" | "default" | "success" | "warning" | "danger";

const META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; tone: Tone }
> = {
  VIEW: { label: "Card Views", icon: Eye, tone: "primary" },
  QR_SCAN: { label: "QR Scans", icon: QrCode, tone: "primary" },
  VCF_DOWNLOAD: { label: "Contact Downloads", icon: Download, tone: "success" },
  WHATSAPP_CLICK: { label: "WhatsApp Clicks", icon: MessageCircle, tone: "success" },
  EMAIL_CLICK: { label: "Email Clicks", icon: Mail, tone: "warning" },
  WEBSITE_CLICK: { label: "Website Clicks", icon: Globe, tone: "primary" },
  PHONE_CLICK: { label: "Phone Clicks", icon: Phone, tone: "warning" },
  SOCIAL_CLICK: { label: "Social Clicks", icon: Share2, tone: "default" },
  LEAD_SUBMIT: { label: "Leads Captured", icon: UserPlus, tone: "success" },
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

  const total = ORDER.reduce((sum, k) => sum + (counts[k] ?? 0), 0);
  const maxCount = Math.max(1, ...ORDER.map((k) => counts[k] ?? 0));

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Track how your cards perform across every channel."
      />

      {total === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No activity yet"
          description="Once you share a card and people start engaging, their views, scans and clicks will appear here."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {ORDER.map((key) => (
              <StatCard
                key={key}
                icon={META[key].icon}
                label={META[key].label}
                value={counts[key] ?? 0}
                tone={META[key].tone}
              />
            ))}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement breakdown</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {ORDER.map((key) => {
                  const value = counts[key] ?? 0;
                  return (
                    <div key={key}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">{META[key].label}</span>
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
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Per-card performance</CardTitle>
              </CardHeader>
              {cards.length === 0 ? (
                <EmptyState
                  icon={Eye}
                  title="No cards yet"
                  description="Create a card to see its performance here."
                  className="border-0 py-8"
                />
              ) : (
                <div className="divide-y divide-border">
                  {cards.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">/c/{c.slug}</p>
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
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
