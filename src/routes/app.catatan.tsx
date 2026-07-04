import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB } from "@/lib/mock-store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/app/catatan")({ component: CatatanPage });

function CatatanPage() {
  const { user, session } = useAuth();
  const siswa = useDB((s) => s.siswa);
  const catatan = useDB((s) => s.catatan);
  const anak = siswa.filter((s) => s.orangTuaId === user?.id).find((k) => k.id === session?.activeSiswaId);
  const list = anak ? catatan.filter((c) => c.siswaId === anak.id) : [];
  return (
    <div className="space-y-6">
      <PageHeader title="Catatan Guru" description={`Perhatian dan apresiasi wali kelas untuk ${anak?.nama ?? "anak Anda"}.`} />
      {list.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Belum ada catatan" />
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <div key={c.id} className={`rounded-2xl border p-5 shadow-soft ${c.tipe === "positif" ? "border-emerald-500/30 bg-emerald-500/5" : c.tipe === "perlu-perhatian" ? "border-amber-500/30 bg-amber-500/5" : "border-border/60 bg-card"}`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.tipe.replace("-", " ")}</p>
              <p className="mt-2">{c.isi}</p>
              <p className="mt-3 text-xs text-muted-foreground">{format(new Date(c.tanggal), "EEEE, dd MMMM yyyy", { locale: idLocale })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
