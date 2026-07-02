import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useDB } from "@/lib/mock-store";

export const Route = createFileRoute("/app/admin/kelas")({ component: () => {
  const kelas = useDB((s) => s.kelas);
  const users = useDB((s) => s.users);
  const siswa = useDB((s) => s.siswa);
  return (
    <div className="space-y-6">
      <PageHeader title="Master Kelas" description="Kelola kelas dan wali kelas." actions={<Button>+ Kelas baru</Button>} />
      <div className="rounded-2xl border border-border/60 bg-card shadow-soft">
        <Table>
          <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Tingkat</TableHead><TableHead>Wali Kelas</TableHead><TableHead>Siswa</TableHead><TableHead>Tahun</TableHead></TableRow></TableHeader>
          <TableBody>
            {kelas.map((k) => (
              <TableRow key={k.id}>
                <TableCell className="font-semibold">Kelas {k.nama}</TableCell>
                <TableCell>{k.tingkat}</TableCell>
                <TableCell>{users.find((u) => u.id === k.waliKelasId)?.name}</TableCell>
                <TableCell>{siswa.filter((s) => s.kelasId === k.id).length}</TableCell>
                <TableCell>{k.tahunAjaran}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} });
