import { createFileRoute, Link } from "@tanstack/react-router";
import { Baby, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB } from "@/lib/mock-store";

export const Route = createFileRoute("/app/anak")({
  component: AnakPage,
});

function AnakPage() {
  const { user, session, setActiveSiswa } = useAuth();
  const siswa = useDB((s) => s.siswa);
  const kelas = useDB((s) => s.kelas);
  const anak = siswa.filter((s) => s.orangTuaId === user?.id && s.status !== "nonaktif");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anak Saya"
        description="Pilih anak untuk melihat progres akademik dan tahfidz."
      />
      {anak.length === 0 ? (
        <EmptyState icon={Baby} title="Belum ada data anak" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {anak.map((a) => {
            const k = kelas.find((x) => x.id === a.kelasId);
            const active = session?.activeSiswaId === a.id;
            return (
              <div
                key={a.id}
                className={`rounded-2xl border-2 p-5 shadow-soft transition ${active ? "border-primary bg-primary/5" : "border-border/60 bg-card hover:border-primary/40"}`}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-emerald text-lg font-bold text-primary-foreground">
                    {a.nama[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{a.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      NIS {a.nis} • {a.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Kelas {k?.nama} • {k?.tahunAjaran}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setActiveSiswa(a.id)}
                  >
                    {active ? "Sedang aktif" : "Pilih anak ini"}
                  </Button>
                  <Link to="/app/dashboard">
                    <Button size="sm" variant="ghost">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
