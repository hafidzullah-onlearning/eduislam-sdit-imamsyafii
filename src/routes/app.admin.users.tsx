import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDB } from "@/lib/mock-store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/admin/users")({ component: UsersPage });

function UsersPage() {
  const users = useDB((s) => s.users);
  const patch = useDB((s) => s.patch);
  const [tab, setTab] = useState<"guru" | "ortu" | "admin">("guru");
  const [q, setQ] = useState("");
  const list = users.filter((u) => u.role === tab).filter((u) => u.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Manajemen User" description="Kelola guru, orang tua, dan admin sekolah." actions={<Button>+ Tambah user</Button>} />
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="guru">Guru</TabsTrigger>
          <TabsTrigger value="ortu">Orang Tua</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
      </Tabs>
      <Input placeholder="Cari nama…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
      <div className="rounded-2xl border border-border/60 bg-card shadow-soft">
        <Table>
          <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Email</TableHead><TableHead>HP</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            {list.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-semibold">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone ?? "—"}</TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => toast.success("Password direset")}>Reset password</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
