import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDB } from "@/lib/mock-store";

export const Route = createFileRoute("/app/admin/mapel")({ component: () => {
  const mapel = useDB((s) => s.mapel);
  const users = useDB((s) => s.users);
  return (
    <div className="space-y-6">
      <PageHeader title="Master Mata Pelajaran" description="Kelola mata pelajaran dan pengampu." actions={<Button>+ Mapel baru</Button>} />
      <div className="rounded-2xl border border-border/60 bg-card shadow-soft">
        <Table>
          <TableHeader><TableRow><TableHead>Kode</TableHead><TableHead>Mata Pelajaran</TableHead><TableHead>Pengampu</TableHead></TableRow></TableHeader>
          <TableBody>
            {mapel.map((m) => (
              <TableRow key={m.id}>
                <TableCell><Badge variant="outline">{m.kode}</Badge></TableCell>
                <TableCell className="font-semibold">{m.nama}</TableCell>
                <TableCell>{users.find((u) => u.id === m.guruId)?.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} });
