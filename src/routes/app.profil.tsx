import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/mock-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profil")({ component: ProfilPage });

function ProfilPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader title="Profil" description="Kelola informasi akun Anda." />
      <div className="max-w-2xl rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-emerald text-xl font-bold text-primary-foreground">{user?.name?.[0]}</span>
          <div><p className="text-lg font-bold">{user?.name}</p><p className="text-sm text-muted-foreground capitalize">{user?.role}</p></div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); toast.success("Profil diperbarui"); }} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Nama lengkap</Label><Input defaultValue={user?.name} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input defaultValue={user?.email} /></div>
          <div className="space-y-1.5"><Label>Nomor HP</Label><Input defaultValue={user?.phone} /></div>
          <div className="sm:col-span-2"><Button type="submit">Simpan perubahan</Button></div>
        </form>
      </div>
    </div>
  );
}
