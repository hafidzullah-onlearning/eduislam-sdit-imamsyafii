import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reset-password")({
  component: ResetPage,
});

function ResetPage() {
  const router = useRouter();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  return (
    <div className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-elevation">
        <h1 className="text-2xl font-extrabold tracking-tight">Buat kata sandi baru</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Gunakan minimal 8 karakter dan kombinasi huruf-angka.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (p1.length < 8) return toast.error("Kata sandi minimal 8 karakter");
            if (p1 !== p2) return toast.error("Konfirmasi tidak cocok");
            toast.success("Kata sandi berhasil diperbarui");
            router.navigate({ to: "/app/login" });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="p1">Kata sandi baru</Label>
            <Input id="p1" type="password" value={p1} onChange={(e) => setP1(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p2">Konfirmasi kata sandi</Label>
            <Input id="p2" type="password" value={p2} onChange={(e) => setP2(e.target.value)} />
          </div>
          <Button type="submit" className="w-full">
            Simpan
          </Button>
          <Link
            to="/app/login"
            className="block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Batal, kembali ke masuk
          </Link>
        </form>
      </div>
    </div>
  );
}
