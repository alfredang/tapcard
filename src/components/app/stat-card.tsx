import { cn } from "@/lib/utils";

type Tone = "primary" | "default" | "success" | "warning" | "danger";

const TONE: Record<Tone, string> = {
  primary: "bg-primary/12 text-primary",
  default: "bg-surface-2 text-muted-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  tone?: Tone;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface/80 p-5 backdrop-blur-sm transition-colors hover:border-primary/25">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", TONE[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
