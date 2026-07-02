import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB, genId } from "@/lib/mock-store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/app/perilaku")({ component: PerilakuPage });

function PerilakuPage() {
  const { user } = useAuth();
  const perilaku = useDB((s) => s.perilaku);
  const siswa = useDB((s) => s.siswa);
  const patch = useDB((s) => s.patch);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ siswaId: "", aspek: "karakter-islami" as const, skor: 4, catatan: "" });

  const save = () => {
    if (!f.siswaId) return toast.error("Pilih siswa");
    patch("perilaku", (items) => [...items, { id: genId("p"), ...f, tanggal: new Date().toISOString(), guruId: user!.id }]);
    toast.success("Penilaian tersimpan");
    setOpen(false);
  };
  return (
    <div className="space-y-6">
      <PageHeader title="Perilaku & Karakter" description="Nilai karakter Islami, disiplin, keaktifan, dan kerjasama siswa." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Nilai baru</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Input penilaian perilaku</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Siswa</Label>
                <Select value={f.siswaId} onValueChange={(v) => setF({ ...f, siswaId: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>{siswa.map((s) => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Aspek</Label>
                <Select value={f.aspek} onValueChange={(v: any) => setF({ ...f, aspek: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="karakter-islami">Karakter Islami</SelectItem>
                    <SelectItem value="disiplin">Disiplin</SelectItem>
                    <SelectItem value="keaktifan">Keaktifan</SelectItem>
                    <SelectItem value="kerjasama">Kerjasama</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Skor (1-5)</Label>
                <Select value={String(f.skor)} onValueChange={(v) => setF({ ...f, skor: +v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{n} — {["Perlu perbaikan","Kurang","Cukup","Baik","Sangat baik"][n-1]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Catatan</Label><Textarea value={f.catatan} onChange={(e) => setF({ ...f, catatan: e.target.value })} /></div>
            </div>
            <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Batal</Button><Button onClick={save}>Simpan</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />
      {perilaku.length === 0 ? (
        <EmptyState icon={Heart} title="Belum ada penilaian" />
      ) : (
        <div className="space-y-2">
          {perilaku.map((p) => {
            const s = siswa.find((x) => x.id === p.siswaId);
            return (
              <div key={p.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
                <div>
                  <p className="font-semibold">{s?.nama} <Badge variant="outline" className="ml-1">{p.aspek}</Badge></p>
                  <p className="text-xs text-muted-foreground">{format(new Date(p.tanggal), "dd MMM yyyy", { locale: idLocale })}</p>
                  {p.catatan && <p className="mt-1 text-xs italic text-muted-foreground">"{p.catatan}"</p>}
                </div>
                <div className="flex gap-0.5">{[1,2,3,4,5].map((n) => <span key={n} className={n <= p.skor ? "text-gold" : "text-border"}>★</span>)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
