import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Smile } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB, genId } from "@/lib/mock-store";
import { format, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import type { MoodEmoji } from "@/mocks/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/app/mood")({
  component: MoodPage,
});

const EMOJI: { id: MoodEmoji; icon: string; label: string; value: number }[] = [
  { id: "senang", icon: "😊", label: "Senang", value: 5 },
  { id: "biasa", icon: "😐", label: "Biasa", value: 4 },
  { id: "bosan", icon: "😑", label: "Bosan", value: 3 },
  { id: "sedih", icon: "😢", label: "Sedih", value: 2 },
  { id: "marah", icon: "😠", label: "Marah", value: 1 },
];

function MoodPage() {
  const { session, user } = useAuth();
  const siswa = useDB((s) => s.siswa);
  const mood = useDB((s) => s.mood);
  const kelas = useDB((s) => s.kelas);
  const patch = useDB((s) => s.patch);
  const isGuru = session?.role === "guru";
  const [selected, setSelected] = useState<MoodEmoji | null>(null);
  const [catatan, setCatatan] = useState("");
  const [jam, setJam] = useState("1");
  const [siswaId, setSiswaId] = useState("");

  const myKelas = kelas.filter((k) => k.waliKelasId === user?.id);
  const mySiswa = siswa.filter(
    (s) => s.status !== "nonaktif" && myKelas.some((k) => k.id === s.kelasId),
  );

  const anak = siswa
    .filter((s) => s.orangTuaId === user?.id)
    .find((k) => k.id === session?.activeSiswaId);
  const focusId = isGuru ? siswaId : anak?.id;
  const list = focusId ? mood.filter((m) => m.siswaId === focusId).slice(-30) : [];

  const chart = useMemo(() => {
    const map = new Map<string, { hari: string; skl: number[]; rmh: number[] }>();
    for (const m of list) {
      const key = format(new Date(m.tanggal), "dd/MM");
      const row = map.get(key) ?? { hari: key, skl: [], rmh: [] };
      const v = EMOJI.find((e) => e.id === m.emoji)?.value ?? 3;
      if (m.sumber === "sekolah") row.skl.push(v);
      else row.rmh.push(v);
      map.set(key, row);
    }
    return Array.from(map.values()).map((r) => ({
      hari: r.hari,
      Sekolah: r.skl.length ? +(r.skl.reduce((a, b) => a + b, 0) / r.skl.length).toFixed(1) : null,
      Rumah: r.rmh.length ? +(r.rmh.reduce((a, b) => a + b, 0) / r.rmh.length).toFixed(1) : null,
    }));
  }, [list]);

  const submit = () => {
    if (!selected) return toast.error("Pilih emoji terlebih dahulu");
    const target = isGuru ? siswaId : anak?.id;
    if (!target) return toast.error("Pilih siswa/anak terlebih dahulu");
    patch("mood", (items) => [
      ...items,
      {
        id: genId("mo"),
        siswaId: target,
        emoji: selected,
        catatan,
        sumber: isGuru ? "sekolah" : "rumah",
        jamPelajaran: isGuru ? +jam : undefined,
        tanggal: new Date().toISOString(),
        createdBy: user!.id,
      },
    ]);
    toast.success("Mood tersimpan");
    setSelected(null);
    setCatatan("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isGuru ? "Mood Siswa" : `Mood Anak — ${anak?.nama ?? ""}`}
        description={
          isGuru
            ? "Catat suasana hati siswa per jam pelajaran."
            : "Bagaimana perasaan anak Anda hari ini?"
        }
      />

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
        <h3 className="mb-3 font-bold">Input mood {isGuru ? "sekolah" : "rumah"} hari ini</h3>
        {isGuru && (
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Siswa</Label>
              <Select value={siswaId} onValueChange={setSiswaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih siswa" />
                </SelectTrigger>
                <SelectContent>
                  {mySiswa.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Jam pelajaran</Label>
              <Select value={jam} onValueChange={setJam}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Jam ke-{n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <div className="grid grid-cols-5 gap-2">
          {EMOJI.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelected(e.id)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-4 transition ${
                selected === e.id
                  ? "border-primary bg-primary/10"
                  : "border-border/60 hover:border-primary/40"
              }`}
            >
              <span className="text-3xl">{e.icon}</span>
              <span className="text-xs font-semibold">{e.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-1.5">
          <Label>Catatan (opsional)</Label>
          <Textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Contoh: Setelah mengerjakan PR bersama, Faris terlihat senang."
          />
        </div>
        <Button className="mt-3" onClick={submit}>
          Simpan mood
        </Button>
      </div>

      {chart.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <h3 className="mb-4 font-bold">Perbandingan Mood 30 Hari</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <LineChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis
                  dataKey="hari"
                  tick={{ fontSize: 11 }}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fontSize: 11 }}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Sekolah"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="Rumah"
                  stroke="var(--color-gold)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState icon={Smile} title="Belum ada catatan mood" />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <h3 className="mb-4 font-bold">Riwayat Terbaru</h3>
          <div className="space-y-2">
            {list
              .slice()
              .reverse()
              .slice(0, 15)
              .map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border/60 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{EMOJI.find((e) => e.id === m.emoji)?.icon}</span>
                    <div>
                      <p className="text-sm font-semibold capitalize">
                        {m.emoji}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          • {m.sumber === "sekolah" ? "Sekolah" : "Rumah"}
                          {m.jamPelajaran && ` jam ke-${m.jamPelajaran}`}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(m.tanggal), {
                          locale: idLocale,
                          addSuffix: true,
                        })}
                      </p>
                      {m.catatan && (
                        <p className="mt-1 text-xs italic text-muted-foreground">"{m.catatan}"</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
