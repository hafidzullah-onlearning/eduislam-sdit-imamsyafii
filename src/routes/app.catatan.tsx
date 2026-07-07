import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB, genId } from "@/lib/mock-store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/app/catatan")({ component: CatatanPage });

function CatatanPage() {
  const { session } = useAuth();
  if (session?.role === "guru") return <GuruCatatan />;
  return <OrtuCatatan />;
}

/* -------------------------- GURU -------------------------- */
function GuruCatatan() {
  const { user } = useAuth();
  const catatan = useDB((s) => s.catatan);
  const siswa = useDB((s) => s.siswa);
  const kelas = useDB((s) => s.kelas);
  const patch = useDB((s) => s.patch);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ siswaId: "", tipe: "positif" as const, isi: "" });

  const myKelas = kelas.filter((k) => k.waliKelasId === user?.id);
  const mySiswa = siswa.filter(
    (s) => s.status !== "nonaktif" && myKelas.some((k) => k.id === s.kelasId),
  );

  const list = catatan.filter((c) => mySiswa.some((s) => s.id === c.siswaId));

  const save = () => {
    if (!form.siswaId || !form.isi) return toast.error("Lengkapi field wajib");
    patch("catatan", (items) => [
      ...items,
      {
        id: genId("c"),
        ...form,
        tanggal: new Date().toISOString(),
        guruId: user!.id,
      },
    ]);
    toast.success("Catatan berhasil disimpan");
    setOpen(false);
    setForm({ siswaId: "", tipe: "positif", isi: "" });
  };

  const remove = (id: string) => {
    patch("catatan", (items) => items.filter((x) => x.id !== id));
    toast.success("Catatan dihapus");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catatan Perkembangan Siswa"
        description="Berikan feedback, apresiasi, atau perhatian khusus untuk wali murid."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Catatan baru
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat catatan baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Siswa *</Label>
                  <Select
                    value={form.siswaId}
                    onValueChange={(v) => setForm({ ...form, siswaId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih siswa" />
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
                  <Label>Tipe *</Label>
                  <Select
                    value={form.tipe}
                    onValueChange={(v: any) => setForm({ ...form, tipe: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positif">Positif / Apresiasi</SelectItem>
                      <SelectItem value="perlu-perhatian">Perlu Perhatian</SelectItem>
                      <SelectItem value="info">Informasi Umum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Isi Catatan *</Label>
                  <Textarea
                    value={form.isi}
                    onChange={(e) => setForm({ ...form, isi: e.target.value })}
                    placeholder="Tuliskan perkembangan positif atau hal yang perlu diperhatikan..."
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
        }
      />

      {list.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Belum ada catatan"
          description="Buat catatan pertama untuk memberikan apresiasi."
        />
      ) : (
        <div className="space-y-3">
          {list
            .slice()
            .reverse()
            .map((c) => {
              const s = siswa.find((x) => x.id === c.siswaId);
              return (
                <div
                  key={c.id}
                  className={`flex items-start justify-between rounded-2xl border p-5 shadow-soft ${
                    c.tipe === "positif"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : c.tipe === "perlu-perhatian"
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-border/60 bg-card"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{s?.nama}</span>
                      <Badge
                        variant={
                          c.tipe === "positif"
                            ? "default"
                            : c.tipe === "perlu-perhatian"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {c.tipe === "positif"
                          ? "Apresiasi"
                          : c.tipe === "perlu-perhatian"
                            ? "Perhatian"
                            : "Info"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-foreground/90">{c.isi}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {format(new Date(c.tanggal), "EEEE, dd MMMM yyyy", { locale: idLocale })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => remove(c.id)}
                  >
                    Hapus
                  </Button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

/* -------------------------- ORTU -------------------------- */
function OrtuCatatan() {
  const { user, session } = useAuth();
  const siswa = useDB((s) => s.siswa);
  const catatan = useDB((s) => s.catatan);
  const anak = siswa
    .filter((s) => s.orangTuaId === user?.id && s.status !== "nonaktif")
    .find((k) => k.id === session?.activeSiswaId);
  const list = anak ? catatan.filter((c) => c.siswaId === anak.id) : [];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Catatan Guru"
        description={`Perhatian dan apresiasi wali kelas untuk ${anak?.nama ?? "anak Anda"}.`}
      />
      {list.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Belum ada catatan" />
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <div
              key={c.id}
              className={`rounded-2xl border p-5 shadow-soft ${c.tipe === "positif" ? "border-emerald-500/30 bg-emerald-500/5" : c.tipe === "perlu-perhatian" ? "border-amber-500/30 bg-amber-500/5" : "border-border/60 bg-card"}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {c.tipe.replace("-", " ")}
              </p>
              <p className="mt-2">{c.isi}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {format(new Date(c.tanggal), "EEEE, dd MMMM yyyy", { locale: idLocale })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
