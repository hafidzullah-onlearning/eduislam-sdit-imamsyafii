import { BookOpen, Wallet, TrendingUp, Users, Bell } from "lucide-react";

export function DashboardMock() {
  return (
    <div className="relative rounded-[32px] border border-border/60 bg-background p-4 shadow-elevation lg:p-5">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-2 pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-mint/60" />
        <div className="ml-3 flex-1 truncate rounded-full bg-surface-muted px-3 py-1 text-[10px] text-muted-foreground">
          dashboard.eduislam.id/yayasan
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-b from-surface-soft to-background p-4 lg:p-5">
        {/* Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Yayasan Al-Hikmah
            </p>
            <p className="truncate text-base font-extrabold text-foreground sm:text-lg">
              Dashboard Operasional
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-mint/15 px-2.5 py-1 text-[10px] font-semibold text-primary">
            Live
          </span>
        </div>

        {/* KPI grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <Kpi icon={Users} label="Siswa Aktif" value="1.248" tone="emerald" />
          <Kpi icon={Wallet} label="SPP Tertagih" value="94%" tone="gold" />
          <Kpi icon={BookOpen} label="Hafalan Juz" value="3.2" tone="navy" />
          <Kpi icon={TrendingUp} label="Mood Index" value="82" tone="mint" />
        </div>

        {/* Chart + side */}
        <div className="mt-3 grid gap-2.5 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border/60 bg-background p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold">Penerimaan SPP</p>
              <span className="text-[10px] text-muted-foreground">12 bulan</span>
            </div>
            <div className="mt-3 grid h-20 grid-cols-12 items-end gap-1">
              {[40, 52, 46, 60, 55, 70, 64, 78, 72, 86, 82, 92].map((h, i) => (
                <div
                  key={i}
                  className="rounded-t-md bg-gradient-to-t from-primary to-primary/40"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background p-3.5">
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-gold" />
              <p className="text-xs font-bold">Notifikasi</p>
            </div>
            <ul className="mt-2.5 space-y-2 text-[11px]">
              <li className="rounded-xl bg-surface-soft px-2.5 py-2 text-muted-foreground">
                <b className="text-foreground">12 siswa</b> selesai murojaah Juz 30
              </li>
              <li className="rounded-xl bg-surface-soft px-2.5 py-2 text-muted-foreground">
                <b className="text-foreground">Rp 84jt</b> SPP masuk hari ini
              </li>
              <li className="rounded-xl bg-surface-soft px-2.5 py-2 text-muted-foreground">
                Mood Kelas 5B turun <b className="text-gold">-8%</b>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone: "emerald" | "gold" | "navy" | "mint";
}) {
  const toneCls = {
    emerald: "bg-primary-soft text-primary",
    gold: "bg-gold/15 text-gold",
    navy: "bg-secondary/10 text-secondary",
    mint: "bg-mint/20 text-primary",
  }[tone];
  return (
    <div className="rounded-2xl border border-border/60 bg-background p-3">
      <div className={`grid h-8 w-8 place-items-center rounded-xl ${toneCls}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-lg font-extrabold tracking-tight tabular-nums">{value}</p>
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
