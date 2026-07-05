import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Award,
  Bell,
  BookMarked,
  ClipboardList,
  Heart,
  School,
  Smile,
  Users,
  Wallet,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { StatCard } from "@/components/app/common/StatCard";
import { EmptyState } from "@/components/app/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB } from "@/lib/mock-store";
import { format, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardRouter,
});

const moodValue: Record<string, number> = { senang: 5, biasa: 4, bosan: 3, sedih: 2, marah: 1 };
const moodEmoji: Record<string, string> = { senang: "😊", biasa: "😐", bosan: "😑", sedih: "😢", marah: "😠" };

function DashboardRouter() {
  const { session, user } = useAuth();
  if (session?.role === "guru") return <GuruDashboard />;
  if (session?.role === "admin") return <AdminDashboard />;
  return <OrtuDashboard />;
}

function greeting(name?: string) {
  const h = new Date().getHours();
  const s = h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam";
  return `${s}, ${name?.split(" ").slice(0, 2).join(" ") ?? ""} 👋`;
}

/* -------------------------- ORTU -------------------------- */
function OrtuDashboard() {
  const { user, session, setActiveSiswa } = useAuth();
  const siswa = useDB((s) => s.siswa);
  const invoices = useDB((s) => s.invoice);
  const submissions = useDB((s) => s.submissions);
  const tugas = useDB((s) => s.tugas);
  const tahfidz = useDB((s) => s.tahfidz);
  const nilai = useDB((s) => s.nilai);
  const mood = useDB((s) => s.mood);
  const mapel = useDB((s) => s.mapel);
  const notifs = useDB((s) => s.notifikasi);
  const catatan = useDB((s) => s.catatan);

  const myKids = useMemo(() => siswa.filter((s) => s.orangTuaId === user?.id && s.status !== "nonaktif"), [siswa, user]);
  const anak = myKids.find((k) => k.id === session?.activeSiswaId) ?? myKids[0];

  if (!anak) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState icon={Users} title="Belum ada data anak" description="Hubungi admin sekolah untuk menautkan akun Anda dengan siswa." />
      </div>
    );
  }

  const anakTugas = tugas.filter((t) => t.kelasId === anak.kelasId && t.status === "aktif");
  const belumSelesai = anakTugas.filter((t) => {
    const sub = submissions.find((s) => s.tugasId === t.id && s.siswaId === anak.id);
    return !sub || sub.status !== "selesai";
  });
  const tagihan = invoices.filter((i) => i.siswaId === anak.id && i.status !== "lunas");
  const totalTagihan = tagihan.reduce((a, b) => a + b.jumlah, 0);
  const tfCount = tahfidz.filter((t) => t.siswaId === anak.id).length;
  const tfLancar = tahfidz.filter((t) => t.siswaId === anak.id && t.status === "lancar").length;
  const nilaiAnak = nilai.filter((n) => n.siswaId === anak.id && n.status === "published");
  const avgNilai = nilaiAnak.length ? Math.round(nilaiAnak.reduce((a, b) => a + b.nilai, 0) / nilaiAnak.length) : 0;
  const moodAnak = mood.filter((m) => m.siswaId === anak.id).slice(-14);
  const moodToday = mood.filter((m) => m.siswaId === anak.id).slice(-1)[0];
  const notifAnak = notifs.filter((n) => n.userId === user?.id).slice(0, 4);

  const moodChart = useMemo(() => {
    const map = new Map<string, { hari: string; sekolah: number; rumah: number; sc: number; rc: number }>();
    for (const m of moodAnak) {
      const key = format(new Date(m.tanggal), "dd MMM", { locale: idLocale });
      const row = map.get(key) ?? { hari: key, sekolah: 0, rumah: 0, sc: 0, rc: 0 };
      const v = moodValue[m.emoji];
      if (m.sumber === "sekolah") {
        row.sekolah += v;
        row.sc++;
      } else {
        row.rumah += v;
        row.rc++;
      }
      map.set(key, row);
    }
    return Array.from(map.values()).map((r) => ({
      hari: r.hari,
      Sekolah: r.sc ? +(r.sekolah / r.sc).toFixed(1) : null,
      Rumah: r.rc ? +(r.rumah / r.rc).toFixed(1) : null,
    }));
  }, [moodAnak]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard Orang Tua"
        title={greeting(user?.name)}
        description="Semoga hari ini menjadi hari penuh keberkahan untuk keluarga Anda."
        actions={
          myKids.length > 1 && (
            <select
              value={anak.id}
              onChange={(e) => setActiveSiswa(e.target.value)}
              className="rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-semibold"
            >
              {myKids.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tugas belum selesai" value={belumSelesai.length} icon={ClipboardList} tone={belumSelesai.length ? "warning" : "success"} hint={`dari ${anakTugas.length} tugas aktif`} />
        <StatCard label="Mood terakhir" value={moodToday ? moodEmoji[moodToday.emoji] : "—"} icon={Smile} hint={moodToday ? `${moodToday.sumber === "sekolah" ? "Di sekolah" : "Di rumah"} • ${formatDistanceToNow(new Date(moodToday.tanggal), { locale: idLocale, addSuffix: true })}` : "Belum ada input"} />
        <StatCard label="Tahfidz lancar" value={`${tfLancar}/${tfCount}`} icon={BookMarked} tone="success" hint="setoran bulan ini" />
        <StatCard label="Rata-rata nilai" value={avgNilai || "—"} icon={Award} tone={avgNilai >= 80 ? "success" : "default"} hint={`${nilaiAnak.length} nilai terpublish`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Perbandingan Mood — 2 Minggu Terakhir</h3>
              <p className="text-xs text-muted-foreground">Sekolah vs rumah • skala 1–5</p>
            </div>
            <Link to="/app/mood" className="text-xs font-semibold text-primary hover:underline">
              Lihat detail
            </Link>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <LineChart data={moodChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="hari" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                <Line type="monotone" dataKey="Sekolah" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Rumah" stroke="var(--color-gold)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <h3 className="text-base font-bold">Tagihan Aktif</h3>
          {tagihan.length === 0 ? (
            <div className="mt-4 flex flex-col items-center gap-2 rounded-xl bg-emerald-500/5 p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-700">Alhamdulillah, tidak ada tagihan.</p>
            </div>
          ) : (
            <>
              <p className="mt-2 text-2xl font-extrabold">Rp {totalTagihan.toLocaleString("id-ID")}</p>
              <p className="text-xs text-muted-foreground">{tagihan.length} tagihan menunggu pembayaran</p>
              <div className="mt-4 space-y-2">
                {tagihan.slice(0, 3).map((inv) => (
                  <Link key={inv.id} to="/app/spp/$id" params={{ id: inv.id }} className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-soft/50 px-3 py-2.5 text-sm hover:border-primary/50">
                    <div>
                      <p className="font-semibold capitalize">{inv.jenis} {inv.bulan}</p>
                      <p className="text-xs text-muted-foreground">Jatuh tempo {format(new Date(inv.jatuhTempo), "dd MMM yyyy", { locale: idLocale })}</p>
                    </div>
                    <Badge variant={inv.status === "terlambat" ? "destructive" : "secondary"}>
                      {inv.status === "terlambat" ? "Terlambat" : "Belum bayar"}
                    </Badge>
                  </Link>
                ))}
              </div>
              <Link to="/app/spp">
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  Kelola tagihan <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold">Tugas Hari Ini</h3>
            <Link to="/app/tugas" className="text-xs font-semibold text-primary hover:underline">Semua tugas</Link>
          </div>
          {belumSelesai.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Semua tugas beres!" description="Alhamdulillah, tidak ada tugas tertunda hari ini." />
          ) : (
            <div className="space-y-2">
              {belumSelesai.slice(0, 5).map((t) => {
                const m = mapel.find((x) => x.id === t.mapelId);
                const sub = submissions.find((s) => s.tugasId === t.id && s.siswaId === anak.id);
                return (
                  <div key={t.id} className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{t.judul}</p>
                      <p className="text-xs text-muted-foreground">
                        {m?.nama} • Deadline {formatDistanceToNow(new Date(t.deadline), { locale: idLocale, addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant={sub?.status === "dikerjakan" ? "default" : "outline"}>
                      {sub?.status ?? "belum"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold">Notifikasi</h3>
            <Link to="/app/notifikasi" className="text-xs font-semibold text-primary hover:underline">Semua</Link>
          </div>
          {notifAnak.length === 0 ? (
            <EmptyState icon={Bell} title="Belum ada notifikasi" />
          ) : (
            <div className="space-y-2">
              {notifAnak.map((n) => (
                <div key={n.id} className="rounded-xl border border-border/60 p-3">
                  <div className="flex items-center gap-2">
                    {!n.dibaca && <span className="h-2 w-2 rounded-full bg-primary" />}
                    <p className="truncate text-sm font-semibold">{n.judul}</p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.pesan}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
        <h3 className="text-base font-bold">Catatan dari Guru</h3>
        <p className="text-xs text-muted-foreground">Perhatian dan apresiasi dari wali kelas untuk {anak.nama}.</p>
        <div className="mt-4 space-y-2">
          {catatan.filter((c) => c.siswaId === anak.id).slice(0, 3).map((c) => (
            <div key={c.id} className={`rounded-xl border p-3 ${c.tipe === "positif" ? "border-emerald-500/30 bg-emerald-500/5" : c.tipe === "perlu-perhatian" ? "border-amber-500/30 bg-amber-500/5" : "border-border/60"}`}>
              <p className="text-sm">{c.isi}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {format(new Date(c.tanggal), "dd MMMM yyyy", { locale: idLocale })}
              </p>
            </div>
          ))}
          {catatan.filter((c) => c.siswaId === anak.id).length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada catatan.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------- GURU -------------------------- */
function GuruDashboard() {
  const { user } = useAuth();
  const kelas = useDB((s) => s.kelas);
  const siswa = useDB((s) => s.siswa);
  const tugas = useDB((s) => s.tugas);
  const nilai = useDB((s) => s.nilai);
  const mood = useDB((s) => s.mood);
  const tahfidz = useDB((s) => s.tahfidz);

  const myKelas = kelas.filter((k) => k.waliKelasId === user?.id);
  const mySiswa = siswa.filter((s) => myKelas.some((k) => k.id === s.kelasId));
  const tugasAktif = tugas.filter((t) => myKelas.some((k) => k.id === t.kelasId) && t.status === "aktif");
  const nilaiDraft = nilai.filter((n) => n.guruId === user?.id && n.status === "draft");
  const moodHariIni = mood.filter((m) => m.sumber === "sekolah" && mySiswa.some((s) => s.id === m.siswaId) && new Date(m.tanggal).toDateString() === new Date().toDateString());

  const moodDist = ["senang", "biasa", "bosan", "sedih", "marah"].map((e) => ({
    emoji: `${moodEmoji[e]} ${e}`,
    Siswa: moodHariIni.filter((m) => m.emoji === e).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard Guru"
        title={greeting(user?.name)}
        description="Barakallahu fiik atas dedikasi Anda hari ini. Berikut ringkasan kelas Anda."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Kelas diampu" value={myKelas.length} icon={School} hint={myKelas.map((k) => k.nama).join(", ")} />
        <StatCard label="Total siswa" value={mySiswa.length} icon={Users} tone="info" />
        <StatCard label="Tugas aktif" value={tugasAktif.length} icon={ClipboardList} tone="warning" hint="menunggu diperiksa" />
        <StatCard label="Nilai draft" value={nilaiDraft.length} icon={Award} tone={nilaiDraft.length ? "danger" : "success"} hint="belum dipublish" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft lg:col-span-2">
          <h3 className="mb-4 text-base font-bold">Distribusi Mood Hari Ini</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart data={moodDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="emoji" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                <Bar dataKey="Siswa" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <h3 className="text-base font-bold">Aksi Cepat</h3>
          <div className="mt-4 space-y-2">
            <Link to="/app/tugas"><Button variant="outline" className="w-full justify-start"><ClipboardList className="h-4 w-4" /> Buat tugas baru</Button></Link>
            <Link to="/app/tahfidz"><Button variant="outline" className="w-full justify-start"><BookMarked className="h-4 w-4" /> Input setoran tahfidz</Button></Link>
            <Link to="/app/nilai"><Button variant="outline" className="w-full justify-start"><Award className="h-4 w-4" /> Input nilai</Button></Link>
            <Link to="/app/mood"><Button variant="outline" className="w-full justify-start"><Smile className="h-4 w-4" /> Catat mood siswa</Button></Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
        <h3 className="text-base font-bold">Tugas Terkini</h3>
        <div className="mt-4 space-y-2">
          {tugasAktif.slice(0, 5).map((t) => {
            const k = kelas.find((x) => x.id === t.kelasId);
            return (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                <div>
                  <p className="font-semibold">{t.judul}</p>
                  <p className="text-xs text-muted-foreground">Kelas {k?.nama} • Deadline {format(new Date(t.deadline), "dd MMM yyyy", { locale: idLocale })}</p>
                </div>
                <Link to="/app/tugas"><Button size="sm" variant="ghost">Periksa</Button></Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------------- ADMIN -------------------------- */
function AdminDashboard() {
  const { user } = useAuth();
  const users = useDB((s) => s.users);
  const siswa = useDB((s) => s.siswa);
  const invoices = useDB((s) => s.invoice);
  const audit = useDB((s) => s.audit);

  const guru = users.filter((u) => u.role === "guru");
  const belumLunas = invoices.filter((i) => i.status !== "lunas");
  const hariIni = invoices.filter((i) => i.status === "lunas" && i.dibayarPada && new Date(i.dibayarPada).toDateString() === new Date().toDateString());
  const total = invoices.filter((i) => i.status === "lunas").reduce((a, b) => a + b.jumlah, 0);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of invoices.filter((i) => i.status === "lunas" && i.dibayarPada)) {
      const key = format(new Date(inv.dibayarPada!), "MMM", { locale: idLocale });
      map.set(key, (map.get(key) ?? 0) + inv.jumlah);
    }
    return Array.from(map.entries()).map(([bulan, jumlah]) => ({ bulan, jumlah }));
  }, [invoices]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Dashboard Admin" title={greeting(user?.name)} description="Ringkasan sekolah, keuangan, dan aktivitas terbaru." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Jumlah guru" value={guru.length} icon={Users} tone="info" />
        <StatCard label="Jumlah siswa" value={siswa.length} icon={School} />
        <StatCard label="Pendapatan (lunas)" value={`Rp ${(total / 1_000_000).toFixed(1)} jt`} icon={Wallet} tone="success" trend={{ value: "+12% dari bulan lalu", positive: true }} />
        <StatCard label="Tagihan menunggu" value={belumLunas.length} icon={AlertCircle} tone={belumLunas.length ? "warning" : "success"} hint={`Rp ${belumLunas.reduce((a, b) => a + b.jumlah, 0).toLocaleString("id-ID")}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft lg:col-span-2">
          <h3 className="mb-4 text-base font-bold">Tren Pendapatan</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="bulan" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip formatter={(v: number) => `Rp ${v.toLocaleString("id-ID")}`} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                <Area type="monotone" dataKey="jumlah" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#ga)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <h3 className="text-base font-bold">Aktivitas Terbaru</h3>
          <div className="mt-4 space-y-2">
            {audit.slice(0, 6).map((a) => {
              const u = users.find((x) => x.id === a.userId);
              return (
                <div key={a.id} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{u?.name}</p>
                    <p className="text-xs text-muted-foreground">{a.aksi} {a.target}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(a.tanggal), { locale: idLocale, addSuffix: true })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
