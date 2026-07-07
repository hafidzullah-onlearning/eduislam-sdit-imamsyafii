import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { StatCard } from "@/components/app/common/StatCard";
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  Plus,
  Check,
  Edit,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDB, genId } from "@/lib/mock-store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/app/admin/pembayaran")({ component: PembayaranPage });

function PembayaranPage() {
  const invoices = useDB((s) => s.invoice);
  const siswa = useDB((s) => s.siswa);
  const patch = useDB((s) => s.patch);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "lunas" | "belum-bayar" | "menunggu" | "terlambat">("all");

  // New Invoice form state
  const [addOpen, setAddOpen] = useState(false);
  const [newInv, setNewInv] = useState({
    siswaId: "",
    bulan: format(new Date(), "yyyy-MM"),
    jenis: "spp" as "spp" | "buku" | "seragam" | "kegiatan",
    jumlah: 850000,
    jatuhTempo: format(new Date(), "yyyy-MM-dd"),
  });

  // Verify Payment dialog state
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    metode: "va-bca" as any,
    referensi: "",
  });

  const list = invoices
    .filter((i) => (status === "all" ? true : i.status === status))
    .filter((i) => {
      const s = siswa.find((x) => x.id === i.siswaId);
      return s?.nama.toLowerCase().includes(q.toLowerCase()) || s?.nis.includes(q);
    });

  const total = invoices.filter((i) => i.status === "lunas").reduce((a, b) => a + b.jumlah, 0);
  const belum = invoices.filter((i) => i.status !== "lunas").reduce((a, b) => a + b.jumlah, 0);
  const terlambat = invoices.filter((i) => i.status === "terlambat").length;

  const exportCSV = () => {
    const rows = [
      ["ID", "Siswa", "NIS", "Bulan", "Jenis", "Jumlah", "Status", "Metode", "Dibayar Pada", "Referensi"],
      ...list.map((i) => {
        const s = siswa.find((x) => x.id === i.siswaId);
        return [
          i.id,
          s?.nama ?? "",
          s?.nis ?? "",
          i.bulan,
          i.jenis,
          i.jumlah,
          i.status,
          i.metode ?? "",
          i.dibayarPada ?? "",
          i.referensi ?? "",
        ];
      }),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekap-pembayaran-${Date.now()}.csv`;
    a.click();
    toast.success("Export CSV berhasil");
  };

  const handleAddInvoice = () => {
    if (!newInv.siswaId || !newInv.jumlah || !newInv.jatuhTempo) {
      return toast.error("Lengkapi semua field tagihan");
    }

    const invId = genId("inv");
    const createdInvoice = {
      id: invId,
      siswaId: newInv.siswaId,
      bulan: newInv.bulan,
      jenis: newInv.jenis,
      jumlah: Number(newInv.jumlah),
      jatuhTempo: newInv.jatuhTempo,
      status: "belum-bayar" as const,
    };

    patch("invoice", (prev) => [createdInvoice, ...prev]);
    toast.success("Tagihan baru berhasil diterbitkan");
    setAddOpen(false);
  };

  const handleOpenVerify = (inv: any) => {
    setSelectedInv(inv);
    setPaymentForm({
      metode: inv.metode || "va-bca",
      referensi: inv.referensi || "",
    });
    setVerifyOpen(true);
  };

  const handleVerifyConfirm = () => {
    if (!selectedInv) return;

    patch("invoice", (prev) =>
      prev.map((i) =>
        i.id === selectedInv.id
          ? {
              ...i,
              status: "lunas" as const,
              metode: paymentForm.metode,
              referensi: paymentForm.referensi || undefined,
              dibayarPada: new Date().toISOString(),
            }
          : i
      )
    );

    const s = siswa.find((x) => x.id === selectedInv.siswaId);
    patch("audit", (prev) => [
      ...prev,
      {
        id: genId("audit"),
        userId: "admin-user",
        aksi: "VERIFIKASI_SPP_SETUJU",
        target: `Invoice #${selectedInv.id} - ${s?.nama}`,
        tanggal: new Date().toISOString(),
      },
    ]);

    toast.success(`Pembayaran untuk tagihan ${selectedInv.jenis} periode ${selectedInv.bulan} berhasil diverifikasi`);
    setVerifyOpen(false);
    setSelectedInv(null);
  };

  const handleVerifyReject = () => {
    if (!selectedInv) return;

    patch("invoice", (prev) =>
      prev.map((i) =>
        i.id === selectedInv.id
          ? {
              ...i,
              status: "belum-bayar" as const,
              metode: undefined,
              referensi: undefined,
              dibayarPada: undefined,
            }
          : i
      )
    );

    const s = siswa.find((x) => x.id === selectedInv.siswaId);
    patch("audit", (prev) => [
      ...prev,
      {
        id: genId("audit"),
        userId: "admin-user",
        aksi: "VERIFIKASI_SPP_TOLAK",
        target: `Invoice #${selectedInv.id} - ${s?.nama}`,
        tanggal: new Date().toISOString(),
      },
    ]);

    toast.error(`Konfirmasi pembayaran untuk tagihan ${selectedInv.jenis} ditolak.`);
    setVerifyOpen(false);
    setSelectedInv(null);
  };

  const handleToggleStatus = (inv: any) => {
    const nextStatus = inv.status === "belum-bayar" ? "terlambat" : "belum-bayar";
    patch("invoice", (prev) =>
      prev.map((i) => (i.id === inv.id ? { ...i, status: nextStatus } : i))
    );
    toast.success(`Status tagihan diubah menjadi ${nextStatus}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekap Pembayaran"
        description="Rekonsiliasi dan monitoring pembayaran SPP."
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setAddOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Tagihan Baru
            </Button>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total lunas" value={`Rp ${(total / 1_000_000).toFixed(1)} jt`} icon={CheckCircle2} tone="success" />
        <StatCard label="Belum lunas" value={`Rp ${(belum / 1_000_000).toFixed(1)} jt`} icon={Wallet} tone="warning" />
        <StatCard label="Terlambat" value={terlambat} icon={AlertCircle} tone="danger" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Cari siswa/NIS…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={status} onValueChange={(v: any) => setStatus(v)}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="menunggu">Menunggu Verifikasi</SelectItem>
            <SelectItem value="lunas">Lunas</SelectItem>
            <SelectItem value="belum-bayar">Belum bayar</SelectItem>
            <SelectItem value="terlambat">Terlambat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-soft/50">
              <TableHead>Siswa</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibayar</TableHead>
              <TableHead className="w-[180px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Tidak ada data pembayaran ditemukan
                </TableCell>
              </TableRow>
            ) : (
              list.map((i) => {
                const s = siswa.find((x) => x.id === i.siswaId);
                return (
                  <TableRow key={i.id} className="hover:bg-surface-soft/30 transition">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{s?.nama || "—"}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">NIS: {s?.nis || "—"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{i.bulan}</TableCell>
                    <TableCell className="capitalize">{i.jenis}</TableCell>
                    <TableCell>Rp {i.jumlah.toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          i.status === "lunas"
                            ? "default"
                            : i.status === "menunggu"
                              ? "secondary"
                              : i.status === "terlambat"
                                ? "destructive"
                                : "outline"
                        }
                        className={
                          i.status === "menunggu"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/10 animate-pulse font-semibold"
                            : ""
                        }
                      >
                        {i.status === "menunggu" ? "menunggu verifikasi" : i.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {i.dibayarPada ? (
                        <div>
                          <p className="text-sm">{format(new Date(i.dibayarPada), "dd MMM yyyy", { locale: idLocale })}</p>
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold">{i.metode || "—"}</p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {i.status !== "lunas" ? (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant={i.status === "menunggu" ? "default" : "outline"}
                            onClick={() => handleOpenVerify(i)}
                            className={`h-8 text-xs ${
                              i.status === "menunggu"
                                ? "bg-amber-600 hover:bg-amber-700 text-white"
                                : "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/5"
                            }`}
                          >
                            <Check className="mr-1 h-3.5 w-3.5" /> {i.status === "menunggu" ? "Periksa Bukti" : "Verifikasi"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStatus(i)}
                            className="h-8 text-xs text-muted-foreground"
                          >
                            Set {i.status === "belum-bayar" ? "Terlambat" : "Belum Bayar"}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold px-3 py-1 bg-emerald-500/5 rounded-full">
                          Terverifikasi
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Add New Invoice */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Buat Tagihan Baru</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pilih Siswa</Label>
              <Select
                value={newInv.siswaId}
                onValueChange={(v) => setNewInv({ ...newInv, siswaId: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Siswa" />
                </SelectTrigger>
                <SelectContent>
                  {siswa.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nama} (NIS: {s.nis})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bulan" className="text-xs font-semibold">Periode (Bulan)</Label>
                <Input
                  id="bulan"
                  placeholder="Format: YYYY-MM"
                  value={newInv.bulan}
                  onChange={(e) => setNewInv({ ...newInv, bulan: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Jenis Tagihan</Label>
                <Select
                  value={newInv.jenis}
                  onValueChange={(v: any) => setNewInv({ ...newInv, jenis: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spp">SPP Bulanan</SelectItem>
                    <SelectItem value="buku">Buku Paket</SelectItem>
                    <SelectItem value="seragam">Seragam Sekolah</SelectItem>
                    <SelectItem value="kegiatan">Uang Kegiatan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="jumlah" className="text-xs font-semibold">Nominal Tagihan (Rp)</Label>
                <Input
                  id="jumlah"
                  type="number"
                  placeholder="Misal: 850000"
                  value={newInv.jumlah}
                  onChange={(e) => setNewInv({ ...newInv, jumlah: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jatuhTempo" className="text-xs font-semibold">Jatuh Tempo</Label>
                <Input
                  id="jatuhTempo"
                  type="date"
                  value={newInv.jatuhTempo}
                  onChange={(e) => setNewInv({ ...newInv, jatuhTempo: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 pt-3">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddInvoice} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Terbitkan Tagihan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Verify Payment */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="max-w-md bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">
              {selectedInv?.status === "menunggu" ? "Periksa Bukti Pembayaran" : "Verifikasi Pembayaran Manual"}
            </DialogTitle>
          </DialogHeader>

          {selectedInv && (
            <div className="space-y-4 py-2">
              <div className="rounded-xl border bg-surface-soft/40 p-3 text-xs space-y-1">
                <p><strong>Tagihan:</strong> <span className="capitalize">{selectedInv.jenis}</span> ({selectedInv.bulan})</p>
                <p><strong>Nominal:</strong> Rp {selectedInv.jumlah.toLocaleString("id-ID")}</p>
                <p><strong>Siswa:</strong> {siswa.find((x) => x.id === selectedInv.siswaId)?.nama}</p>
                {selectedInv.referensi && (
                  <p className="mt-2 text-amber-600 bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                    <strong>Referensi dari Ortu:</strong> {selectedInv.referensi}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Metode Pembayaran</Label>
                <Select
                  value={paymentForm.metode}
                  onValueChange={(v: any) => setPaymentForm({ ...paymentForm, metode: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="va-bca">Transfer Virtual Account BCA</SelectItem>
                    <SelectItem value="va-mandiri">Transfer Virtual Account Mandiri</SelectItem>
                    <SelectItem value="qris">QRIS (Gopay/OVO/ShopeePay)</SelectItem>
                    <SelectItem value="gopay">Direct GoPay</SelectItem>
                    <SelectItem value="ovo">Direct OVO</SelectItem>
                    <SelectItem value="dana">Direct DANA</SelectItem>
                    <SelectItem value="kartu-kredit">Kartu Kredit / Debit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="referensi" className="text-xs font-semibold">Nomor Referensi Transaksi (Opsional)</Label>
                <Input
                  id="referensi"
                  placeholder="Misal: TRX-8821990"
                  value={paymentForm.referensi}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referensi: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border/60 pt-3 flex justify-between items-center gap-2">
            {selectedInv?.status === "menunggu" && (
              <Button
                variant="outline"
                onClick={handleVerifyReject}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
              >
                Tolak Bukti
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="ghost" onClick={() => setVerifyOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleVerifyConfirm} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Setujui & Konfirmasi Lunas
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

