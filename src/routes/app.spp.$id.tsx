import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Building2, QrCode, Smartphone, CreditCard, Copy, Printer, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDB, genId } from "@/lib/mock-store";
import { useAuth } from "@/lib/auth/mock-auth";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import type { PaymentMethod } from "@/mocks/types";

export const Route = createFileRoute("/app/spp/$id")({ component: InvoicePage });

const METHODS: { id: PaymentMethod; label: string; icon: typeof Building2; group: string; kode?: string }[] = [
  { id: "va-bca", label: "Virtual Account BCA", icon: Building2, group: "Virtual Account", kode: "8823" },
  { id: "va-mandiri", label: "Virtual Account Mandiri", icon: Building2, group: "Virtual Account", kode: "8908" },
  { id: "qris", label: "QRIS", icon: QrCode, group: "QRIS" },
  { id: "gopay", label: "GoPay", icon: Smartphone, group: "E-Wallet" },
  { id: "ovo", label: "OVO", icon: Smartphone, group: "E-Wallet" },
  { id: "dana", label: "DANA", icon: Smartphone, group: "E-Wallet" },
  { id: "kartu-kredit", label: "Kartu Kredit / Debit", icon: CreditCard, group: "Kartu" },
];

function InvoicePage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { user } = useAuth();
  const invoices = useDB((s) => s.invoice);
  const siswa = useDB((s) => s.siswa);
  const patch = useDB((s) => s.patch);
  const inv = invoices.find((i) => i.id === id);
  const [method, setMethod] = useState<PaymentMethod | null>(inv?.metode ?? null);
  const [step, setStep] = useState<"pilih" | "instruksi" | "sukses">(inv?.status === "lunas" ? "sukses" : "pilih");

  if (!inv) return <p>Tagihan tidak ditemukan.</p>;
  const s = siswa.find((x) => x.id === inv.siswaId);
  const chosen = METHODS.find((m) => m.id === method);
  const vaNumber = chosen?.kode ? `${chosen.kode}${s?.nis ?? "0000"}${inv.jumlah.toString().slice(0, 4)}` : null;

  const markPaid = () => {
    patch("invoice", (items) =>
      items.map((i) => (i.id === id ? { ...i, status: "lunas" as const, metode: method!, dibayarPada: new Date().toISOString(), referensi: genId("REF").toUpperCase() } : i)),
    );
    toast.success("Pembayaran berhasil dikonfirmasi. Jazakumullah khairan.");
    setStep("sukses");
  };

  return (
    <div className="space-y-6">
      <button onClick={() => router.history.back()} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>
      <PageHeader
        eyebrow={`Invoice #${inv.id.toUpperCase()}`}
        title={`${inv.jenis.toUpperCase()} • ${inv.bulan}`}
        description={`${s?.nama} — NIS ${s?.nis}`}
        actions={inv.status === "lunas" && <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Cetak</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft lg:col-span-2">
          {step === "sukses" ? (
            <div className="py-8 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-xl font-extrabold">Pembayaran Diterima</h3>
              <p className="mt-1 text-sm text-muted-foreground">Barakallahu fiik. Kwitansi telah dikirim ke email Anda.</p>
              {inv.referensi && <p className="mt-3 text-xs text-muted-foreground">Referensi: <span className="font-mono font-semibold text-foreground">{inv.referensi}</span></p>}
            </div>
          ) : step === "pilih" ? (
            <>
              <h3 className="mb-4 font-bold">Pilih metode pembayaran</h3>
              {["Virtual Account", "QRIS", "E-Wallet", "Kartu"].map((group) => (
                <div key={group} className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {METHODS.filter((m) => m.group === group).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${method === m.id ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"}`}
                      >
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><m.icon className="h-5 w-5" /></div>
                        <span className="text-sm font-semibold">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <Button className="w-full" disabled={!method} onClick={() => setStep("instruksi")}>Lanjutkan</Button>
            </>
          ) : (
            <>
              <h3 className="mb-4 font-bold">Instruksi pembayaran • {chosen?.label}</h3>
              {chosen?.group === "Virtual Account" && (
                <div className="rounded-xl border border-border/60 bg-surface-soft/50 p-5 text-center">
                  <p className="text-xs uppercase text-muted-foreground">Nomor Virtual Account</p>
                  <p className="mt-2 font-mono text-2xl font-extrabold tracking-wider">{vaNumber}</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => { navigator.clipboard.writeText(vaNumber!); toast.success("Nomor disalin"); }}>
                    <Copy className="h-3.5 w-3.5" /> Salin
                  </Button>
                  <p className="mt-4 text-xs text-muted-foreground">Transfer ke nomor di atas melalui m-banking atau ATM {chosen?.label.replace("Virtual Account ", "")}.</p>
                </div>
              )}
              {chosen?.group === "QRIS" && (
                <div className="rounded-xl border border-border/60 bg-surface-soft/50 p-8 text-center">
                  <div className="mx-auto grid h-48 w-48 place-items-center rounded-2xl bg-background">
                    <QrCode className="h-40 w-40" strokeWidth={0.5} />
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">Scan QR ini dengan aplikasi e-wallet atau m-banking yang mendukung QRIS.</p>
                </div>
              )}
              {chosen?.group === "E-Wallet" && (
                <div className="rounded-xl border border-border/60 bg-surface-soft/50 p-5 text-center">
                  <p className="text-sm">Anda akan diarahkan ke aplikasi {chosen?.label} untuk menyelesaikan pembayaran.</p>
                </div>
              )}
              {chosen?.group === "Kartu" && (
                <p className="rounded-xl border border-border/60 bg-surface-soft/50 p-5 text-center text-sm">Anda akan diarahkan ke halaman pembayaran aman kartu.</p>
              )}
              <div className="mt-6 flex gap-2">
                <Button variant="outline" onClick={() => setStep("pilih")}>Ganti metode</Button>
                <Button className="flex-1" onClick={markPaid}>Saya sudah bayar</Button>
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <h3 className="font-bold">Ringkasan</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Siswa</dt><dd className="font-semibold">{s?.nama}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Jenis</dt><dd className="font-semibold capitalize">{inv.jenis}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Periode</dt><dd className="font-semibold">{inv.bulan}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Jatuh tempo</dt><dd className="font-semibold">{format(new Date(inv.jatuhTempo), "dd MMM yyyy", { locale: idLocale })}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt>
              <dd><Badge variant={inv.status === "lunas" ? "default" : "secondary"}>{inv.status}</Badge></dd>
            </div>
          </dl>
          <div className="mt-4 border-t border-border/60 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-extrabold text-primary">Rp {inv.jumlah.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
