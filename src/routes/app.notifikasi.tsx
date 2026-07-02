import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Check } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB } from "@/lib/mock-store";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/app/notifikasi")({ component: NotifPage });

function NotifPage() {
  const { session } = useAuth();
  const notifs = useDB((s) => s.notifikasi);
  const patch = useDB((s) => s.patch);
  const list = notifs.filter((n) => n.role === session?.role);
  const markAll = () => { patch("notifikasi", (items) => items.map((n) => n.role === session?.role ? { ...n, dibaca: true } : n)); };
  return (
    <div className="space-y-6">
      <PageHeader title="Notifikasi" description="Semua pemberitahuan terkait aktivitas sekolah." actions={<Button variant="outline" onClick={markAll}><Check className="h-4 w-4" /> Tandai semua terbaca</Button>} />
      {list.length === 0 ? (
        <EmptyState icon={Bell} title="Belum ada notifikasi" />
      ) : (
        <div className="space-y-2">
          {list.map((n) => (
            <Link key={n.id} to={n.link ?? "/app/dashboard"} className={`block rounded-2xl border p-4 shadow-soft transition hover:border-primary/40 ${n.dibaca ? "border-border/60 bg-card" : "border-primary/30 bg-primary/5"}`}>
              <div className="flex items-start gap-3">
                {!n.dibaca && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{n.judul}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{n.pesan}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.tanggal), { locale: idLocale, addSuffix: true })}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
