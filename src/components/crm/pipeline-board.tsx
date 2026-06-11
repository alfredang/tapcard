"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { Surface } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";

export interface DealRow {
  id: string;
  title: string;
  value: number;
  stage: string;
  notes: string | null;
  contact: { name: string; company: string | null } | null;
}

const STAGES: { key: string; label: string; color: string }[] = [
  { key: "NEW_LEAD", label: "New Lead", color: "#7c5cff" },
  { key: "CONTACTED", label: "Contacted", color: "#3b82f6" },
  { key: "QUALIFIED", label: "Qualified", color: "#06b6d4" },
  { key: "PROPOSAL", label: "Proposal Sent", color: "#eab308" },
  { key: "NEGOTIATION", label: "Negotiation", color: "#f97316" },
  { key: "WON", label: "Won", color: "#22c55e" },
  { key: "LOST", label: "Lost", color: "#ef4444" },
];

export function PipelineBoard({ initialDeals }: { initialDeals: DealRow[] }) {
  const [deals, setDeals] = useState(initialDeals);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", value: "", stage: "NEW_LEAD", notes: "" });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const byStage = useMemo(() => {
    const map: Record<string, DealRow[]> = {};
    for (const s of STAGES) map[s.key] = [];
    for (const d of deals) (map[d.stage] ??= []).push(d);
    return map;
  }, [deals]);

  const activeDeal = deals.find((d) => d.id === activeId) || null;

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  async function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const dealId = String(e.active.id);
    const overStage = e.over?.id ? String(e.over.id) : null;
    if (!overStage) return;
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === overStage) return;

    setDeals((list) =>
      list.map((d) => (d.id === dealId ? { ...d, stage: overStage } : d)),
    );
    await fetch(`/api/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: overStage }),
    }).catch(() => {});
  }

  async function addDeal(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, value: Number(form.value || 0) }),
    });
    if (!res.ok) return;
    const { deal } = await res.json();
    setDeals((list) => [deal, ...list]);
    setModalOpen(false);
    setForm({ title: "", value: "", stage: "NEW_LEAD", notes: "" });
  }

  async function removeDeal(id: string) {
    await fetch(`/api/deals/${id}`, { method: "DELETE" });
    setDeals((list) => list.filter((d) => d.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Drag deals between stages to update them.
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Add deal
        </Button>
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const items = byStage[stage.key] ?? [];
            const total = items.reduce((sum, d) => sum + d.value, 0);
            return (
              <Column
                key={stage.key}
                stage={stage}
                count={items.length}
                total={total}
              >
                {items.map((deal) => (
                  <DealCard key={deal.id} deal={deal} onDelete={removeDeal} />
                ))}
              </Column>
            );
          })}
        </div>
        <DragOverlay>
          {activeDeal ? <DealCardInner deal={activeDeal} dragging /> : null}
        </DragOverlay>
      </DndContext>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add deal">
        <form onSubmit={addDeal} className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Value ($)</Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              />
            </div>
            <div>
              <Label>Stage</Label>
              <select
                value={form.stage}
                onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-surface-2/60 px-3 text-sm"
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add deal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Column({
  stage,
  count,
  total,
  children,
}: {
  stage: { key: string; label: string; color: string };
  count: number;
  total: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key });
  return (
    <div className="w-72 shrink-0">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: stage.color }}
          />
          {stage.label}
          <span className="text-xs text-muted-foreground">({count})</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {formatCurrency(total)}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[200px] space-y-2 rounded-lg border p-2 transition ${
          isOver ? "border-primary bg-primary/5" : "border-border bg-surface/40"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function DealCard({
  deal,
  onDelete,
}: {
  deal: DealRow;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.id,
  });
  return (
    <div
      ref={setNodeRef}
      className={isDragging ? "opacity-40" : ""}
      {...attributes}
    >
      <DealCardInner deal={deal} listeners={listeners} onDelete={onDelete} />
    </div>
  );
}

function DealCardInner({
  deal,
  listeners,
  dragging,
  onDelete,
}: {
  deal: DealRow;
  listeners?: Record<string, unknown>;
  dragging?: boolean;
  onDelete?: (id: string) => void;
}) {
  return (
    <Surface
      className={`group p-3 ${dragging ? "rotate-2 shadow-2xl" : ""}`}
    >
      <div className="flex items-start gap-2">
        <button
          {...(listeners ?? {})}
          className="mt-0.5 cursor-grab text-muted-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{deal.title}</p>
          {deal.contact && (
            <p className="truncate text-xs text-muted-foreground">
              {deal.contact.name}
              {deal.contact.company ? ` · ${deal.contact.company}` : ""}
            </p>
          )}
          <p className="mt-1 text-sm font-semibold text-primary">
            {formatCurrency(deal.value)}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(deal.id)}
            className="text-muted-foreground opacity-0 transition hover:text-danger group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </Surface>
  );
}
