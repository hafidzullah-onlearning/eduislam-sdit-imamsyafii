import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useDB } from "@/lib/mock-store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/pengaturan")({ component: PengaturanPage });

function PengaturanPage() {
  const reset = useDB((s) => s.reset);
  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan" description="Preferensi akun dan notifikasi." />
      <div className="max-w-2xl space-y-4">
        {[
          { l: "Notifikasi email", d: "Terima pemberitahuan lewat email" },
          { l: "Notifikasi WhatsApp", d: "Reminder tagihan & mood harian" },
          { l: "Ringkasan mingguan", d: "Rekap tiap Jumat sore" },
        ].map((s) => (
          <div
            key={s.l}
            className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-soft"
          >
            <div>
              <p className="font-semibold">{s.l}</p>
              <p className="text-xs text-muted-foreground">{s.d}</p>
            </div>
            <Switch defaultChecked />
          </div>
        ))}
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="font-semibold text-destructive">Reset data demo</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Kembalikan semua data mock ke kondisi awal.
          </p>
          <Button
            variant="destructive"
            size="sm"
            className="mt-3"
            onClick={() => {
              reset();
              toast.success("Data demo di-reset");
            }}
          >
            Reset sekarang
          </Button>
        </div>
      </div>
    </div>
  );
}
