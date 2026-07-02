import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Users, Baby, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth/mock-auth";
import type { Role } from "@/mocks/types";
import { toast } from "sonner";

export const Route = createFileRoute("/app/login")({
  component: LoginPage,
});

const ROLES: { id: Role; title: string; email: string; icon: typeof Users; desc: string }[] = [
  { id: "ortu", title: "Orang Tua", email: "ridho@keluarga.id", icon: Baby, desc: "Pantau progres anak dari mana saja" },
  { id: "guru", title: "Guru", email: "aisyah@sdit.sch.id", icon: Users, desc: "Kelola kelas, tugas, dan tahfidz" },
  { id: "admin", title: "Admin Sekolah", email: "admin@sdit.sch.id", icon: ShieldCheck, desc: "Master data & keuangan sekolah" },
];

function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Role>("ortu");
  const [email, setEmail] = useState(ROLES[0].email);
  const [password, setPassword] = useState("demo1234");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const pickRole = (r: Role) => {
    setRole(r);
    setEmail(ROLES.find((x) => x.id === r)!.email);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan kata sandi wajib diisi");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      signIn(role, remember);
      toast.success("Selamat datang kembali!");
      router.navigate({ to: "/app/dashboard", replace: true });
      setLoading(false);
    }, 500);
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-premium p-10 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Sparkles className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-extrabold tracking-tight">EduIslam Connect</span>
        </Link>
        <div className="max-w-md space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Portal Sekolah Islam Modern</p>
          <h2 className="text-3xl font-extrabold leading-tight">
            Bismillah, mari lanjutkan perjalanan pendidikan penuh keberkahan bersama.
          </h2>
          <p className="text-white/80">
            Akses akademik, tahfidz, mood analytics, komunikasi orang tua, dan pembayaran SPP — semua di satu tempat.
          </p>
        </div>
        <blockquote className="max-w-md rounded-2xl border border-white/15 bg-white/10 p-5 text-sm backdrop-blur-md">
          <p>"Sekali klik, saya tahu Faris hari ini mendapat 92 di Matematika dan sudah hafal 20 ayat baru."</p>
          <p className="mt-3 text-xs font-semibold text-white/80">— Bapak Ridho, orang tua siswa kelas 3A</p>
        </blockquote>
      </div>

      <div className="flex flex-col items-center justify-center px-5 py-10 md:px-10">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-emerald">
                <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
              </span>
              <span className="font-extrabold tracking-tight">EduIslam Connect</span>
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Masuk ke akun Anda</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Pilih peran, lalu masuk dengan email sekolah Anda.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {ROLES.map((r) => {
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => pickRole(r.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition ${
                    active
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border/60 hover:border-primary/50 hover:bg-surface-soft/60"
                  }`}
                >
                  <r.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-semibold ${active ? "text-primary" : ""}`}>{r.title}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {ROLES.find((r) => r.id === role)?.desc}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Kata sandi</Label>
                <Link to="/app/forgot-password" className="text-xs font-medium text-primary hover:underline">
                  Lupa sandi?
                </Link>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
              Tetap masuk di perangkat ini
            </label>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memverifikasi…" : "Masuk"} <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 rounded-xl border border-dashed border-border/70 bg-surface-soft/50 p-3 text-center text-xs text-muted-foreground">
            🔒 Ini adalah demo. Kata sandi diabaikan — cukup pilih peran lalu klik Masuk.
          </p>
        </div>
      </div>
    </div>
  );
}
