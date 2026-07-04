import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  trend,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  trend?: { value: string; positive?: boolean };
}) {
  const toneMap: Record<string, string> = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    danger: "bg-red-500/10 text-red-600",
    info: "bg-blue-500/10 text-blue-600",
  };
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <p
          className={cn(
            "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            trend.positive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600",
          )}
        >
          {trend.value}
        </p>
      )}
    </div>
  );
}
