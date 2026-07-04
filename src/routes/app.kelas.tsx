import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/common/PageHeader";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB } from "@/lib/mock-store";

export const Route = createFileRoute("/app/kelas")({ component: KelasPage });

function KelasPage() {
  const { user } = useAuth();
  const kelas = useDB((s) => s.kelas);
  const siswa = useDB((s) => s.siswa);
  const myKelas = kelas.filter((k) => k.waliKelasId === user?.id);
  return (
    <div className="space-y-6">
      <PageHeader title="Kelas Saya" description="Kelas yang Anda wali dan ampu." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {myKelas.map((k) => {
          const total = siswa.filter((s) => s.kelasId === k.id && s.status !== "nonaktif").length;
          return (
            <div key={k.id} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Kelas</p>
              <h3 className="mt-1 text-2xl font-extrabold">{k.nama}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Tingkat {k.tingkat} • {k.tahunAjaran}</p>
              <p className="mt-3 text-sm font-semibold text-primary">{total} siswa</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
