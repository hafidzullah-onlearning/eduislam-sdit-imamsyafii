import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB, genId } from "@/lib/mock-store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/materi")({ component: MateriPage });

interface Materi {
  id: string;
  judul: string;
  deskripsi: string;
  linkUrl: string;
  kelasId: string;
  mapelId: string;
  guruId: string;
  createdAt: string;
}

function MateriPage() {
  const { user } = useAuth();
  const kelas = useDB((s) => s.kelas);
  const mapel = useDB((s) => s.mapel);
  const myKelas = kelas.filter((k) => k.waliKelasId === user?.id);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ judul: "", deskripsi: "", linkUrl: "", kelasId: "", mapelId: "" });
  const [materiList, setMateriList] = useState<Materi[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("eduislam_materi");
    if (saved) {
      try {
        setMateriList(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save to localStorage when list changes
  const saveToStorage = (newList: Materi[]) => {
    setMateriList(newList);
    localStorage.setItem("eduislam_materi", JSON.stringify(newList));
  };

  const handleSave = () => {
    if (!form.judul || !form.kelasId || !form.mapelId) {
      return toast.error("Lengkapi semua field wajib");
    }

    const newMateri: Materi = {
      id: genId("materi"),
      judul: form.judul,
      deskripsi: form.deskripsi,
      linkUrl: form.linkUrl,
      kelasId: form.kelasId,
      mapelId: form.mapelId,
      guruId: user?.id ?? "",
      createdAt: new Date().toISOString(),
    };

    const newList = [...materiList, newMateri];
    saveToStorage(newList);
    toast.success("Materi berhasil dibagikan");
    setOpen(false);
    setForm({ judul: "", deskripsi: "", linkUrl: "", kelasId: "", mapelId: "" });
  };

  const handleDelete = (id: string) => {
    const newList = materiList.filter((m) => m.id !== id);
    saveToStorage(newList);
    toast.success("Materi berhasil dihapus");
  };

  // Filter list to show materials for classes the teacher manages
  const list = materiList.filter((m) => myKelas.some((k) => k.id === m.kelasId));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materi Pembelajaran"
        description="Bagikan materi, video, dan bahan bacaan ke kelas yang Anda ampu."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Materi baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Materi baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Judul Materi *</Label>
                  <Input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} placeholder="Contoh: Pengenalan Huruf Hijaiyah" />
                </div>
                <div className="space-y-1.5">
                  <Label>Deskripsi / Petunjuk</Label>
                  <Textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} placeholder="Berikan petunjuk belajar untuk siswa..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Mata Pelajaran *</Label>
                    <Select value={form.mapelId} onValueChange={(v) => setForm({ ...form, mapelId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {mapel.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Kelas Penerima *</Label>
                    <Select value={form.kelasId} onValueChange={(v) => setForm({ ...form, kelasId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {myKelas.map((k) => (
                          <SelectItem key={k.id} value={k.id}>
                            Kelas {k.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>URL Sumber (Drive / YouTube / PDF)</Label>
                  <Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSave}>Bagikan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {list.length === 0 ? (
        <EmptyState icon={BookOpen} title="Belum ada materi" description="Buat materi pertama Anda dan bagikan ke kelas." />
      ) : (
        <div className="space-y-3">
          {list.map((m) => {
            const k = kelas.find((x) => x.id === m.kelasId);
            const mp = mapel.find((x) => x.id === m.mapelId);
            return (
              <div key={m.id} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-foreground">{m.judul}</h3>
                      <Badge variant="outline">Kelas {k?.nama}</Badge>
                      <Badge variant="secondary">{mp?.nama}</Badge>
                    </div>
                    {m.deskripsi && <p className="mt-2 text-sm text-muted-foreground">{m.deskripsi}</p>}
                    {m.linkUrl && (
                      <div className="mt-3">
                        <a
                          href={m.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition"
                        >
                          Buka Materi Belajar ↗
                        </a>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-border/60 animate-in fade-in zoom-in-95 duration-200"
                    onClick={() => handleDelete(m.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
