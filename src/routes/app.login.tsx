import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth/mock-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/login")({ component: LoginPage });

function LoginPage() {
  const { signInWithPassword, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const goDashboard = () => router.navigate({ to: "/app/dashboard", replace: true });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Email dan kata sandi wajib diisi");
    if (mode === "daftar" && !nama) return toast.error("Nama wajib diisi");
    setLoading(true);
    const res =
      mode === "masuk"
        ? await signInWithPassword(email, password)
        : await signUp(email, password, nama);
    setLoading(false);
    if (res.error) return toast.error(res.error);
    toast.success(mode === "masuk" ? "Selamat datang kembali!" : "Akun berhasil dibuat");
    goDashboard();
  };

  const google = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal masuk dengan Google");
    } finally {
      setLoading(false);
    }
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Portal Sekolah Islam Modern
          </p>
          <h2 className="text-3xl font-extrabold leading-tight">
            Bismillah, mari lanjutkan perjalanan pendidikan penuh keberkahan bersama.
          </h2>
          <p className="text-white/80">
            Akses akademik, tahfidz, mood analytics, komunikasi orang tua, dan pembayaran SPP —
            semua di satu tempat.
          </p>
        </div>
        <blockquote className="max-w-md rounded-2xl border border-white/15 bg-white/10 p-5 text-sm backdrop-blur-md">
          <p>
            "Sekali klik, saya tahu Faris hari ini mendapat 92 di Matematika dan sudah hafal 20 ayat
            baru."
          </p>
          <p className="mt-3 text-xs font-semibold text-white/80">
            — Bapak Ridho, orang tua siswa kelas 3A
          </p>
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
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            {mode === "masuk" ? "Masuk ke akun Anda" : "Buat akun baru"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "masuk"
              ? "Gunakan email sekolah atau akun Google Anda."
              : "Akun baru otomatis berperan sebagai Orang Tua. Guru/Admin ditetapkan oleh sekolah."}
          </p>

          <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="masuk">Masuk</TabsTrigger>
              <TabsTrigger value="daftar">Daftar</TabsTrigger>
            </TabsList>
            <TabsContent value={mode} className="mt-6 space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={google}
                disabled={loading}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Lanjutkan dengan Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">atau email</span>
                </div>
              </div>
              <form onSubmit={submit} className="space-y-4">
                {mode === "daftar" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="nama">Nama lengkap</Label>
                    <Input
                      id="nama"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Kata sandi</Label>
                    {mode === "masuk" && (
                      <Link
                        to="/app/forgot-password"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Lupa sandi?
                      </Link>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "masuk" ? "current-password" : "new-password"}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Memproses…" : mode === "masuk" ? "Masuk" : "Daftar"}{" "}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 rounded-xl border border-dashed border-border/70 bg-surface-soft/50 p-3 text-center text-xs text-muted-foreground">
            🔒 Akun baru otomatis berperan sebagai Orang Tua. Peran Guru/Admin diberikan oleh admin
            sekolah.
          </p>
        </div>
      </div>
    </div>
  );
}
