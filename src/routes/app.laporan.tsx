import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/common/PageHeader";
import { StatCard } from "@/components/app/common/StatCard";
import { BarChart3, TrendingUp, Users, Award } from "lucide-react";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB } from "@/lib/mock-store";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo } from "react";

export const Route = createFileRoute("/app/laporan")({ component: LaporanPage });

function LaporanPage() {
  const { user } = useAuth();
  const kelas = useDB((s) => s.kelas);
  const siswa = useDB((s) => s.siswa);
  const nilai = useDB((s) => s.nilai);
  const myKelas = kelas.filter((k) => k.waliKelasId === user?.id);
  const mySiswa = siswa.filter((s) => myKelas.some((k) => k.id === s.kelasId));
  const chart = useMemo(() => mySiswa.map((s) => {
    const arr = nilai.filter((n) => n.siswaId === s.id && n.status === "published");
    return { siswa: s.nama.split(" ")[0], Rata: arr.length ? Math.round(arr.reduce((a, b) => a + b.nilai, 0) / arr.length) : 0 };
  }), [mySiswa, nilai]);
  const rata = chart.length ? Math.round(chart.reduce((a, b) => a + b.Rata, 0) / chart.length) : 0;
  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Kelas" description="Ringkasan performa akademik siswa Anda." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Siswa aktif" value={mySiswa.length} icon={Users} />
        <StatCard label="Rata-rata kelas" value={rata} icon={Award} tone="success" />
        <StatCard label="Nilai terpublish" value={nilai.filter((n) => n.status === "published").length} icon={TrendingUp} tone="info" />
      </div>
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
        <h3 className="mb-4 font-bold">Rata-rata Nilai per Siswa</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
              <XAxis dataKey="siswa" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
              <Bar dataKey="Rata" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
