import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Edit2, Trash2, Plus, Layers } from "lucide-react";

export const Route = createFileRoute("/app/admin/spp")({ component: SppTarifPage });

function SppTarifPage() {
  const sppTarifList = useDB((s) => s.sppTarif);
  const tahunAjaranList = useDB((s) => s.tahunAjaran);
  const patch = useDB((s) => s.patch);

  const [open, setOpen] = useState(false);
  const [editingTarif, setEditingTarif] = useState<any>(null);
  const [form, setForm] = useState({
    tingkat: 1,
    jumlah: 0,
    tahunAjaranId: "",
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [tarifToDelete, setTarifToDelete] = useState<any>(null);

  const handleOpenAdd = () => {
    setEditingTarif(null);
    setForm({
      tingkat: 1,
      jumlah: 800000,
      tahunAjaranId: tahunAjaranList.find((t) => t.aktif)?.id || tahunAjaranList[0]?.id || "",
    });
    setOpen(true);
  };

  const handleOpenEdit = (t: any) => {
    setEditingTarif(t);
    setForm({
      tingkat: t.tingkat,
      jumlah: t.jumlah,
      tahunAjaranId: t.tahunAjaranId || "",
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.tingkat || !form.jumlah || !form.tahunAjaranId) {
      return toast.error("Harap isi Tingkat, Nominal Tarif, dan Tahun Ajaran");
    }

    const dupExists = sppTarifList.some(
      (t) =>
        t.tingkat === Number(form.tingkat) &&
        t.tahunAjaranId === form.tahunAjaranId &&
        (!editingTarif || t.id !== editingTarif.id)
    );
    if (dupExists) {
      const yearName = tahunAjaranList.find((y) => y.id === form.tahunAjaranId)?.nama || "";
      return toast.error(`Tarif untuk Tingkat ${form.tingkat} pada Tahun Ajaran ${yearName} sudah terdaftar!`);
    }

    if (editingTarif) {
      patch("sppTarif", (prev) =>
        prev.map((t) =>
          t.id === editingTarif.id
            ? {
                ...t,
                tingkat: Number(form.tingkat),
                jumlah: Number(form.jumlah),
                tahunAjaranId: form.tahunAjaranId,
              }
            : t
        )
      );
      toast.success(`Tarif tingkat ${form.tingkat} berhasil diperbarui`);
    } else {
      const newTarifId = genId("spp");
      const newTarif = {
        id: newTarifId,
        tingkat: Number(form.tingkat),
        jumlah: Number(form.jumlah),
        tahunAjaranId: form.tahunAjaranId,
      };
      patch("sppTarif", (prev) => [...prev, newTarif]);
      toast.success(`Tarif tingkat ${form.tingkat} berhasil ditambahkan`);
    }
    setOpen(false);
  };

  const handleOpenDelete = (t: any) => {
    setTarifToDelete(t);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!tarifToDelete) return;
    patch("sppTarif", (prev) => prev.filter((t) => t.id !== tarifToDelete.id));
    toast.success(`Tarif SPP berhasil dihapus`);
    setDeleteOpen(false);
    setTarifToDelete(null);
  };

  // Sort SPP tariff by academic year name and then tingkat
  const sortedTarifList = [...sppTarifList].sort((a, b) => {
    const ya = tahunAjaranList.find((t) => t.id === a.tahunAjaranId)?.nama || "";
    const yb = tahunAjaranList.find((t) => t.id === b.tahunAjaranId)?.nama || "";
    if (ya !== yb) return yb.localeCompare(ya); // latest year first
    return a.tingkat - b.tingkat;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarif SPP"
        description="Kelola tarif SPP per tingkat."
        actions={
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Tarif Baru
          </Button>
        }
      />

      <div className="rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft/50">
              <TableHead>Tingkat</TableHead>
              <TableHead>Jenis SPP</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Tahun Ajaran</TableHead>
              <TableHead className="w-[120px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTarifList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Tidak ada data tarif SPP ditemukan
                </TableCell>
              </TableRow>
            ) : (
              sortedTarifList.map((t) => {
                const year = tahunAjaranList.find((y) => y.id === t.tahunAjaranId);
                return (
                  <TableRow key={t.id} className="hover:bg-surface-soft/30 transition">
                    <TableCell className="font-semibold">Tingkat {t.tingkat} (Kelas {t.tingkat})</TableCell>
                    <TableCell>SPP Bulanan</TableCell>
                    <TableCell>Rp {t.jumlah.toLocaleString("id-ID")}</TableCell>
                    <TableCell>{year ? `Tahun ${year.nama}` : "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenEdit(t)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenDelete(t)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Add/Edit SPP Tarif */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg flex items-center gap-1.5">
              <Layers className="h-5 w-5 text-primary" />
              {editingTarif ? `Edit Tarif SPP` : "Tambah Tarif SPP Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tingkat Kelas</Label>
              <Select
                value={String(form.tingkat)}
                onValueChange={(v) => setForm({ ...form, tingkat: Number(v) })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Tingkat" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((lvl) => (
                    <SelectItem key={lvl} value={String(lvl)}>
                      Tingkat {lvl} (Kelas {lvl})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jumlah" className="text-xs font-semibold">Nominal SPP (Rupiah)</Label>
              <Input
                id="jumlah"
                type="number"
                min={0}
                placeholder="Misal: 800000"
                value={form.jumlah}
                onChange={(e) => setForm({ ...form, jumlah: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tahun Ajaran</Label>
              <Select
                value={form.tahunAjaranId}
                onValueChange={(v) => setForm({ ...form, tahunAjaranId: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Tahun Ajaran" />
                </SelectTrigger>
                <SelectContent>
                  {tahunAjaranList.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      Tahun {t.nama} {t.aktif ? "(Aktif)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 pt-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {editingTarif ? "Simpan Perubahan" : "Tambah Tarif"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tarif Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive font-bold">Hapus Tarif SPP?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus tarif SPP tingkat <strong>{tarifToDelete?.tingkat}</strong>?
              <br />
              <span className="text-xs text-destructive mt-1 block">
                Tindakan ini tidak dapat dibatalkan.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

