"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Check,
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarPlus,
  CheckSquare,
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

// ─── Types ──────────────────────────────────────────────────────────────────
type Task = {
  id: string;
  title: string;
  type: string;
  status: string;
  dueAt: string | null;
  createdAt: string;
};
type Appointment = {
  id: string;
  name: string;
  email: string | null;
  startAt: string;
  endAt: string;
  status: string;
  notes: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  FOLLOW_UP: "Follow up",
  REMINDER: "Reminder",
  MEETING: "Meeting",
};
const TYPE_TONE: Record<string, "primary" | "warning" | "success"> = {
  FOLLOW_UP: "primary",
  REMINDER: "warning",
  MEETING: "success",
};

// Each appointment gets a stable colour from its name so the agenda reads with
// variety instead of one flat accent.
const APPT_PALETTE = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
];
function apptColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return APPT_PALETTE[Math.abs(h) % APPT_PALETTE.length];
}

// ─── Date helpers ───────────────────────────────────────────────────────────
function startOfToday(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function localDay(iso: string): Date {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b);
}
function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function nextHalfHour(): Date {
  const d = new Date();
  d.setSeconds(0, 0);
  const m = d.getMinutes();
  d.setMinutes(m + ((30 - (m % 30)) % 30 || 30));
  return d;
}
function toISO(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}
// Format everything manually with fixed names so server-rendered HTML matches the
// client exactly. toLocaleDateString/TimeString vary by runtime locale (Node vs the
// browser), which caused a hydration mismatch.
// Build a downloadable .ics event so an appointment can be added to Google,
// Apple or Outlook calendars from the web (fallback when Google isn't connected).
function downloadIcs(a: Appointment) {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => (s || "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tapcard//Planner//EN",
    "BEGIN:VEVENT",
    `UID:${a.id}@tapcard`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(a.startAt)}`,
    `DTEND:${stamp(a.endAt)}`,
    `SUMMARY:${esc(a.name)}`,
    a.notes ? `DESCRIPTION:${esc(a.notes)}` : "",
    a.email ? `ATTENDEE:mailto:${a.email}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(a.name || "event").replace(/[^\w]+/g, "-")}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast.success("Calendar event downloaded");
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WD_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WD_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function time(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h < 12 ? "AM" : "PM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}
function timeParts(iso: string): { t: string; p: string } {
  const [t, p] = time(iso).split(" ");
  return { t, p: p ?? "" };
}
function dayHeading(d: Date): { label: string; today: boolean } {
  const today = startOfToday();
  const rel = Math.round((d.getTime() - today.getTime()) / 86400000);
  const short = `${WD_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  if (rel === 0) return { label: `Today · ${short}`, today: true };
  if (rel === 1) return { label: `Tomorrow · ${short}`, today: false };
  if (rel === -1) return { label: `Yesterday · ${short}`, today: false };
  return { label: `${WD_FULL[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`, today: false };
}

// ─── Main ───────────────────────────────────────────────────────────────────
export function PlannerClient({
  initialTasks,
  initialAppointments,
}: {
  initialTasks: Task[];
  initialAppointments: Appointment[];
}) {
  const today = startOfToday();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [cursor, setCursor] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);
  const [addMenu, setAddMenu] = useState(false);

  const [apptModal, setApptModal] = useState<{ initial: Appointment | null } | null>(null);
  const [taskModal, setTaskModal] = useState<{ initial: Task | null } | null>(null);
  const [confirm, setConfirm] = useState<{ kind: "task" | "appointment"; id: string; label: string } | null>(null);

  const marked = useMemo(() => {
    const s = new Set<string>();
    appts.forEach((a) => s.add(dateKey(localDay(a.startAt))));
    tasks.forEach((t) => t.dueAt && s.add(dateKey(localDay(t.dueAt))));
    return s;
  }, [appts, tasks]);

  const dayAppts = appts
    .filter((a) => sameDay(localDay(a.startAt), selected))
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
  const dayTasks = tasks
    .filter((t) => t.dueAt && sameDay(localDay(t.dueAt), selected))
    .sort((a, b) => (a.status === "DONE" ? 1 : 0) - (b.status === "DONE" ? 1 : 0) || (a.dueAt ?? "").localeCompare(b.dueAt ?? ""));

  async function toggleTask(task: Task) {
    const next = task.status === "DONE" ? "TODO" : "DONE";
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
  }

  async function doDelete() {
    if (!confirm) return;
    const { kind, id } = confirm;
    setConfirm(null);
    if (kind === "task") {
      setTasks((ts) => ts.filter((t) => t.id !== id));
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } else {
      setAppts((as) => as.filter((a) => a.id !== id));
      await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    }
  }

  // Calendar grid cells (Monday-first).
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const leading = (monthStart.getDay() + 6) % 7;
  const cells: (Date | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Planner</h1>
          <p className="text-sm text-muted-foreground">
            Your appointments and tasks, in one place — synced with your Tapcard app.
          </p>
        </div>
        <div className="relative">
          <Button onClick={() => setAddMenu((v) => !v)}>
            <Plus className="h-4 w-4" /> Add
          </Button>
          {addMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setAddMenu(false)} />
              <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-xl">
                <button
                  onClick={() => {
                    setAddMenu(false);
                    setApptModal({ initial: null });
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-surface-2"
                >
                  <CalendarDays className="h-4 w-4 text-primary" /> New appointment
                </button>
                <button
                  onClick={() => {
                    setAddMenu(false);
                    setTaskModal({ initial: null });
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-surface-2"
                >
                  <Check className="h-4 w-4 text-primary" /> New task
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        {/* Calendar */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-border bg-surface/80 p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-surface-2"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-bold">
                {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
              </span>
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-surface-2"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-1 grid grid-cols-7">
              {WEEKDAYS.map((w, i) => (
                <div key={i} className="text-center text-[11px] font-semibold text-muted-foreground">
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((d, i) => {
                if (!d) return <div key={i} />;
                const isSel = sameDay(d, selected);
                const isToday = sameDay(d, today);
                const has = marked.has(dateKey(d));
                return (
                  <div key={i} className="flex justify-center">
                    <button
                      onClick={() => setSelected(d)}
                      className={[
                        "relative flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                        isSel
                          ? "bg-primary font-bold text-primary-foreground"
                          : isToday
                            ? "font-bold text-primary ring-1 ring-primary"
                            : "text-foreground hover:bg-surface-2",
                      ].join(" ")}
                    >
                      {d.getDate()}
                      {has && !isSel && (
                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day agenda */}
        <div>
          <DayHeader date={selected} />

          {dayAppts.length === 0 && dayTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Nothing scheduled for this day. Use <span className="font-medium text-foreground">Add</span> to create one.
            </div>
          ) : (
            <div className="space-y-6">
              {dayAppts.length > 0 && (
                <Section label="Appointments" count={dayAppts.length}>
                  {dayAppts.map((a) => (
                    <AppointmentRow
                      key={a.id}
                      appt={a}
                      onEdit={() => setApptModal({ initial: a })}
                      onDelete={() => setConfirm({ kind: "appointment", id: a.id, label: a.name })}
                      onCalendar={() => downloadIcs(a)}
                    />
                  ))}
                </Section>
              )}
              {dayTasks.length > 0 && (
                <Section label="Tasks" count={dayTasks.length}>
                  {dayTasks.map((t) => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      onToggle={() => toggleTask(t)}
                      onEdit={() => setTaskModal({ initial: t })}
                      onDelete={() => setConfirm({ kind: "task", id: t.id, label: t.title })}
                    />
                  ))}
                </Section>
              )}
            </div>
          )}
        </div>
      </div>

      {apptModal && (
        <AppointmentModal
          initial={apptModal.initial}
          selectedDate={selected}
          onClose={() => setApptModal(null)}
          onSaved={(appt, isEdit) =>
            setAppts((list) => (isEdit ? list.map((a) => (a.id === appt.id ? appt : a)) : [...list, appt]))
          }
        />
      )}
      {taskModal && (
        <TaskModal
          initial={taskModal.initial}
          selectedDate={selected}
          onClose={() => setTaskModal(null)}
          onSaved={(task, isEdit) =>
            setTasks((list) => (isEdit ? list.map((t) => (t.id === task.id ? task : t)) : [...list, task]))
          }
        />
      )}
      {confirm && (
        <ConfirmDelete
          kind={confirm.kind}
          label={confirm.label}
          onCancel={() => setConfirm(null)}
          onConfirm={doDelete}
        />
      )}
    </div>
  );
}

// ─── Pieces ─────────────────────────────────────────────────────────────────
function DayHeader({ date }: { date: Date }) {
  const { label, today } = dayHeading(date);
  return (
    <p className={`mb-3 text-xs font-bold uppercase tracking-wide ${today ? "text-primary" : "text-muted-foreground"}`}>
      {label}
    </p>
  );
}

function Section({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted-foreground">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function AppointmentRow({
  appt,
  onEdit,
  onDelete,
  onCalendar,
}: {
  appt: Appointment;
  onEdit: () => void;
  onDelete: () => void;
  onCalendar: () => void;
}) {
  const color = apptColor(appt.name || appt.id);
  const { t, p } = timeParts(appt.startAt);
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface/80 p-3 transition-colors hover:border-primary/30">
      <div className={`flex w-14 shrink-0 flex-col items-center rounded-lg py-2 ${color}`}>
        <span className="text-[15px] font-bold leading-none">{t}</span>
        <span className="mt-0.5 text-[10px] font-bold">{p}</span>
      </div>
      <button onClick={onEdit} className="min-w-0 flex-1 text-left">
        <p className="truncate font-semibold">{appt.name}</p>
        <p className="text-[13px] text-muted-foreground">
          {time(appt.startAt)} – {time(appt.endAt)}
        </p>
        {appt.email && <p className="truncate text-xs text-muted-foreground">{appt.email}</p>}
        {appt.notes && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{appt.notes}</p>}
      </button>
      <RowActions onEdit={onEdit} onDelete={onDelete} onCalendar={onCalendar} />
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const done = task.status === "DONE";
  const due = task.dueAt ? time(task.dueAt) : null;
  const overdue = !!task.dueAt && !done && new Date(task.dueAt).getTime() < Date.now();
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface/80 p-3 transition-colors hover:border-primary/30">
      <button
        onClick={onToggle}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          done ? "border-success bg-success text-white" : "border-border hover:border-success"
        }`}
        aria-label="Toggle done"
      >
        {done && <Check className="h-4 w-4" />}
      </button>
      <button onClick={onEdit} className="min-w-0 flex-1 text-left">
        <p className={`font-medium ${done ? "text-muted-foreground line-through" : ""}`}>{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge tone={TYPE_TONE[task.type] ?? "default"}>{TYPE_LABEL[task.type] ?? task.type}</Badge>
          {due && (
            <span className={`flex items-center gap-1 text-xs ${overdue ? "text-danger" : "text-muted-foreground"}`}>
              <Clock className="h-3 w-3" /> {due}
              {overdue && " · overdue"}
            </span>
          )}
        </div>
      </button>
      <RowActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

function RowActions({
  onEdit,
  onDelete,
  onCalendar,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onCalendar?: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      {onCalendar && (
        <button
          onClick={onCalendar}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-primary"
          aria-label="Add to calendar"
          title="Add to calendar"
        >
          <CalendarPlus className="h-4 w-4" />
        </button>
      )}
      <button onClick={onEdit} className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground" aria-label="Edit">
        <Pencil className="h-4 w-4" />
      </button>
      <button onClick={onDelete} className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger" aria-label="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Modals ─────────────────────────────────────────────────────────────────
function ModalShell({ title, icon, onClose, children }: { title: string; icon: React.ReactNode; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-surface p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">{icon}</div>
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}

function AppointmentModal({
  initial,
  selectedDate,
  onClose,
  onSaved,
}: {
  initial: Appointment | null;
  selectedDate: Date;
  onClose: () => void;
  onSaved: (a: Appointment, isEdit: boolean) => void;
}) {
  const editing = !!initial;
  const def = nextHalfHour();
  const defEnd = new Date(def.getTime() + 30 * 60000);
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [date, setDate] = useState(initial ? ymd(new Date(initial.startAt)) : ymd(selectedDate < startOfToday() ? startOfToday() : selectedDate));
  const [start, setStart] = useState(initial ? hhmm(new Date(initial.startAt)) : hhmm(def));
  const [end, setEnd] = useState(initial ? hhmm(new Date(initial.endAt)) : hhmm(defEnd));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return setErr("Add a name for this appointment.");
    const startDt = new Date(`${date}T${start}`);
    const endDt = new Date(`${date}T${end}`);
    if (endDt <= startDt) return setErr("End time must be after the start.");
    if (!editing && startDt.getTime() < Date.now()) return setErr("Start time can't be in the past.");
    setErr("");
    setSaving(true);
    const body = { name, email, startAt: toISO(date, start), endAt: toISO(date, end), notes };
    const res = await fetch(editing ? `/api/appointments/${initial!.id}` : "/api/appointments", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      const { appointment } = await res.json();
      onSaved(appointment, editing);
      onClose();
    } else {
      setErr("Couldn't save. Please try again.");
    }
  }

  return (
    <ModalShell title={editing ? "Edit appointment" : "New appointment"} icon={<CalendarDays className="h-5 w-5" />} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <Label>Who with?</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Coffee with Ava" autoFocus />
        </div>
        <div>
          <Label>Email (optional)</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" min={ymd(startOfToday())} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Start</Label>
            <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <Label>End</Label>
            <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Notes (optional)</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>
        {err && <p className="text-sm text-danger">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || !name.trim()}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add appointment"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function TaskModal({
  initial,
  selectedDate,
  onClose,
  onSaved,
}: {
  initial: Task | null;
  selectedDate: Date;
  onClose: () => void;
  onSaved: (t: Task, isEdit: boolean) => void;
}) {
  const editing = !!initial;
  const initDue = initial?.dueAt ? new Date(initial.dueAt) : null;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState(initial?.type ?? "FOLLOW_UP");
  const [date, setDate] = useState(
    initDue ? ymd(initDue) : ymd(selectedDate < startOfToday() ? startOfToday() : selectedDate),
  );
  const [t, setT] = useState(initDue ? hhmm(initDue) : hhmm(nextHalfHour()));
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return setErr("What needs doing?");
    const dueDt = new Date(`${date}T${t}`);
    if (!editing && dueDt.getTime() < Date.now()) return setErr("Due time can't be in the past.");
    setErr("");
    setSaving(true);
    const body = { title, type, dueAt: toISO(date, t) };
    const res = await fetch(editing ? `/api/tasks/${initial!.id}` : "/api/tasks", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      const { task } = await res.json();
      onSaved(task, editing);
      onClose();
    } else {
      setErr("Couldn't save. Please try again.");
    }
  }

  return (
    <ModalShell title={editing ? "Edit task" : "New task"} icon={<CheckSquare className="h-5 w-5" />} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <Label>What needs doing?</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Call Jordan Avery" autoFocus />
        </div>
        <div>
          <Label>Type</Label>
          <div className="flex gap-2">
            {(["FOLLOW_UP", "REMINDER", "MEETING"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setType(k)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  type === k ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:bg-surface-2"
                }`}
              >
                {TYPE_LABEL[k]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Due date</Label>
            <Input type="date" min={ymd(startOfToday())} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Time</Label>
            <Input type="time" value={t} onChange={(e) => setT(e.target.value)} />
          </div>
        </div>
        {err && <p className="text-sm text-danger">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving || !title.trim()}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add task"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function ConfirmDelete({
  kind,
  label,
  onCancel,
  onConfirm,
}: {
  kind: "task" | "appointment";
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/10">
          <Trash2 className="h-6 w-6 text-danger" />
        </div>
        <h2 className="mt-4 text-lg font-bold">Delete {kind}?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          “{label}” will be permanently removed.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button variant="danger" onClick={onConfirm}>Delete</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
