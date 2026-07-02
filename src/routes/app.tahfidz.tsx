import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookMarked, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { StatCard } from "@/components/app/common/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB, genId } from "@/lib/mock-store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/app/tahfidz")({
  component: TahfidzPage,
});

function TahfidzPage() {
  const { session, user } = useAuth();
  const tahfidz = useDB((s) => s.tahfidz);
  const siswa = useDB((s) => s.siswa);
  const patch = useDB((s) => s.patch);
  const isGuru = session?.role === "guru";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ siswaId: "", surah: "", ayatDari: 1, ayatSampai: 1, target: "Juz 30", status: "lancar" as const, catatan: "" });

  const target = isGuru
    ? siswa
    : siswa.filter((s) => s.orangTuaId === user?.id).filter((s) => s.id === session?.activeSiswaId);
  const focus = isGuru ? null : target[0];
  const list = focus ? tahfidz.filter((t) => t.siswaId === focus.id) : tahfidz;
  const lancar = list.filter((t) => t.status === "lancar").length;
  const ayatTotal = list.reduce((a, b) => a + (b.ayatSampai - b.ayatDari + 1), 0);

  const chart = useMemo(() => list.slice(-8).map((t) => ({ tanggal: format(new Date(t.tanggal), "dd/MM"), ayat: t.ayatSampai - t.ayatDari + 1 })), [list]);

  const save = () => {
    if (!form.siswaId || !form.surah) return toast.error("Lengkapi field wajib");
    patch("tahfidz", (items) => [...items, { id: genId("tf"), ...form, tanggal: new Date().toISOString(), guruId: user!.id }]);
    toast.success("Setoran tersimpan");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isGuru ? "Setoran Tahfidz" : `Tahfidz — ${focus?.nama ?? ""}`}
        description={isGuru ? "Catat setoran hafalan siswa Anda." : "Progres hafalan Al-Qur'an anak Anda."}
        actions={
          isGuru && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Setoran baru</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Input setoran</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5"><Label>Siswa *</Label>
                    <Select value={form.siswaId} onValueChange={(v) => setForm({ ...form, siswaId: v })}>
                      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent>{siswa.map((s) => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Surah *</Label><Input value={form.surah} onChange={(e) => setForm({ ...form, surah: e.target.value })} placeholder="Al-Fatihah" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Ayat dari</Label><Input type="number" value={form.ayatDari} onChange={(e) => setForm({ ...form, ayatDari: +e.target.value })} /></div>
                    <div className="space-y-1.5"><Label>Ayat sampai</Label><Input type="number" value={form.ayatSampai} onChange={(e) => setForm({ ...form, ayatSampai: +e.target.value })} /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Target</Label><Input value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Status</Label>
                    <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lancar">Lancar</SelectItem>
                        <SelectItem value="perlu-mengulang">Perlu mengulang</SelectItem>
                        <SelectItem value="belum-dinilai">Belum dinilai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Catatan</Label><Textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} /></div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
                  <Button onClick={save}>Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total setoran" value={list.length} icon={BookMarked} />
        <StatCard label="Lancar" value={`${lancar}/${list.length || 0}`} icon={BookMarked} tone="success" />
        <StatCard label="Ayat dihafal" value={ayatTotal} icon={BookMarked} tone="info" />
      </div>

      {focus && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Progres menuju target Juz 30</h3>
            <span className="text-sm font-semibold text-primary">{Math.min(100, Math.round((ayatTotal / 564) * 100))}%</span>
          </div>
          <Progress value={Math.min(100, (ayatTotal / 564) * 100)} className="mt-3" />
          <p className="mt-2 text-xs text-muted-foreground">{ayatTotal} dari 564 ayat Juz 30 (Amma).</p>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState icon={BookMarked} title="Belum ada setoran" />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <h3 className="mb-4 font-bold">Riwayat Setoran</h3>
          <div className="space-y-2">
            {list.slice().reverse().map((t) => {
              const s = siswa.find((x) => x.id === t.siswaId);
              return (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 p-3">
                  <div>
                    <p className="font-semibold">{t.surah} <span className="text-muted-foreground">ayat {t.ayatDari}-{t.ayatSampai}</span></p>
                    <p className="text-xs text-muted-foreground">{isGuru && `${s?.nama} • `}{format(new Date(t.tanggal), "dd MMM yyyy", { locale: idLocale })}</p>
                    {t.catatan && <p className="mt-1 text-xs italic text-muted-foreground">"{t.catatan}"</p>}
                  </div>
                  <Badge variant={t.status === "lancar" ? "default" : t.status === "perlu-mengulang" ? "destructive" : "outline"}>{t.status}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
