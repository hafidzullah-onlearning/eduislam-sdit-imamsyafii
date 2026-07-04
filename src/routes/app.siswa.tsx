import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB } from "@/lib/mock-store";

export const Route = createFileRoute("/app/siswa")({ component: SiswaPage });

function SiswaPage() {
  const { user } = useAuth();
  const kelas = useDB((s) => s.kelas);
  const siswa = useDB((s) => s.siswa);
  const [q, setQ] = useState("");
  const myKelas = kelas.filter((k) => k.waliKelasId === user?.id);
  const list = siswa.filter((s) => myKelas.some((k) => k.id === s.kelasId)).filter((s) => s.nama.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Siswa" description={`${list.length} siswa aktif di kelas Anda.`} />
      <Input placeholder="Cari nama atau NIS…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
      <div className="rounded-2xl border border-border/60 bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Nama</TableHead><TableHead>NIS</TableHead><TableHead>Kelas</TableHead><TableHead>L/P</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {list.map((s) => {
              const k = kelas.find((x) => x.id === s.kelasId);
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-semibold">{s.nama}</TableCell>
                  <TableCell>{s.nis}</TableCell>
                  <TableCell><Badge variant="outline">{k?.nama}</Badge></TableCell>
                  <TableCell>{s.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
