import Link from "next/link";
import {
  Users,
  UserPlus,
  Trophy,
  XCircle,
  Eye,
  CreditCard,
  ArrowRight,
  Plus,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Card, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { relativeTime } from "@/lib/utils";

export const metadata = { title: "Dashboard — Tapcard" };

export default async function DashboardPage() {
  const user = await requireUser();

  const [contacts, totalLeads, newLeads, wonDeals, lostDeals, views, recentLeads] =
    await Promise.all([
      prisma.contact.count({ where: { userId: user.id } }),
      prisma.lead.count({ where: { userId: user.id } }),
      prisma.lead.count({ where: { userId: user.id, status: "NEW" } }),
      prisma.deal.count({ where: { userId: user.id, stage: "WON" } }),
      prisma.deal.count({ where: { userId: user.id, stage: "LOST" } }),
      prisma.analyticsEvent.count({
        where: { card: { userId: user.id }, type: "VIEW" },
      }),
      prisma.lead.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

  const stats = [
    { label: "Total Contacts", value: contacts, icon: Users, tone: "primary" },
    { label: "Total Leads", value: totalLeads, icon: UserPlus, tone: "default" },
    { label: "New Leads", value: newLeads, icon: UserPlus, tone: "warning" },
    { label: "Won Deals", value: wonDeals, icon: Trophy, tone: "success" },
    { label: "Lost Deals", value: lostDeals, icon: XCircle, tone: "danger" },
    { label: "Card Views", value: views, icon: Eye, tone: "primary" },
  ] as const;

  return (
    <div>
      <PageHeader
        title={<>Welcome back{user.name ? `, ${user.name}` : ""} 👋</>}
        description="Here's what's happening across your cards and pipeline."
      >
        <Button asChild>
          <Link href="/cards/new">
            <Plus className="h-4 w-4" /> New card
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} tone={s.tone} />
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent leads</CardTitle>
            <Link
              href="/crm/contacts"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          {recentLeads.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No leads yet"
              description="Share your card to start capturing leads automatically."
              className="border-0 py-8"
              action={
                <Button asChild size="sm" variant="secondary">
                  <Link href="/cards">Share your card</Link>
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{lead.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[lead.company, lead.email].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={lead.status === "NEW" ? "warning" : "default"}>
                      {lead.status}
                    </Badge>
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {relativeTime(lead.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            <QuickLink href="/cards" icon={CreditCard} label="Manage cards" />
            <QuickLink href="/crm/pipeline" icon={Trophy} label="Sales pipeline" />
            <QuickLink href="/crm/contacts" icon={Users} label="Contacts" />
            <QuickLink href="/analytics" icon={Eye} label="Analytics" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm transition hover:border-primary/40 hover:bg-surface-2"
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" /> {label}
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
