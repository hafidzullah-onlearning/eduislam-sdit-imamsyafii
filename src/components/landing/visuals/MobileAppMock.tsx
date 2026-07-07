import { BookOpen, Heart } from "lucide-react";
import happy from "@/assets/emoji-happy.png";

export function MobileAppMock() {
  return (
    <div className="relative">
      <div className="rounded-[40px] border border-border/60 bg-foreground p-2 shadow-elevation">
        <div className="overflow-hidden rounded-[32px] bg-background p-4">
          {/* Status bar */}
          <div className="flex items-center justify-between text-[9px] font-semibold text-muted-foreground">
            <span>09:41</span>
            <span>••• EduIslam</span>
          </div>

          {/* Greeting */}
          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Assalamu'alaikum
            </p>
            <p className="text-sm font-extrabold leading-tight">Bunda Diana</p>
          </div>

          {/* Mood today */}
          <div className="mt-3 rounded-2xl bg-gradient-emerald p-3 text-primary-foreground">
            <p className="text-[9px] font-semibold uppercase opacity-80">Mood Aisyah hari ini</p>
            <div className="mt-1 flex items-center gap-2">
              <img src={happy} alt="" width={40} height={40} className="h-9 w-9 drop-shadow" />
              <div>
                <p className="text-sm font-extrabold">Bahagia</p>
                <p className="text-[9px] opacity-80">Hafalan lancar +2 ayat</p>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="mt-3 space-y-2">
            <Card icon={BookOpen} title="Murojaah Juz 30" sub="QS. An-Naba 1-15" tone="primary" />
            <Card icon={Heart} title="Mood mingguan" sub="Stabil & semangat" tone="gold" />
          </div>

          {/* SPP */}
          <div className="mt-3 rounded-2xl border border-border bg-surface-soft p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-muted-foreground">SPP November</p>
              <span className="rounded-full bg-mint/20 px-2 py-0.5 text-[9px] font-bold text-primary">
                Lunas
              </span>
            </div>
            <p className="mt-0.5 text-sm font-extrabold">Rp 850.000</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  sub,
  tone,
}: {
  icon: typeof BookOpen;
  title: string;
  sub: string;
  tone: "primary" | "gold";
}) {
  const cls = tone === "primary" ? "bg-primary-soft text-primary" : "bg-gold/15 text-gold";
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-background p-2.5">
      <div className={`grid h-8 w-8 place-items-center rounded-xl ${cls}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold">{title}</p>
        <p className="truncate text-[9px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}
