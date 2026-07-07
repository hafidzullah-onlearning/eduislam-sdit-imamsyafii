import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB, genId } from "@/lib/mock-store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/app/admin/pengumuman")({
  component: () => {
    const { user } = useAuth();
    const list = useDB((s) => s.pengumuman);
    const patch = useDB((s) => s.patch);
    const [open, setOpen] = useState(false);
    const [f, setF] = useState({ judul: "", isi: "", targetRole: "semua" as const });
    const save = () => {
      if (!f.judul || !f.isi) return toast.error("Lengkapi field");
      patch("pengumuman", (items) => [
        { id: genId("pg"), ...f, tanggal: new Date().toISOString(), createdBy: user!.id },
        ...items,
      ]);
      toast.success("Pengumuman diterbitkan");
      setOpen(false);
      setF({ judul: "", isi: "", targetRole: "semua" });
    };
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pengumuman"
          description="Broadcast informasi ke guru, orang tua, atau semua user."
          actions={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>+ Pengumuman baru</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pengumuman baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Judul</Label>
                    <Input
                      value={f.judul}
                      onChange={(e) => setF({ ...f, judul: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Isi</Label>
                    <Textarea
                      rows={5}
                      value={f.isi}
                      onChange={(e) => setF({ ...f, isi: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Target</Label>
                    <Select
                      value={f.targetRole}
                      onValueChange={(v: any) => setF({ ...f, targetRole: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semua">Semua</SelectItem>
                        <SelectItem value="guru">Guru</SelectItem>
                        <SelectItem value="ortu">Orang Tua</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={save}>Terbitkan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />
        <div className="space-y-3">
          {list.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold">{p.judul}</h3>
                <Badge variant="outline" className="capitalize">
                  {p.targetRole}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.isi}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {format(new Date(p.tanggal), "EEEE, dd MMM yyyy", { locale: idLocale })}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  },
});
