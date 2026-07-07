import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/common/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDB } from "@/lib/mock-store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/app/admin/audit-log")({
  component: () => {
    const audit = useDB((s) => s.audit);
    const users = useDB((s) => s.users);
    return (
      <div className="space-y-6">
        <PageHeader
          title="Audit Log"
          description="Rekam jejak seluruh aktivitas penting di sistem."
        />
        <div className="rounded-2xl border border-border/60 bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs">
                    {format(new Date(a.tanggal), "dd MMM yyyy HH:mm", { locale: idLocale })}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {users.find((u) => u.id === a.userId)?.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{a.aksi}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{a.target}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.ip ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  },
});
