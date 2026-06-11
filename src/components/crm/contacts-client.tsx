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
} from "lucide-react";
import { Surface, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { relativeTime } from "@/lib/utils";

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
      }
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
    const res = await fetch(
      isEdit ? `/api/contacts/${editing.id}` : "/api/contacts",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      },
    );
    setSaving(false);
    if (!res.ok) return;
    const { contact } = await res.json();
    setContacts((list) =>
      isEdit
        ? list.map((c) => (c.id === contact.id ? contact : c))
        : [contact, ...list],
    );
    setModalOpen(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this contact?")) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    setContacts((list) => list.filter((c) => c.id !== id));
  }

  async function convertLead(id: string) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ convert: true }),
    });
    if (!res.ok) return;
    const { contact } = await res.json();
    setContacts((list) => [contact, ...list]);
    setLeads((list) =>
      list.map((l) => (l.id === id ? { ...l, status: "CONVERTED" } : l)),
    );
  }

  async function deleteLead(id: string) {
    if (!confirm("Delete this lead?")) return;
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    setLeads((list) => list.filter((l) => l.id !== id));
  }

  function field(key: keyof ContactRow) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setEditing((c) => ({ ...c, [key]: e.target.value }));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Contacts & Leads</h1>
          <p className="text-sm text-muted-foreground">
            Manage your relationships and captured leads.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/api/contacts/export">
              <Download className="h-4 w-4" /> Export CSV
            </a>
          </Button>
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add contact
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg bg-surface-2 p-1">
        <TabBtn active={tab === "contacts"} onClick={() => setTab("contacts")}>
          <UserCheck className="h-4 w-4" /> Contacts ({contacts.length})
        </TabBtn>
        <TabBtn active={tab === "leads"} onClick={() => setTab("leads")}>
          <Inbox className="h-4 w-4" /> Leads (
          {leads.filter((l) => l.status !== "CONVERTED").length})
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

          {filtered.length === 0 ? (
            <Surface className="p-10 text-center text-sm text-muted-foreground">
              No contacts found.
            </Surface>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <Surface key={c.id} className="flex flex-col p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{c.name}</p>
                      {(c.position || c.company) && (
                        <p className="truncate text-xs text-muted-foreground">
                          {[c.position, c.company].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(c.id)}
                        className="text-muted-foreground hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {c.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> {c.email}
                      </p>
                    )}
                    {c.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {c.phone}
                      </p>
                    )}
                    {c.company && (
                      <p className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" /> {c.company}
                      </p>
                    )}
                  </div>
                </Surface>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          {leads.length === 0 ? (
            <Surface className="p-10 text-center text-sm text-muted-foreground">
              No leads yet — share your card to capture them.
            </Surface>
          ) : (
            leads.map((l) => {
              const insight = insights[l.id];
              return (
                <Surface key={l.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{l.name}</p>
                        <Badge
                          tone={l.status === "CONVERTED" ? "success" : "warning"}
                        >
                          {l.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {[l.company, l.email, l.phone].filter(Boolean).join(" · ")}
                      </p>
                      {l.message && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          “{l.message}”
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {relativeTime(l.createdAt)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => scoreLead(l.id)}
                        disabled={scoring === l.id}
                      >
                        {scoring === l.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        AI score
                      </Button>
                      {l.status !== "CONVERTED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => convertLead(l.id)}
                        >
                          <UserCheck className="h-4 w-4" /> Convert
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteLead(l.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {insight && (
                    <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          tone={
                            insight.rating === "Hot"
                              ? "danger"
                              : insight.rating === "Warm"
                                ? "warning"
                                : "default"
                          }
                        >
                          {insight.rating} · {insight.score}/100
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm">{insight.summary}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Next step:
                        </span>{" "}
                        {insight.suggestedFollowUp}
                      </p>
                    </div>
                  )}
                </Surface>
              );
            })
          )}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing.id ? "Edit contact" : "Add contact"}
      >
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
              <Input
                type="email"
                value={editing.email ?? ""}
                onChange={field("email")}
              />
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
            <Input
              value={editing.tags ?? ""}
              onChange={field("tags")}
              placeholder="vip, event, referral"
            />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={editing.notes ?? ""} onChange={field("notes")} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save contact"}
            </Button>
          </div>
        </form>
      </Modal>
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
