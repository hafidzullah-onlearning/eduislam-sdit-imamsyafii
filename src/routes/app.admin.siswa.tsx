import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDB, genId } from "@/lib/mock-store";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Search, Plus, Edit2, Trash2, Baby, UserPlus, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/app/admin/siswa")({
  component: AdminSiswaPage,
});

function AdminSiswaPage() {
  const siswa = useDB((s) => s.siswa);
  const kelas = useDB((s) => s.kelas);
  const users = useDB((s) => s.users);
  const patch = useDB((s) => s.patch);

  // States
  const [q, setQ] = useState("");
  const [selectedKelasId, setSelectedKelasId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [open, setOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<any>(null); // null if adding

  const [form, setForm] = useState({
    nis: "",
    nama: "",
    jenisKelamin: "L" as "L" | "P",
    tanggalLahir: "",
    kelasId: "",
    status: "aktif" as "aktif" | "nonaktif",
    parentMode: "select" as "select" | "create", // 'select' existing or 'create' new parent
    orangTuaId: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siswaToDelete, setSiswaToDelete] = useState<any>(null);

  // Filter list
  const filteredList = useMemo(() => {
    return siswa.filter((s) => {
      const matchesSearch = s.nama.toLowerCase().includes(q.toLowerCase()) || s.nis.includes(q);
      const matchesKelas = selectedKelasId === "all" || s.kelasId === selectedKelasId;
      const matchesStatus = selectedStatus === "all" || s.status === selectedStatus;
      return matchesSearch && matchesKelas && matchesStatus;
    });
  }, [siswa, q, selectedKelasId, selectedStatus]);

  // Open add modal
  const handleOpenAdd = () => {
    setEditingSiswa(null);
    setForm({
      nis: "",
      nama: "",
      jenisKelamin: "L",
      tanggalLahir: "",
      kelasId: kelas[0]?.id || "",
      status: "aktif",
      parentMode: "select",
      orangTuaId: users.find((u) => u.role === "ortu")?.id || "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
    });
    setOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (s: any) => {
    setEditingSiswa(s);
    setForm({
      nis: s.nis,
      nama: s.nama,
      jenisKelamin: s.jenisKelamin,
      tanggalLahir: s.tanggalLahir || "",
      kelasId: s.kelasId || "",
      status: s.status || "aktif",
      parentMode: "select",
      orangTuaId: s.orangTuaId || "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
    });
    setOpen(true);
  };

  // Open delete confirm dialog
  const handleOpenDelete = (s: any) => {
    setSiswaToDelete(s);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!siswaToDelete) return;
    patch("siswa", (prev) => prev.filter((s) => s.id !== siswaToDelete.id));
    toast.success(`Data siswa "${siswaToDelete.nama}" berhasil dihapus`);
    setDeleteDialogOpen(false);
    setSiswaToDelete(null);
  };

  const handleSave = () => {
    // Validations
    if (!form.nis || !form.nama || !form.kelasId) {
      return toast.error("Harap isi NIS, Nama, dan Kelas");
    }

    // NIS uniqueness validation
    const isNisTaken = siswa.some(
      (s) => s.nis === form.nis && (!editingSiswa || s.id !== editingSiswa.id),
    );
    if (isNisTaken) {
      return toast.error("NIS sudah terdaftar! Harap gunakan NIS unik.");
    }

    let finalOrangTuaId = form.orangTuaId;

    // Create new parent account if in 'create' mode
    if (form.parentMode === "create") {
      if (!form.parentName || !form.parentEmail) {
        return toast.error("Harap lengkapi Nama dan Email Orang Tua Baru");
      }

      const emailExists = users.some(
        (u) => u.email.toLowerCase() === form.parentEmail.toLowerCase(),
      );
      if (emailExists) {
        return toast.error("Email Orang Tua sudah digunakan. Harap gunakan email lain.");
      }

      const newParentId = genId("u-ortu");
      const newParent = {
        id: newParentId,
        name: form.parentName,
        email: form.parentEmail,
        role: "ortu" as const,
        phone: form.parentPhone || undefined,
      };

      // Patch the users store immediately
      patch("users", (prev) => [...prev, newParent]);
      finalOrangTuaId = newParentId;
      toast.success(`Akun orang tua "${form.parentName}" berhasil dibuat`);
    }

    if (editingSiswa) {
      // Update existing student
      patch("siswa", (prev) =>
        prev.map((s) =>
          s.id === editingSiswa.id
            ? {
                ...s,
                nis: form.nis,
                nama: form.nama,
                jenisKelamin: form.jenisKelamin,
                tanggalLahir: form.tanggalLahir,
                kelasId: form.kelasId,
                orangTuaId: finalOrangTuaId,
                status: form.status,
              }
            : s,
        ),
      );
      toast.success(`Data siswa "${form.nama}" berhasil diperbarui`);
    } else {
      // Add new student
      const newSiswaId = genId("s");
      const newSiswa = {
        id: newSiswaId,
        nis: form.nis,
        nama: form.nama,
        jenisKelamin: form.jenisKelamin,
        tanggalLahir: form.tanggalLahir,
        kelasId: form.kelasId,
        orangTuaId: finalOrangTuaId,
        status: form.status,
      };
      patch("siswa", (prev) => [...prev, newSiswa]);
      toast.success(`Siswa "${form.nama}" berhasil ditambahkan`);
    }

    setOpen(false);
  };

  const parents = useMemo(() => users.filter((u) => u.role === "ortu"), [users]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Master Data"
        title="Kelola Siswa"
        description="Manajemen data murid, pembagian kelas, dan akun orang tua pendamping."
        actions={
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Tambah Siswa
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
        <div className="flex flex-1 min-w-[280px] max-w-md items-center gap-2 rounded-xl border border-border/60 bg-surface-soft px-3 py-1.5 focus-within:border-primary/50">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Cari nama atau NIS siswa..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Filter Kelas:</Label>
            <Select value={selectedKelasId} onValueChange={setSelectedKelasId}>
              <SelectTrigger className="w-[140px] bg-card">
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {kelas.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    Kelas {k.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Status:</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[130px] bg-card">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft/50">
              <TableHead className="w-[120px]">NIS</TableHead>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead className="w-[100px]">Kelas</TableHead>
              <TableHead className="w-[120px]">Jenis Kelamin</TableHead>
              <TableHead>Orang Tua (Wali)</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[100px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Baby className="h-10 w-10 text-muted-foreground/50" />
                    <p className="font-semibold text-sm">Tidak ada data siswa ditemukan</p>
                    <p className="text-xs">
                      Coba ubah kata kunci pencarian atau filter kelas Anda.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((s) => {
                const k = kelas.find((x) => x.id === s.kelasId);
                const parent = users.find((u) => u.id === s.orangTuaId);
                return (
                  <TableRow key={s.id} className="hover:bg-surface-soft/30 transition">
                    <TableCell className="font-mono text-xs font-semibold">{s.nis}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{s.nama}</p>
                        {s.tanggalLahir && (
                          <p className="text-[10px] text-muted-foreground">
                            Lahir:{" "}
                            {format(new Date(s.tanggalLahir), "dd MMMM yyyy", { locale: idLocale })}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-primary/20 bg-primary/5 text-primary text-xs font-bold px-2 py-0.5"
                      >
                        Kelas {k ? k.nama : "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.jenisKelamin === "L" ? "bg-blue-500/10 text-blue-700" : "bg-pink-500/10 text-pink-700"}`}
                      >
                        {s.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {parent ? (
                        <div>
                          <p className="text-sm font-medium">{parent.name}</p>
                          <p className="text-xs text-muted-foreground">{parent.email || "—"}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">
                          Belum terhubung
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          s.status === "aktif"
                            ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }
                      >
                        {s.status === "aktif" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenEdit(s)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenDelete(s)}
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

      {/* Dialog Form Tambah / Edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <GraduationCap className="h-5 w-5 text-primary" />
              {editingSiswa ? `Edit Siswa: ${editingSiswa.nama}` : "Tambah Murid Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Informasi Akademis & Profil
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nis" className="text-xs font-semibold">
                  NIS (Nomor Induk Siswa)
                </Label>
                <Input
                  id="nis"
                  placeholder="Misal: 24001"
                  value={form.nis}
                  onChange={(e) => setForm({ ...form, nis: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nama" className="text-xs font-semibold">
                  Nama Lengkap Siswa
                </Label>
                <Input
                  id="nama"
                  placeholder="Misal: Muhammad Faris"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-1">
                <Label className="text-xs font-semibold">Jenis Kelamin</Label>
                <Select
                  value={form.jenisKelamin}
                  onValueChange={(v: "L" | "P") => setForm({ ...form, jenisKelamin: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="tanggalLahir" className="text-xs font-semibold">
                  Tanggal Lahir
                </Label>
                <Input
                  id="tanggalLahir"
                  type="date"
                  value={form.tanggalLahir}
                  onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 col-span-1">
                <Label className="text-xs font-semibold">Kelas</Label>
                <Select
                  value={form.kelasId}
                  onValueChange={(v) => setForm({ ...form, kelasId: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kelas.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        Kelas {k.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Status Keaktifan</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: "aktif" | "nonaktif") => setForm({ ...form, status: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="nonaktif">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t border-border/60 my-4 pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                <UserPlus className="h-4 w-4" /> Penghubung Orang Tua / Wali
              </h4>

              <Tabs
                value={form.parentMode}
                onValueChange={(v: any) => setForm({ ...form, parentMode: v })}
                className="w-full space-y-3"
              >
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="select" className="text-xs">
                    Hubungkan Akun Terdaftar
                  </TabsTrigger>
                  <TabsTrigger value="create" className="text-xs">
                    Buat Akun Wali Baru
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="select" className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Pilih Wali Murid</Label>
                    <Select
                      value={form.orangTuaId}
                      onValueChange={(v) => setForm({ ...form, orangTuaId: v })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Orang Tua" />
                      </SelectTrigger>
                      <SelectContent>
                        {parents.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.email || "Tanpa Email"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent
                  value="create"
                  className="space-y-3 rounded-xl border border-dashed border-border p-3 bg-surface-soft/45"
                >
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="parentName" className="text-[11px] font-semibold">
                        Nama Lengkap Orang Tua
                      </Label>
                      <Input
                        id="parentName"
                        placeholder="Misal: Bapak Ridwan"
                        value={form.parentName}
                        onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                        className="bg-card"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="parentEmail" className="text-[11px] font-semibold">
                          Email (Untuk Login)
                        </Label>
                        <Input
                          id="parentEmail"
                          type="email"
                          placeholder="ridwan@email.com"
                          value={form.parentEmail}
                          onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                          className="bg-card"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="parentPhone" className="text-[11px] font-semibold">
                          No. Handphone (WA)
                        </Label>
                        <Input
                          id="parentPhone"
                          placeholder="+62 8..."
                          value={form.parentPhone}
                          onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                          className="bg-card"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                      * Akun wali baru akan dibuat secara otomatis di database. Wali murid dapat
                      langsung login menggunakan email yang didaftarkan.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
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
              {editingSiswa ? "Simpan Perubahan" : "Simpan Siswa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive font-bold flex items-center gap-1.5">
              Hapus Data Siswa?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus data murid <strong>{siswaToDelete?.nama}</strong>{" "}
              (NIS: {siswaToDelete?.nis})?
              <br />
              <span className="text-xs text-destructive mt-1 block">
                Tindakan ini tidak dapat dibatalkan. Riwayat data akademik dan tahfidz yang terkait
                dengan siswa ini juga dapat terpengaruh.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Hapus Siswa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
