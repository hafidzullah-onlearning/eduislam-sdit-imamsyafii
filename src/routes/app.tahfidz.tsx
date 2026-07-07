import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookMarked, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { StatCard } from "@/components/app/common/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB, genId, useLazyLoadTables } from "@/lib/mock-store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const JUZ_VERSES: Record<string, { label: string; count: number }> = {
  "Juz 30": { label: "Juz 30 (Amma)", count: 564 },
  "Juz 29": { label: "Juz 29 (Tabarak)", count: 431 },
  "Juz 28": { label: "Juz 28 (Qad Sami)", count: 537 },
};

export const Route = createFileRoute("/app/tahfidz")({
  component: TahfidzPage,
});

function TahfidzPage() {
  const loading = useLazyLoadTables(["tahfidz"]);
  const { session, user } = useAuth();
  const tahfidz = useDB((s) => s.tahfidz);
  const siswa = useDB((s) => s.siswa);
  const kelas = useDB((s) => s.kelas);
  const patch = useDB((s) => s.patch);

  const isGuru = session?.role === "guru";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    siswaId: "",
    surah: "",
    ayatDari: 1,
    ayatSampai: 1,
    target: "Juz 30",
    status: "lancar" as const,
    catatan: "",
  });

  const myKelas = kelas.filter((k) => k.waliKelasId === user?.id);
  const mySiswa = siswa.filter(
    (s) => s.status !== "nonaktif" && myKelas.some((k) => k.id === s.kelasId),
  );

  const target = isGuru
    ? mySiswa
    : siswa
        .filter((s) => s.orangTuaId === user?.id && s.status !== "nonaktif")
        .filter((s) => s.id === session?.activeSiswaId);
  const focus = isGuru ? null : target[0];
  const list = focus
    ? tahfidz.filter((t) => t.siswaId === focus.id)
    : tahfidz.filter((t) => mySiswa.some((s) => s.id === t.siswaId));
  const lancar = list.filter((t) => t.status === "lancar").length;
  const ayatTotal = list.reduce((a, b) => a + (b.ayatSampai - b.ayatDari + 1), 0);

  const chart = useMemo(
    () =>
      list.slice(-8).map((t) => ({
        tanggal: format(new Date(t.tanggal), "dd/MM"),
        ayat: t.ayatSampai - t.ayatDari + 1,
      })),
    [list],
  );

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const save = () => {
    if (!form.siswaId || !form.surah) return toast.error("Lengkapi field wajib");
    patch("tahfidz", (items) => [
      ...items,
      { id: genId("tf"), ...form, tanggal: new Date().toISOString(), guruId: user!.id },
    ]);
    toast.success("Setoran tersimpan");
    setOpen(false);
    setForm({
      siswaId: "",
      surah: "",
      ayatDari: 1,
      ayatSampai: 1,
      target: "Juz 30",
      status: "lancar",
      catatan: "",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isGuru ? "Setoran Tahfidz" : `Tahfidz — ${focus?.nama ?? ""}`}
        description={
          isGuru ? "Catat setoran hafalan siswa Anda." : "Progres hafalan Al-Qur'an anak Anda."
        }
        actions={
          isGuru && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" /> Setoran baru
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Input setoran</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Siswa *</Label>
                    <Select
                      value={form.siswaId}
                      onValueChange={(v) => setForm({ ...form, siswaId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {target.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Surah *</Label>
                    <Input
                      value={form.surah}
                      onChange={(e) => setForm({ ...form, surah: e.target.value })}
                      placeholder="Al-Fatihah"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Ayat dari</Label>
                      <Input
                        type="number"
                        value={form.ayatDari}
                        onChange={(e) => setForm({ ...form, ayatDari: +e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Ayat sampai</Label>
                      <Input
                        type="number"
                        value={form.ayatSampai}
                        onChange={(e) => setForm({ ...form, ayatSampai: +e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Target</Label>
                    <Select
                      value={form.target}
                      onValueChange={(v) => setForm({ ...form, target: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Juz 30">Juz 30 (Amma)</SelectItem>
                        <SelectItem value="Juz 29">Juz 29 (Tabarak)</SelectItem>
                        <SelectItem value="Juz 28">Juz 28 (Qad Sami)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v: any) => setForm({ ...form, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lancar">Lancar</SelectItem>
                        <SelectItem value="perlu-mengulang">Perlu mengulang</SelectItem>
                        <SelectItem value="belum-dinilai">Belum dinilai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Catatan</Label>
                    <Textarea
                      value={form.catatan}
                      onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={save}>Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total setoran" value={list.length} icon={BookMarked} />
        <StatCard
          label="Lancar"
          value={`${lancar}/${list.length || 0}`}
          icon={BookMarked}
          tone="success"
        />
        <StatCard label="Ayat dihafal" value={ayatTotal} icon={BookMarked} tone="info" />
      </div>

      {focus &&
        (() => {
          const activeTarget = list[0]?.target || "Juz 30";
          const targetInfo = JUZ_VERSES[activeTarget] || JUZ_VERSES["Juz 30"];
          return (
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Progres menuju target {activeTarget}</h3>
                <span className="text-sm font-semibold text-primary">
                  {Math.min(100, Math.round((ayatTotal / targetInfo.count) * 100))}%
                </span>
              </div>
              <Progress
                value={Math.min(100, (ayatTotal / targetInfo.count) * 100)}
                className="mt-3"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {ayatTotal} dari {targetInfo.count} ayat {targetInfo.label}.
              </p>
            </div>
          );
        })()}

      {chart.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <h3 className="mb-4 font-bold">Tren Setoran Ayat (8 Setoran Terakhir)</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis
                  dataKey="tanggal"
                  tick={{ fontSize: 11 }}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                  }}
                />
                <Bar
                  dataKey="ayat"
                  name="Jumlah Ayat"
                  fill="var(--color-primary)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState icon={BookMarked} title="Belum ada setoran" />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <h3 className="mb-4 font-bold">Riwayat Setoran</h3>
          <div className="space-y-2">
            {list
              .slice()
              .reverse()
              .map((t) => {
                const s = siswa.find((x) => x.id === t.siswaId);
                return (
                  <div
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 p-3"
                  >
                    <div>
                      <p className="font-semibold">
                        {t.surah}{" "}
                        <span className="text-muted-foreground">
                          ayat {t.ayatDari}-{t.ayatSampai}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(isGuru || !focus) && `${s?.nama} • `}
                        {format(new Date(t.tanggal), "dd MMM yyyy", { locale: idLocale })}
                      </p>
                      {t.catatan && (
                        <p className="mt-1 text-xs italic text-muted-foreground">"{t.catatan}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          t.status === "lancar"
                            ? "default"
                            : t.status === "perlu-mengulang"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {t.status}
                      </Badge>
                      {isGuru && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            patch("tahfidz", (items) => items.filter((x) => x.id !== t.id));
                            toast.success("Setoran tahfidz dihapus");
                          }}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
