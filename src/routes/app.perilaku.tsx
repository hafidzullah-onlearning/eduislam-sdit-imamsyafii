import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB, genId, useLazyLoadTables } from "@/lib/mock-store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/app/perilaku")({ component: PerilakuPage });

function PerilakuPage() {
  const loading = useLazyLoadTables(["perilaku"]);
  const { user, session } = useAuth();
  const perilaku = useDB((s) => s.perilaku);
  const siswa = useDB((s) => s.siswa);
  const kelas = useDB((s) => s.kelas);
  const patch = useDB((s) => s.patch);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    siswaId: "",
    aspek: "karakter-islami" as const,
    skor: 4,
    catatan: "",
  });

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const isGuru = session?.role === "guru";
  const isOrtu = session?.role === "ortu";

  const myKelas = kelas.filter((k) => k.waliKelasId === user?.id);
  const mySiswa = isGuru
    ? siswa.filter((s) => s.status !== "nonaktif" && myKelas.some((k) => k.id === s.kelasId))
    : siswa.filter(
        (s) =>
          s.orangTuaId === user?.id && s.status !== "nonaktif" && s.id === session?.activeSiswaId,
      );

  const filteredPerilaku = perilaku.filter((p) => mySiswa.some((s) => s.id === p.siswaId));

  const aspectStats = isOrtu
    ? ["karakter-islami", "disiplin", "keaktifan", "kerjasama"].map((asp) => {
        const list = filteredPerilaku.filter((p) => p.aspek === asp);
        const avg = list.length ? list.reduce((sum, p) => sum + p.skor, 0) / list.length : 0;
        return { aspek: asp, avg, count: list.length };
      })
    : [];

  const save = () => {
    if (!f.siswaId) return toast.error("Pilih siswa");
    patch("perilaku", (items) => [
      ...items,
      { id: genId("p"), ...f, tanggal: new Date().toISOString(), guruId: user!.id },
    ]);
    toast.success("Penilaian tersimpan");
    setOpen(false);
    setF({ siswaId: "", aspek: "karakter-islami", skor: 4, catatan: "" });
  };

  const getAspectLabel = (asp: string) => {
    switch (asp) {
      case "karakter-islami":
        return "Karakter Islami";
      case "disiplin":
        return "Disiplin";
      case "keaktifan":
        return "Keaktifan";
      case "kerjasama":
        return "Kerjasama";
      default:
        return asp;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perilaku & Karakter"
        description={
          isOrtu
            ? "Pantau perkembangan adab, disiplin, dan karakter Islami anak Anda."
            : "Nilai karakter Islami, disiplin, keaktifan, dan kerjasama siswa."
        }
        actions={
          isGuru && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" /> Nilai baru
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Input penilaian perilaku</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Siswa</Label>
                    <Select value={f.siswaId} onValueChange={(v) => setF({ ...f, siswaId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {mySiswa.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Aspek</Label>
                    <Select value={f.aspek} onValueChange={(v: any) => setF({ ...f, aspek: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="karakter-islami">Karakter Islami</SelectItem>
                        <SelectItem value="disiplin">Disiplin</SelectItem>
                        <SelectItem value="keaktifan">Keaktifan</SelectItem>
                        <SelectItem value="kerjasama">Kerjasama</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Skor (1-5)</Label>
                    <Select value={String(f.skor)} onValueChange={(v) => setF({ ...f, skor: +v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} —{" "}
                            {["Perlu perbaikan", "Kurang", "Cukup", "Baik", "Sangat baik"][n - 1]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Catatan</Label>
                    <Textarea
                      value={f.catatan}
                      onChange={(e) => setF({ ...f, catatan: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={save}>Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }
      />

      {isOrtu && filteredPerilaku.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {aspectStats.map((item) => (
            <div
              key={item.aspek}
              className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft"
            >
              <p className="text-xs font-semibold text-muted-foreground">
                {getAspectLabel(item.aspek)}
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold">{item.avg ? item.avg.toFixed(1) : "-"}</span>
                <span className="text-xs text-muted-foreground">/ 5</span>
              </div>
              <Progress value={item.avg * 20} className="mt-2 h-2" />
              <p className="mt-1 text-[10px] text-muted-foreground">Dari {item.count} penilaian</p>
            </div>
          ))}
        </div>
      )}

      {filteredPerilaku.length === 0 ? (
        <EmptyState icon={Heart} title="Belum ada penilaian" />
      ) : (
        <div className="space-y-2">
          {filteredPerilaku.map((p) => {
            const s = siswa.find((x) => x.id === p.siswaId);
            return (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-soft"
              >
                <div>
                  <p className="font-semibold">
                    {s?.nama}{" "}
                    <Badge variant="outline" className="ml-1">
                      {getAspectLabel(p.aspek)}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(p.tanggal), "dd MMM yyyy", { locale: idLocale })}
                  </p>
                  {p.catatan && (
                    <p className="mt-1 text-xs italic text-muted-foreground">"{p.catatan}"</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={n <= p.skor ? "text-gold" : "text-border"}>
                        ★
                      </span>
                    ))}
                  </div>
                  {isGuru && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        patch("perilaku", (items) => items.filter((x) => x.id !== p.id));
                        toast.success("Penilaian perilaku dihapus");
                      }}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
