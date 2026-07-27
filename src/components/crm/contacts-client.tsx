"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building2,
  UserCheck,
  Inbox,
  Sparkles,
  Loader2,
  Users,
} from "lucide-react";
import { Surface, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { relativeTime } from "@/lib/utils";
import { initials } from "@/lib/avatar";

/** Contact avatar with a coloured initials fallback when no image is set. */
function ContactAvatar({ name, src }: { name: string; src?: string | null }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        loading="lazy"
        className="border-border h-10 w-10 shrink-0 rounded-full border object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
    >
      {initials(name)}
    </span>
  );
}

export interface ContactRow {
  id: string;
  name: string;
  company: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  notes: string | null;
  tags: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface LeadRow {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

const EMPTY: Partial<ContactRow> = { name: "" };

function parseTags(tags: string | null): string[] {
  return (tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function ContactsClient({
  initialContacts,
  initialLeads,
}: {
  initialContacts: ContactRow[];
  initialLeads: LeadRow[];
}) {
  const [tab, setTab] = useState<"contacts" | "leads">("contacts");
  const [contacts, setContacts] = useState(initialContacts);
  const [leads, setLeads] = useState(initialLeads);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<ContactRow>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [insights, setInsights] = useState<
    Record<string, { score: number; rating: string; summary: string; suggestedFollowUp: string }>
  >({});
  const [scoring, setScoring] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<{ kind: "contact" | "lead"; id: string } | null>(null);

  async function scoreLead(id: string) {
    setScoring(id);
    try {
      const res = await fetch("/api/ai/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: id }),
      });
      if (res.ok) {
        const { insight } = await res.json();
        setInsights((m) => ({ ...m, [id]: insight }));
      } else {
        toast.error("Couldn't score this lead. Try again.");
      }
    } catch {
      toast.error("Couldn't score this lead. Try again.");
    } finally {
      setScoring(null);
    }
  }

  const filtered = contacts.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  function openNew() {
    setEditing(EMPTY);
    setModalOpen(true);
  }
  function openEdit(c: ContactRow) {
    setEditing(c);
    setModalOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const isEdit = Boolean(editing.id);
    try {
      const res = await fetch(isEdit ? `/api/contacts/${editing.id}` : "/api/contacts", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) {
        toast.error("Couldn't save contact. Please try again.");
        return;
      }
      const { contact } = await res.json();
      setContacts((list) =>
        isEdit ? list.map((c) => (c.id === contact.id ? contact : c)) : [contact, ...list],
      );
      setModalOpen(false);
      toast.success(isEdit ? "Contact updated" : "Contact added");
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    if (!confirmDel) return;
    const { kind, id } = confirmDel;
    setConfirmDel(null);
    if (kind === "contact") {
      setContacts((list) => list.filter((c) => c.id !== id));
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      res.ok ? toast.success("Contact deleted") : toast.error("Couldn't delete contact");
    } else {
      setLeads((list) => list.filter((l) => l.id !== id));
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      res.ok ? toast.success("Lead deleted") : toast.error("Couldn't delete lead");
    }
  }

  async function convertLead(id: string) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ convert: true }),
    });
    if (!res.ok) {
      toast.error("Couldn't convert this lead.");
      return;
    }
    const { contact } = await res.json();
    setContacts((list) => [contact, ...list]);
    setLeads((list) => list.map((l) => (l.id === id ? { ...l, status: "CONVERTED" } : l)));
    toast.success(`${contact.name} added to contacts`);
  }

  function field(key: keyof ContactRow) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setEditing((c) => ({ ...c, [key]: e.target.value }));
  }

  const openLeads = leads.filter((l) => l.status !== "CONVERTED").length;

  return (
    <div>
      <PageHeader title="Contacts & Leads" description="Manage your relationships and captured leads.">
        <Button variant="outline" size="sm" asChild>
          <a href="/api/contacts/export">
            <Download className="h-4 w-4" /> Export CSV
          </a>
        </Button>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" /> Add contact
        </Button>
      </PageHeader>

      <div className="mb-4 flex items-center gap-2 rounded-lg bg-surface-2 p-1">
        <TabBtn active={tab === "contacts"} onClick={() => setTab("contacts")}>
          <UserCheck className="h-4 w-4" /> Contacts ({contacts.length})
        </TabBtn>
        <TabBtn active={tab === "leads"} onClick={() => setTab("leads")}>
          <Inbox className="h-4 w-4" /> Leads ({openLeads})
        </TabBtn>
      </div>

      {tab === "contacts" ? (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, company or email…"
              className="pl-9"
            />
          </div>

          {contacts.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No contacts yet"
              description="Add contacts manually, or they'll appear here as you convert captured leads."
              action={
                <Button onClick={openNew}>
                  <Plus className="h-4 w-4" /> Add your first contact
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <Surface className="p-10 text-center text-sm text-muted-foreground">
              No contacts match “{query}”.
            </Surface>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => {
                const tags = parseTags(c.tags);
                return (
                  <Surface key={c.id} className="flex flex-col p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <ContactAvatar name={c.name} src={c.avatarUrl} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{c.name}</p>
                          {(c.position || c.company) && (
                            <p className="truncate text-xs text-muted-foreground">
                              {[c.position, c.company].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                          aria-label="Edit contact"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDel({ kind: "contact", id: c.id })}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                          aria-label="Delete contact"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1.5 text-xs">
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                        >
                          <Mail className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{c.email}</span>
                        </a>
                      )}
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0" /> {c.phone}
                        </a>
                      )}
                      {c.company && (
                        <p className="flex items-center gap-1.5 text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5 shrink-0" /> {c.company}
                        </p>
                      )}
                    </div>
                    {tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tags.map((t) => (
                          <Badge key={t} tone="primary">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Surface>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          {leads.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No leads yet"
              description="When someone fills in the contact form on your shared card, they'll show up here."
            />
          ) : (
            leads.map((l) => {
              const insight = insights[l.id];
              return (
                <Surface key={l.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{l.name}</p>
                        <Badge tone={l.status === "CONVERTED" ? "success" : "warning"}>{l.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {[l.company, l.email, l.phone].filter(Boolean).join(" · ")}
                      </p>
                      {l.message && (
                        <p className="mt-1 text-sm text-muted-foreground">“{l.message}”</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{relativeTime(l.createdAt)}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => scoreLead(l.id)} disabled={scoring === l.id}>
                        {scoring === l.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        AI score
                      </Button>
                      {l.status !== "CONVERTED" && (
                        <Button size="sm" variant="outline" onClick={() => convertLead(l.id)}>
                          <UserCheck className="h-4 w-4" /> Convert
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDel({ kind: "lead", id: l.id })} aria-label="Delete lead">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {insight && (
                    <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          tone={insight.rating === "Hot" ? "danger" : insight.rating === "Warm" ? "warning" : "default"}
                        >
                          {insight.rating} · {insight.score}/100
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm">{insight.summary}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Next step:</span> {insight.suggestedFollowUp}
                      </p>
                    </div>
                  )}
                </Surface>
              );
            })
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing.id ? "Edit contact" : "Add contact"}>
        <form onSubmit={save} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input value={editing.name ?? ""} onChange={field("name")} required />
            </div>
            <div>
              <Label>Company</Label>
              <Input value={editing.company ?? ""} onChange={field("company")} />
            </div>
            <div>
              <Label>Position</Label>
              <Input value={editing.position ?? ""} onChange={field("position")} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={editing.email ?? ""} onChange={field("email")} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={editing.phone ?? ""} onChange={field("phone")} />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input value={editing.whatsapp ?? ""} onChange={field("whatsapp")} />
            </div>
          </div>
          <div>
            <Label>Tags</Label>
            <Input value={editing.tags ?? ""} onChange={field("tags")} placeholder="vip, event, referral" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={editing.notes ?? ""} onChange={field("notes")} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save contact
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDel !== null}
        title={confirmDel?.kind === "lead" ? "Delete lead?" : "Delete contact?"}
        message="This can't be undone."
        onConfirm={doDelete}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition ${
        active ? "bg-background text-foreground shadow" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
