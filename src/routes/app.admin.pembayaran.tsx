import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Filter } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { StatCard } from "@/components/app/common/StatCard";
import { Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDB } from "@/lib/mock-store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/app/admin/pembayaran")({ component: PembayaranPage });

function PembayaranPage() {
  const invoices = useDB((s) => s.invoice);
  const siswa = useDB((s) => s.siswa);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "lunas" | "belum-bayar" | "terlambat">("all");
  const list = invoices
    .filter((i) => (status === "all" ? true : i.status === status))
    .filter((i) => siswa.find((s) => s.id === i.siswaId)?.nama.toLowerCase().includes(q.toLowerCase()));

  const total = invoices.filter((i) => i.status === "lunas").reduce((a, b) => a + b.jumlah, 0);
  const belum = invoices.filter((i) => i.status !== "lunas").reduce((a, b) => a + b.jumlah, 0);
  const terlambat = invoices.filter((i) => i.status === "terlambat").length;

  const exportCSV = () => {
    const rows = [["ID", "Siswa", "Bulan", "Jenis", "Jumlah", "Status", "Metode", "Dibayar"], ...list.map((i) => [i.id, siswa.find((s) => s.id === i.siswaId)?.nama ?? "", i.bulan, i.jenis, i.jumlah, i.status, i.metode ?? "", i.dibayarPada ?? ""])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `pembayaran-${Date.now()}.csv`;
    a.click();
    toast.success("Export CSV berhasil");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Rekap Pembayaran" description="Rekonsiliasi dan monitoring pembayaran SPP." actions={<Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4" /> Export CSV</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total lunas" value={`Rp ${(total / 1_000_000).toFixed(1)} jt`} icon={CheckCircle2} tone="success" />
        <StatCard label="Belum lunas" value={`Rp ${(belum / 1_000_000).toFixed(1)} jt`} icon={Wallet} tone="warning" />
        <StatCard label="Terlambat" value={terlambat} icon={AlertCircle} tone="danger" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Cari siswa…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={status} onValueChange={(v: any) => setStatus(v)}>
          <SelectTrigger className="w-48"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="lunas">Lunas</SelectItem>
            <SelectItem value="belum-bayar">Belum bayar</SelectItem>
            <SelectItem value="terlambat">Terlambat</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-2xl border border-border/60 bg-card shadow-soft">
        <Table>
          <TableHeader><TableRow><TableHead>Siswa</TableHead><TableHead>Periode</TableHead><TableHead>Jenis</TableHead><TableHead>Jumlah</TableHead><TableHead>Status</TableHead><TableHead>Dibayar</TableHead></TableRow></TableHeader>
          <TableBody>
            {list.map((i) => {
              const s = siswa.find((x) => x.id === i.siswaId);
              return (
                <TableRow key={i.id}>
                  <TableCell className="font-semibold">{s?.nama}</TableCell>
                  <TableCell>{i.bulan}</TableCell>
                  <TableCell className="capitalize">{i.jenis}</TableCell>
                  <TableCell>Rp {i.jumlah.toLocaleString("id-ID")}</TableCell>
                  <TableCell><Badge variant={i.status === "lunas" ? "default" : i.status === "terlambat" ? "destructive" : "secondary"}>{i.status}</Badge></TableCell>
                  <TableCell>{i.dibayarPada ? format(new Date(i.dibayarPada), "dd MMM yyyy", { locale: idLocale }) : "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
