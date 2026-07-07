import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDB, genId } from "@/lib/mock-store";
import { toast } from "sonner";
import { CalendarDays, Plus, Trash2, Check } from "lucide-react";

export const Route = createFileRoute("/app/admin/tahun-ajaran")({ component: TahunAjaranPage });

function TahunAjaranPage() {
  const tahunAjaranList = useDB((s) => s.tahunAjaran);
  const patch = useDB((s) => s.patch);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    aktif: false,
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [taToDelete, setTaToDelete] = useState<any>(null);

  const handleOpenAdd = () => {
    setForm({
      nama: "",
      aktif: false,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.nama) {
      return toast.error("Harap isi Nama Tahun Ajaran");
    }

    const namePattern = /^\d{4}\/\d{4}$/;
    if (!namePattern.test(form.nama)) {
      return toast.error("Format Tahun Ajaran harus YYYY/YYYY (Misal: 2026/2027)");
    }

    const exists = tahunAjaranList.some((t) => t.nama.trim() === form.nama.trim());
    if (exists) {
      return toast.error("Tahun Ajaran ini sudah terdaftar!");
    }

    const newTaId = genId("ta");
    const newTa = {
      id: newTaId,
      nama: form.nama.trim(),
      aktif: form.aktif,
    };

    if (form.aktif) {
      // If new year is active, set all others to inactive
      patch("tahunAjaran", (prev) => [...prev.map((t) => ({ ...t, aktif: false })), newTa]);
    } else {
      patch("tahunAjaran", (prev) => [...prev, newTa]);
    }

    toast.success(`Tahun Ajaran "${form.nama}" berhasil ditambahkan`);
    setOpen(false);
  };

  const handleSetActive = (ta: any) => {
    // Set selected TA to active, set all others to inactive
    patch("tahunAjaran", (prev) =>
      prev.map((t) => ({
        ...t,
        aktif: t.id === ta.id,
      })),
    );
    toast.success(`Tahun Ajaran "${ta.nama}" sekarang aktif`);
  };

  const handleOpenDelete = (ta: any) => {
    setTaToDelete(ta);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!taToDelete) return;
    if (taToDelete.aktif) {
      return toast.error("Tidak bisa menghapus Tahun Ajaran yang sedang aktif!");
    }
    patch("tahunAjaran", (prev) => prev.filter((t) => t.id !== taToDelete.id));
    toast.success(`Tahun Ajaran "${taToDelete.nama}" berhasil dihapus`);
    setDeleteOpen(false);
    setTaToDelete(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tahun Ajaran"
        description="Kelola periode tahun ajaran dan semester."
        actions={
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Tahun Ajaran
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tahunAjaranList.map((r) => (
          <div
            key={r.id}
            className={`rounded-2xl border bg-card p-5 shadow-soft transition relative flex flex-col justify-between h-40 ${
              r.aktif ? "border-primary/50 bg-primary/5" : "border-border/60"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Tahun Ajaran
                </p>
                <div className="flex gap-1">
                  {!r.aktif && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenDelete(r)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <h3 className="mt-2 text-2xl font-extrabold">{r.nama}</h3>
              {r.aktif ? (
                <Badge className="mt-3 bg-emerald-500 hover:bg-emerald-600">Aktif</Badge>
              ) : (
                <Badge variant="secondary" className="mt-3 bg-muted text-muted-foreground">
                  Nonaktif
                </Badge>
              )}
            </div>

            {!r.aktif && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSetActive(r)}
                className="w-full mt-2 text-xs h-8 border-border/80 hover:border-primary/50 hover:bg-primary/5"
              >
                <Check className="mr-1 h-3 w-3" /> Set Aktif
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Dialog Add Tahun Ajaran */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg flex items-center gap-1.5">
              <CalendarDays className="h-5 w-5 text-primary" />
              Tambah Tahun Ajaran Baru
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nama" className="text-xs font-semibold">
                Tahun Ajaran (Format: YYYY/YYYY)
              </Label>
              <Input
                id="nama"
                placeholder="Misal: 2026/2027"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="aktif"
                checked={form.aktif}
                onCheckedChange={(checked) => setForm({ ...form, aktif: !!checked })}
              />
              <Label htmlFor="aktif" className="text-xs font-semibold cursor-pointer select-none">
                Jadikan sebagai Tahun Ajaran Aktif
              </Label>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 pt-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive font-bold">
              Hapus Tahun Ajaran?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus tahun ajaran <strong>{taToDelete?.nama}</strong>?
              <br />
              <span className="text-xs text-destructive mt-1 block">
                Tindakan ini tidak dapat dibatalkan. Kelas yang terkait dengan periode ini akan
                kehilangan asosiasi tahun ajaran mereka.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
