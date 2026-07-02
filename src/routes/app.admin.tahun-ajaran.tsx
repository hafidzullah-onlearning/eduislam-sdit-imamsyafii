import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/admin/tahun-ajaran")({ component: () => (
  <div className="space-y-6">
    <PageHeader title="Tahun Ajaran" description="Kelola periode tahun ajaran dan semester." actions={<Button>+ Tahun ajaran</Button>} />
    <div className="grid gap-4 sm:grid-cols-2">
      {[{ t: "2025/2026", s: "Genap", a: true }, { t: "2025/2026", s: "Ganjil", a: false }, { t: "2024/2025", s: "Genap", a: false }].map((r, i) => (
        <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Semester {r.s}</p>
          <h3 className="mt-1 text-xl font-extrabold">{r.t}</h3>
          {r.a && <Badge className="mt-3">Aktif</Badge>}
        </div>
      ))}
    </div>
  </div>
) });
