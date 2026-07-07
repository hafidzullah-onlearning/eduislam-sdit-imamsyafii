import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/common/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Edit2, Trash2, Plus, BookOpen } from "lucide-react";

export const Route = createFileRoute("/app/admin/mapel")({ component: MapelPage });

function MapelPage() {
  const mapel = useDB((s) => s.mapel);
  const users = useDB((s) => s.users);
  const patch = useDB((s) => s.patch);

  const [open, setOpen] = useState(false);
  const [editingMapel, setEditingMapel] = useState<any>(null);
  const [form, setForm] = useState({
    nama: "",
    kode: "",
    guruId: "",
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mapelToDelete, setMapelToDelete] = useState<any>(null);

  const gurus = users.filter((u) => u.role === "guru");

  const handleOpenAdd = () => {
    setEditingMapel(null);
    setForm({
      nama: "",
      kode: "",
      guruId: gurus[0]?.id || "",
    });
    setOpen(true);
  };

  const handleOpenEdit = (m: any) => {
    setEditingMapel(m);
    setForm({
      nama: m.nama,
      kode: m.kode,
      guruId: m.guruId || "",
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.nama || !form.kode) {
      return toast.error("Harap isi Nama Mapel dan Kode");
    }

    const codeUpper = form.kode.toUpperCase().trim();

    // Validate code uniqueness
    const codeExists = mapel.some(
      (m) => m.kode.toUpperCase() === codeUpper && (!editingMapel || m.id !== editingMapel.id),
    );
    if (codeExists) {
      return toast.error("Kode Mata Pelajaran sudah terdaftar! Harap gunakan kode unik.");
    }

    if (editingMapel) {
      patch("mapel", (prev) =>
        prev.map((m) =>
          m.id === editingMapel.id
            ? { ...m, nama: form.nama, kode: codeUpper, guruId: form.guruId }
            : m,
        ),
      );
      toast.success(`Mata Pelajaran "${form.nama}" berhasil diperbarui`);
    } else {
      const newMapelId = genId("m");
      const newMapel = {
        id: newMapelId,
        nama: form.nama,
        kode: codeUpper,
        guruId: form.guruId,
      };
      patch("mapel", (prev) => [...prev, newMapel]);
      toast.success(`Mata Pelajaran "${form.nama}" berhasil ditambahkan`);
    }
    setOpen(false);
  };

  const handleOpenDelete = (m: any) => {
    setMapelToDelete(m);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!mapelToDelete) return;
    patch("mapel", (prev) => prev.filter((m) => m.id !== mapelToDelete.id));
    toast.success(`Mata Pelajaran "${mapelToDelete.nama}" berhasil dihapus`);
    setDeleteOpen(false);
    setMapelToDelete(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Mata Pelajaran"
        description="Kelola mata pelajaran dan pengampu."
        actions={
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Mapel Baru
          </Button>
        }
      />

      <div className="rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft/50">
              <TableHead className="w-[150px]">Kode</TableHead>
              <TableHead>Mata Pelajaran</TableHead>
              <TableHead>Pengampu (Guru)</TableHead>
              <TableHead className="w-[120px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mapel.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Tidak ada data mata pelajaran ditemukan
                </TableCell>
              </TableRow>
            ) : (
              mapel.map((m) => (
                <TableRow key={m.id} className="hover:bg-surface-soft/30 transition">
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-mono bg-surface-soft text-foreground border-border/60"
                    >
                      {m.kode}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{m.nama}</TableCell>
                  <TableCell>{users.find((u) => u.id === m.guruId)?.name || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(m)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenDelete(m)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Add/Edit Mapel */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg flex items-center gap-1.5">
              <BookOpen className="h-5 w-5 text-primary" />
              {editingMapel ? `Edit Mapel: ${editingMapel.nama}` : "Tambah Mapel Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nama" className="text-xs font-semibold">
                Nama Mata Pelajaran
              </Label>
              <Input
                id="nama"
                placeholder="Misal: Bahasa Arab, Fiqih, Sejarah Islam"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kode" className="text-xs font-semibold">
                Kode Singkatan
              </Label>
              <Input
                id="kode"
                placeholder="Misal: ARB, FIQ, SKI"
                value={form.kode}
                onChange={(e) => setForm({ ...form, kode: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Guru Pengampu</Label>
              <Select value={form.guruId} onValueChange={(v) => setForm({ ...form, guruId: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Guru Pengampu" />
                </SelectTrigger>
                <SelectContent>
                  {gurus.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
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
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {editingMapel ? "Simpan Perubahan" : "Tambah Mapel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Mapel Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive font-bold">
              Hapus Mata Pelajaran?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus mata pelajaran{" "}
              <strong>{mapelToDelete?.nama}</strong> ({mapelToDelete?.kode})?
              <br />
              <span className="text-xs text-destructive mt-1 block">
                Tindakan ini tidak dapat dibatalkan. Riwayat tugas atau nilai terkait mata pelajaran
                ini juga dapat terpengaruh.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Hapus Mapel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
