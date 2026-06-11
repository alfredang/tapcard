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
import { Surface, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/utils";

export const metadata = { title: "Dashboard — Tapcard" };

export default async function DashboardPage() {
  const user = await requireUser();

  const [contacts, totalLeads, newLeads, wonDeals, lostDeals, cards, views, recentLeads] =
    await Promise.all([
      prisma.contact.count({ where: { userId: user.id } }),
      prisma.lead.count({ where: { userId: user.id } }),
      prisma.lead.count({ where: { userId: user.id, status: "NEW" } }),
      prisma.deal.count({ where: { userId: user.id, stage: "WON" } }),
      prisma.deal.count({ where: { userId: user.id, stage: "LOST" } }),
      prisma.card.findMany({ where: { userId: user.id }, select: { id: true } }),
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your cards and pipeline.
          </p>
        </div>
        <Button asChild>
          <Link href="/cards/new">
            <Plus className="h-4 w-4" /> New card
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <Surface key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </Surface>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Surface className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent leads</h2>
            <Link
              href="/crm/contacts"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No leads yet — share your card to start capturing them.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{lead.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[lead.company, lead.email].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      tone={lead.status === "NEW" ? "warning" : "default"}
                    >
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
        </Surface>

        <Surface className="p-5">
          <h2 className="mb-4 font-semibold">Quick actions</h2>
          <div className="space-y-2">
            <QuickLink href="/cards" icon={CreditCard} label="Manage cards" />
            <QuickLink href="/crm/pipeline" icon={Trophy} label="Sales pipeline" />
            <QuickLink href="/crm/contacts" icon={Users} label="Contacts" />
            <QuickLink href="/analytics" icon={Eye} label="Analytics" />
          </div>
        </Surface>
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
