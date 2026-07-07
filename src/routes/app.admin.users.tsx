import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Edit2, Trash2, Key, Plus } from "lucide-react";

export const Route = createFileRoute("/app/admin/users")({ component: UsersPage });

function UsersPage() {
  const users = useDB((s) => s.users);
  const patch = useDB((s) => s.patch);
  const [tab, setTab] = useState<"guru" | "ortu" | "admin">("guru");
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "guru" as "guru" | "ortu" | "admin",
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      role: tab,
    });
    setOpen(true);
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setForm({
      name: u.name,
      email: u.email,
      phone: u.phone ?? "",
      role: u.role,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) {
      return toast.error("Harap isi Nama dan Email");
    }

    const emailExists = users.some(
      (u) =>
        u.email.toLowerCase() === form.email.toLowerCase() &&
        (!editingUser || u.id !== editingUser.id),
    );
    if (emailExists) {
      return toast.error("Email sudah digunakan oleh user lain");
    }

    if (editingUser) {
      patch("users", (prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: form.name,
                email: form.email,
                phone: form.phone || undefined,
                role: form.role,
              }
            : u,
        ),
      );
      toast.success(`Data user "${form.name}" berhasil diperbarui`);
    } else {
      const newUserId = genId("u-" + form.role);
      const newUser = {
        id: newUserId,
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
      };
      patch("users", (prev) => [...prev, newUser]);
      toast.success(`User "${form.name}" berhasil ditambahkan`);
    }
    setOpen(false);
  };

  const handleOpenDelete = (u: any) => {
    setUserToDelete(u);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    patch("users", (prev) => prev.filter((u) => u.id !== userToDelete.id));
    toast.success(`User "${userToDelete.name}" berhasil dihapus`);
    setDeleteOpen(false);
    setUserToDelete(null);
  };

  const handleResetPassword = (u: any) => {
    toast.success(`Password untuk "${u.name}" berhasil direset. Tautan telah dikirim.`);
  };

  const list = users
    .filter((u) => u.role === tab)
    .filter((u) => u.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen User"
        description="Kelola guru, orang tua, dan admin sekolah."
        actions={
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Tambah User
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="guru">Guru</TabsTrigger>
          <TabsTrigger value="ortu">Orang Tua</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
      </Tabs>

      <Input
        placeholder="Cari nama…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-md"
      />

      <div className="rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft/50">
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>HP</TableHead>
              <TableHead className="w-[200px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Tidak ada data user ditemukan
                </TableCell>
              </TableRow>
            ) : (
              list.map((u) => (
                <TableRow key={u.id} className="hover:bg-surface-soft/30 transition">
                  <TableCell className="font-semibold">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleResetPassword(u)}
                        title="Reset Password"
                        className="h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/5"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(u)}
                        title="Edit User"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenDelete(u)}
                        title="Hapus User"
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

      {/* Dialog Add/Edit User */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">
              {editingUser ? `Edit User: ${editingUser.name}` : "Tambah User Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">
                Nama Lengkap
              </Label>
              <Input
                id="name"
                placeholder="Misal: Bapak Rahmat"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="rahmat@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold">
                No. HP (Opsional)
              </Label>
              <Input
                id="phone"
                placeholder="+62 8..."
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Peran (Role)</Label>
              <Select
                value={form.role}
                onValueChange={(v: "guru" | "ortu" | "admin") => setForm({ ...form, role: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guru">Guru</SelectItem>
                  <SelectItem value="ortu">Orang Tua (Wali)</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
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
              {editingUser ? "Simpan Perubahan" : "Tambah User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive font-bold">
              Hapus Akun User?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus user <strong>{userToDelete?.name}</strong> (
              {userToDelete?.email})?
              <br />
              <span className="text-xs text-destructive mt-1 block">
                Tindakan ini permanen. User tidak akan bisa login lagi ke portal sekolah.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Hapus User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
