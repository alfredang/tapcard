import { Surface, Badge } from "@/components/ui/card";

export function ComingSoon({
  title,
  description,
  icon: Icon,
  features,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}) {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{title}</h1>
          <Badge tone="primary">Coming soon</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Surface className="flex flex-col items-center gap-5 p-12 text-center">
        <div className="gradient-primary flex h-16 w-16 items-center justify-center rounded-2xl">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">This module is on the roadmap</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            The data model and navigation are already in place — the interface
            ships in an upcoming phase.
          </p>
        </div>
        <ul className="grid w-full max-w-md gap-2 text-left text-sm sm:grid-cols-2">
          {features.map((f) => (
            <li
              key={f}
              className="rounded-md border border-border bg-surface-2/40 px-3 py-2 text-muted-foreground"
            >
              {f}
            </li>
          ))}
        </ul>
      </Surface>
    </div>
  );
}
