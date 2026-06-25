import { GraduationCap, BookOpen, Landmark, School, Building2 } from "lucide-react";

const ITEMS = [
  { icon: Landmark, label: "Yayasan Islam" },
  { icon: School, label: "SDIT" },
  { icon: BookOpen, label: "Pesantren Modern" },
  { icon: GraduationCap, label: "SMP Islam" },
  { icon: Building2, label: "Madrasah" },
];

export function TrustBar() {
  return (
    <section className="relative border-y border-border/60 bg-surface-soft py-14">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Dirancang untuk kebutuhan unik sekolah Islam masa kini
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ITEMS.map((it) => (
            <div
              key={it.label}
              className="flex items-center justify-center gap-2.5 rounded-3xl border border-border/60 bg-background/60 px-5 py-4 text-muted-foreground backdrop-blur transition hover:border-primary/20 hover:text-foreground"
            >
              <it.icon className="h-5 w-5 text-primary" strokeWidth={1.8} />
              <span className="text-sm font-semibold tracking-tight">{it.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
