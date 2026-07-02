import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Award, Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { StatCard } from "@/components/app/common/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB, genId } from "@/lib/mock-store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/app/nilai")({
  component: NilaiPage,
});

function NilaiPage() {
  const { session, user } = useAuth();
  if (session?.role === "guru") return <GuruNilai />;
  return <OrtuNilai />;
}

function OrtuNilai() {
  const { user, session } = useAuth();
  const siswa = useDB((s) => s.siswa);
  const nilai = useDB((s) => s.nilai);
  const mapel = useDB((s) => s.mapel);
  const [tab, setTab] = useState<"semua" | "harian" | "uts" | "uas">("semua");
  const anak = siswa.filter((s) => s.orangTuaId === user?.id).find((k) => k.id === session?.activeSiswaId);

  const list = useMemo(() => {
    if (!anak) return [];
    const filtered = nilai.filter((n) => n.siswaId === anak.id && n.status === "published");
    return tab === "semua" ? filtered : filtered.filter((n) => n.jenis === tab);
  }, [nilai, anak, tab]);

  const perMapel = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const n of list) {
      map.set(n.mapelId, [...(map.get(n.mapelId) ?? []), n.nilai]);
    }
    return Array.from(map.entries()).map(([mapelId, arr]) => ({
      mapel: mapel.find((m) => m.id === mapelId)?.nama ?? "",
      Rata: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
      KKM: 75,
    }));
  }, [list, mapel]);

  const avg = list.length ? Math.round(list.reduce((a, b) => a + b.nilai, 0) / list.length) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Nilai & Rapor — ${anak?.nama ?? ""}`}
        description="Progres akademik anak Anda per mata pelajaran."
        actions={<Button variant="outline" onClick={() => toast.success("Rapor PDF didownload (mock)")}><Download className="h-4 w-4" /> Rapor PDF</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Rata-rata" value={avg || "—"} icon={Award} tone={avg >= 80 ? "success" : "default"} />
        <StatCard label="Nilai terpublish" value={list.length} icon={Award} tone="info" />
        <StatCard label="Di atas KKM" value={list.filter((n) => n.nilai >= n.kkm).length} icon={Award} tone="success" />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="semua">Semua</TabsTrigger>
          <TabsTrigger value="harian">Harian</TabsTrigger>
          <TabsTrigger value="uts">UTS</TabsTrigger>
          <TabsTrigger value="uas">UAS</TabsTrigger>
        </TabsList>
      </Tabs>

      {perMapel.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <h3 className="mb-4 font-bold">Rata-rata per Mata Pelajaran</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={perMapel}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="mapel" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                <Bar dataKey="Rata" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="KKM" fill="var(--color-gold)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState icon={Award} title="Belum ada nilai" />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <h3 className="mb-4 font-bold">Detail Nilai</h3>
          <div className="space-y-2">
            {list.map((n) => {
              const m = mapel.find((x) => x.id === n.mapelId);
              const lulus = n.nilai >= n.kkm;
              return (
                <div key={n.id} className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                  <div>
                    <p className="font-semibold">{m?.nama} <Badge variant="outline" className="ml-1">{n.jenis}</Badge></p>
                    <p className="text-xs text-muted-foreground">{format(new Date(n.tanggal), "dd MMM yyyy", { locale: idLocale })} • KKM {n.kkm}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-extrabold ${lulus ? "text-emerald-600" : "text-red-600"}`}>{n.nilai}</p>
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">{lulus ? "Lulus KKM" : "Di bawah KKM"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function GuruNilai() {
  const { user } = useAuth();
  const nilai = useDB((s) => s.nilai);
  const siswa = useDB((s) => s.siswa);
  const mapel = useDB((s) => s.mapel);
  const patch = useDB((s) => s.patch);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"published" | "draft">("published");
  const [form, setForm] = useState({ siswaId: "", mapelId: "", jenis: "harian" as const, nilai: 0, kkm: 75, catatan: "" });

  const list = nilai.filter((n) => n.guruId === user?.id).filter((n) => n.status === tab);

  const save = () => {
    if (!form.siswaId || !form.mapelId) return toast.error("Lengkapi field");
    patch("nilai", (items) => [...items, { id: genId("n"), ...form, status: "draft" as const, tanggal: new Date().toISOString(), guruId: user!.id }]);
    toast.success("Nilai tersimpan sebagai draft");
    setOpen(false);
  };

  const publish = (id: string) => {
    patch("nilai", (items) => items.map((n) => (n.id === id ? { ...n, status: "published" as const } : n)));
    toast.success("Nilai dipublish ke orang tua");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Nilai"
        description="Input, edit, dan publish nilai siswa."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Input nilai</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Input nilai baru</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Siswa *</Label>
                  <Select value={form.siswaId} onValueChange={(v) => setForm({ ...form, siswaId: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>{siswa.map((s) => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Mapel *</Label>
                  <Select value={form.mapelId} onValueChange={(v) => setForm({ ...form, mapelId: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>{mapel.map((m) => <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Jenis</Label>
                    <Select value={form.jenis} onValueChange={(v: any) => setForm({ ...form, jenis: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="harian">Harian</SelectItem>
                        <SelectItem value="tugas">Tugas</SelectItem>
                        <SelectItem value="uts">UTS</SelectItem>
                        <SelectItem value="uas">UAS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Nilai</Label><Input type="number" min={0} max={100} value={form.nilai} onChange={(e) => setForm({ ...form, nilai: +e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
                <Button onClick={save}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>
      </Tabs>

      {list.length === 0 ? (
        <EmptyState icon={Award} title={`Belum ada nilai ${tab}`} />
      ) : (
        <div className="space-y-2">
          {list.map((n) => {
            const s = siswa.find((x) => x.id === n.siswaId);
            const m = mapel.find((x) => x.id === n.mapelId);
            return (
              <div key={n.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
                <div>
                  <p className="font-semibold">{s?.nama}</p>
                  <p className="text-xs text-muted-foreground">{m?.nama} • {n.jenis} • {format(new Date(n.tanggal), "dd MMM", { locale: idLocale })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-primary">{n.nilai}</span>
                  {n.status === "draft" && <Button size="sm" onClick={() => publish(n.id)}>Publish</Button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
