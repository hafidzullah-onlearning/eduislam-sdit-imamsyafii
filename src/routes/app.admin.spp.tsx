import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/admin/spp")({ component: () => (
  <div className="space-y-6">
    <PageHeader title="Tarif SPP" description="Kelola tarif SPP per tingkat." actions={<Button>+ Tarif baru</Button>} />
    <div className="rounded-2xl border border-border/60 bg-card shadow-soft">
      <Table>
        <TableHeader><TableRow><TableHead>Tingkat</TableHead><TableHead>Jenis</TableHead><TableHead>Nominal</TableHead><TableHead>Berlaku</TableHead></TableRow></TableHeader>
        <TableBody>
          {[
            { t: "Kelas 1-2", j: "SPP Bulanan", n: 800000, b: "2025/2026" },
            { t: "Kelas 3-4", j: "SPP Bulanan", n: 850000, b: "2025/2026" },
            { t: "Kelas 5-6", j: "SPP Bulanan", n: 900000, b: "2025/2026" },
            { t: "Semua", j: "Uang Kegiatan", n: 250000, b: "Semester Genap" },
          ].map((r, i) => (
            <TableRow key={i}><TableCell className="font-semibold">{r.t}</TableCell><TableCell>{r.j}</TableCell><TableCell>Rp {r.n.toLocaleString("id-ID")}</TableCell><TableCell>{r.b}</TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
) });
