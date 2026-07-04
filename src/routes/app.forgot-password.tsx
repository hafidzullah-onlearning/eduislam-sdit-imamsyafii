import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/app/forgot-password")({
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-elevation">
        <Link to="/app/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali ke masuk
        </Link>
        {sent ? (
          <div className="mt-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <MailCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-xl font-extrabold">Cek kotak masuk Anda</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Instruksi reset kata sandi telah dikirim ke <span className="font-medium text-foreground">{email}</span>.
            </p>
            <Link to="/app/reset-password">
              <Button className="mt-6 w-full">Buka halaman reset (demo)</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Lupa kata sandi</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Masukkan email Anda, kami akan mengirim tautan reset.
            </p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!email) {
                  toast.error("Email wajib diisi");
                  return;
                }
                setSent(true);
                toast.success("Tautan reset dikirim");
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Kirim tautan reset</Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
