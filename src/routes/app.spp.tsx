import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Wallet, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { StatCard } from "@/components/app/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB } from "@/lib/mock-store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/app/spp")({ component: SPPPage });

function SPPPage() {
  const { user } = useAuth();
  const siswa = useDB((s) => s.siswa);
  const invoices = useDB((s) => s.invoice);
  const [tab, setTab] = useState<"aktif" | "lunas">("aktif");

  const anak = siswa.filter((s) => s.orangTuaId === user?.id && s.status !== "nonaktif");
  const mine = invoices.filter((i) => anak.some((a) => a.id === i.siswaId));
  const list = mine.filter((i) => (tab === "aktif" ? i.status !== "lunas" : i.status === "lunas"));
  const total = mine.filter((i) => i.status !== "lunas").reduce((a, b) => a + b.jumlah, 0);
  const lunasCount = mine.filter((i) => i.status === "lunas").length;

  return (
    <div className="space-y-6">
      <PageHeader title="SPP & Tagihan" description="Kelola dan bayar tagihan sekolah anak Anda." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total tagihan aktif" value={`Rp ${total.toLocaleString("id-ID")}`} icon={Wallet} tone={total > 0 ? "warning" : "success"} />
        <StatCard label="Sudah lunas" value={lunasCount} icon={CheckCircle2} tone="success" hint="tagihan bulan ini" />
        <StatCard label="Anak terdaftar" value={anak.length} icon={Wallet} />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="aktif">Aktif</TabsTrigger>
          <TabsTrigger value="lunas">Riwayat</TabsTrigger>
        </TabsList>
      </Tabs>

      {list.length === 0 ? (
        <EmptyState icon={CheckCircle2} title={tab === "aktif" ? "Alhamdulillah, tidak ada tagihan" : "Belum ada riwayat"} />
      ) : (
        <div className="space-y-3">
          {list.map((inv) => {
            const s = anak.find((x) => x.id === inv.siswaId);
            const icon = inv.status === "lunas" ? CheckCircle2 : inv.status === "terlambat" ? AlertCircle : Clock;
            const Icon = icon;
            const tone = inv.status === "lunas" ? "text-emerald-600 bg-emerald-500/10" : inv.status === "terlambat" ? "text-red-600 bg-red-500/10" : "text-amber-600 bg-amber-500/10";
            return (
              <Link key={inv.id} to="/app/spp/$id" params={{ id: inv.id }} className="block rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition hover:border-primary/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
                    <div>
                      <p className="font-bold capitalize">{inv.jenis} • {inv.bulan}</p>
                      <p className="text-xs text-muted-foreground">{s?.nama} • Jatuh tempo {format(new Date(inv.jatuhTempo), "dd MMM yyyy", { locale: idLocale })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold">Rp {inv.jumlah.toLocaleString("id-ID")}</p>
                    <Badge variant={inv.status === "lunas" ? "default" : inv.status === "terlambat" ? "destructive" : "secondary"}>
                      {inv.status === "lunas" ? "Lunas" : inv.status === "terlambat" ? "Terlambat" : "Belum bayar"}
                    </Badge>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
