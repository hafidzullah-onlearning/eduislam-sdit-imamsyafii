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
import { Edit2, Trash2, Plus, School } from "lucide-react";

export const Route = createFileRoute("/app/admin/kelas")({ component: KelasPage });

function KelasPage() {
  const kelas = useDB((s) => s.kelas);
  const users = useDB((s) => s.users);
  const siswa = useDB((s) => s.siswa);
  const tahunAjaranList = useDB((s) => s.tahunAjaran);
  const patch = useDB((s) => s.patch);

  const [open, setOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<any>(null);
  const [form, setForm] = useState({
    nama: "",
    tingkat: 1,
    waliKelasId: "",
    tahunAjaran: "",
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [kelasToDelete, setKelasToDelete] = useState<any>(null);

  const gurus = users.filter((u) => u.role === "guru");

  const handleOpenAdd = () => {
    setEditingKelas(null);
    setForm({
      nama: "",
      tingkat: 1,
      waliKelasId: gurus[0]?.id || "",
      tahunAjaran:
        tahunAjaranList.find((t) => t.aktif)?.nama || tahunAjaranList[0]?.nama || "2025/2026",
    });
    setOpen(true);
  };

  const handleOpenEdit = (k: any) => {
    setEditingKelas(k);
    setForm({
      nama: k.nama,
      tingkat: k.tingkat,
      waliKelasId: k.waliKelasId || "",
      tahunAjaran: k.tahunAjaran || "",
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.nama || !form.tingkat) {
      return toast.error("Harap isi Nama Kelas dan Tingkat");
    }

    if (editingKelas) {
      patch("kelas", (prev) =>
        prev.map((k) =>
          k.id === editingKelas.id
            ? {
                ...k,
                nama: form.nama,
                tingkat: Number(form.tingkat),
                waliKelasId: form.waliKelasId,
                tahunAjaran: form.tahunAjaran,
              }
            : k,
        ),
      );
      toast.success(`Kelas "${form.nama}" berhasil diperbarui`);
    } else {
      const newKelasId = genId("k");
      const newKelas = {
        id: newKelasId,
        nama: form.nama,
        tingkat: Number(form.tingkat),
        waliKelasId: form.waliKelasId,
        tahunAjaran: form.tahunAjaran,
      };
      patch("kelas", (prev) => [...prev, newKelas]);
      toast.success(`Kelas "${form.nama}" berhasil ditambahkan`);
    }
    setOpen(false);
  };

  const handleOpenDelete = (k: any) => {
    setKelasToDelete(k);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!kelasToDelete) return;
    patch("kelas", (prev) => prev.filter((k) => k.id !== kelasToDelete.id));
    toast.success(`Kelas "${kelasToDelete.nama}" berhasil dihapus`);
    setDeleteOpen(false);
    setKelasToDelete(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Kelas"
        description="Kelola kelas dan wali kelas."
        actions={
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Kelas Baru
          </Button>
        }
      />

      <div className="rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft/50">
              <TableHead>Nama</TableHead>
              <TableHead>Tingkat</TableHead>
              <TableHead>Wali Kelas</TableHead>
              <TableHead>Jumlah Siswa</TableHead>
              <TableHead>Tahun Ajaran</TableHead>
              <TableHead className="w-[120px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kelas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Tidak ada data kelas ditemukan
                </TableCell>
              </TableRow>
            ) : (
              kelas.map((k) => (
                <TableRow key={k.id} className="hover:bg-surface-soft/30 transition">
                  <TableCell className="font-semibold">Kelas {k.nama}</TableCell>
                  <TableCell>{k.tingkat}</TableCell>
                  <TableCell>{users.find((u) => u.id === k.waliKelasId)?.name || "—"}</TableCell>
                  <TableCell>{siswa.filter((s) => s.kelasId === k.id).length} siswa</TableCell>
                  <TableCell>{k.tahunAjaran}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(k)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenDelete(k)}
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

      {/* Dialog Add/Edit Kelas */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg flex items-center gap-1.5">
              <School className="h-5 w-5 text-primary" />
              {editingKelas ? `Edit Kelas: ${editingKelas.nama}` : "Tambah Kelas Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nama" className="text-xs font-semibold">
                Nama Kelas
              </Label>
              <Input
                id="nama"
                placeholder="Misal: 3A, 4B, 1-Tahfidz"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tingkat" className="text-xs font-semibold">
                Tingkat Sekolah
              </Label>
              <Input
                id="tingkat"
                type="number"
                min={1}
                max={6}
                value={form.tingkat}
                onChange={(e) => setForm({ ...form, tingkat: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Wali Kelas</Label>
              <Select
                value={form.waliKelasId}
                onValueChange={(v) => setForm({ ...form, waliKelasId: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Wali Kelas" />
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

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tahun Ajaran</Label>
              <Select
                value={form.tahunAjaran}
                onValueChange={(v) => setForm({ ...form, tahunAjaran: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Tahun Ajaran" />
                </SelectTrigger>
                <SelectContent>
                  {tahunAjaranList.map((t) => (
                    <SelectItem key={t.id} value={t.nama}>
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
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {editingKelas ? "Simpan Perubahan" : "Tambah Kelas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Kelas Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive font-bold">
              Hapus Data Kelas?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus data kelas{" "}
              <strong>Kelas {kelasToDelete?.nama}</strong>?
              <br />
              <span className="text-xs text-destructive mt-1 block">
                Tindakan ini tidak dapat dibatalkan. Murid yang terdaftar pada kelas ini akan
                kehilangan asosiasi kelas mereka.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Hapus Kelas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
