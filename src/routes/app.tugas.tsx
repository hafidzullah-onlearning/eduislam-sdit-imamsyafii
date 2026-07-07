import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ClipboardList, Plus, Upload, MessageSquare, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB, genId, useLazyLoadTables } from "@/lib/mock-store";
import { format, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/app/tugas")({
  component: TugasPage,
});

function TugasPage() {
  const loading = useLazyLoadTables(["tugas", "submissions", "mapel"]);
  const { session } = useAuth();

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (session?.role === "guru") return <GuruTugas />;
  return <OrtuTugas />;
}

function OrtuTugas() {
  const { user, session } = useAuth();
  const siswa = useDB((s) => s.siswa);
  const tugas = useDB((s) => s.tugas);
  const mapel = useDB((s) => s.mapel);
  const submissions = useDB((s) => s.submissions);
  const patch = useDB((s) => s.patch);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"aktif" | "selesai">("aktif");
  const [dialog, setDialog] = useState<string | null>(null);
  const [bukti, setBukti] = useState("");
  const [komentar, setKomentar] = useState("");

  const anak = siswa
    .filter((s) => s.orangTuaId === user?.id && s.status !== "nonaktif")
    .find((k) => k.id === session?.activeSiswaId);

  const list = useMemo(() => {
    if (!anak) return [];
    return tugas
      .filter((t) => t.kelasId === anak.kelasId)
      .filter((t) => {
        const sub = submissions.find((s) => s.tugasId === t.id && s.siswaId === anak.id);
        return tab === "selesai" ? sub?.status === "selesai" : sub?.status !== "selesai";
      })
      .filter((t) => t.judul.toLowerCase().includes(q.toLowerCase()));
  }, [tugas, submissions, anak, tab, q]);

  const submit = (tugasId: string) => {
    if (!anak) return;
    const existing = submissions.find((s) => s.tugasId === tugasId && s.siswaId === anak.id);
    patch("submissions", (items) => {
      if (existing) {
        return items.map((it) =>
          it.id === existing.id
            ? {
                ...it,
                status: "dikerjakan",
                buktiUrl: bukti,
                komentarOrtu: komentar,
                updatedAt: new Date().toISOString(),
              }
            : it,
        );
      }
      return [
        ...items,
        {
          id: genId("sub"),
          tugasId,
          siswaId: anak.id,
          status: "dikerjakan" as const,
          buktiUrl: bukti,
          komentarOrtu: komentar,
          updatedAt: new Date().toISOString(),
        },
      ];
    });
    toast.success("Bukti pengerjaan tersimpan");
    setDialog(null);
    setBukti("");
    setKomentar("");
  };

  const markDone = (tugasId: string) => {
    if (!anak) return;
    const existing = submissions.find((s) => s.tugasId === tugasId && s.siswaId === anak.id);
    patch("submissions", (items) => {
      if (existing)
        return items.map((it) =>
          it.id === existing.id
            ? { ...it, status: "selesai" as const, updatedAt: new Date().toISOString() }
            : it,
        );
      return [
        ...items,
        {
          id: genId("sub"),
          tugasId,
          siswaId: anak.id,
          status: "selesai" as const,
          updatedAt: new Date().toISOString(),
        },
      ];
    });
    toast.success("Tugas ditandai selesai — MasyaAllah!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tugas Anak"
        description={anak ? `Pendampingan tugas untuk ${anak.nama}` : "Pilih anak terlebih dahulu"}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "aktif" | "selesai")}>
          <TabsList>
            <TabsTrigger value="aktif">Aktif</TabsTrigger>
            <TabsTrigger value="selesai">Selesai</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Cari tugas…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={tab === "aktif" ? "Semua tugas beres!" : "Belum ada tugas selesai"}
          description="Alhamdulillah."
        />
      ) : (
        <div className="space-y-3">
          {list.map((t) => {
            const m = mapel.find((x) => x.id === t.mapelId);
            const sub = anak
              ? submissions.find((s) => s.tugasId === t.id && s.siswaId === anak.id)
              : null;
            return (
              <div
                key={t.id}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{t.judul}</h3>
                      <Badge variant="outline">{m?.nama}</Badge>
                      {sub && (
                        <Badge
                          variant={
                            sub.status === "selesai"
                              ? "default"
                              : sub.status === "dikerjakan"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {sub.status}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.deskripsi}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Deadline{" "}
                      {format(new Date(t.deadline), "EEEE, dd MMM yyyy", { locale: idLocale })} •{" "}
                      {formatDistanceToNow(new Date(t.deadline), {
                        locale: idLocale,
                        addSuffix: true,
                      })}
                    </p>
                    {t.linkUrl && (
                      <a
                        href={t.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                      >
                        Buka lampiran ↗
                      </a>
                    )}
                    {sub?.komentarGuru && (
                      <div className="mt-3 rounded-lg bg-emerald-500/10 p-3 text-xs">
                        <p className="font-semibold text-emerald-700">Komentar guru:</p>
                        <p className="mt-1 text-emerald-900">{sub.komentarGuru}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={dialog === t.id} onOpenChange={(o) => setDialog(o ? t.id : null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4" /> Unggah bukti
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Unggah bukti pengerjaan</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label>URL bukti (foto/dokumen)</Label>
                            <Input
                              placeholder="https://…"
                              value={bukti}
                              onChange={(e) => setBukti(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Komentar untuk guru (opsional)</Label>
                            <Textarea
                              value={komentar}
                              onChange={(e) => setKomentar(e.target.value)}
                              placeholder="Contoh: Faris mengerjakan dengan bantuan sedikit di soal nomor 5."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setDialog(null)}>
                            Batal
                          </Button>
                          <Button onClick={() => submit(t.id)}>Simpan</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" onClick={() => markDone(t.id)}>
                      Tandai selesai
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GuruTugas() {
  const { user } = useAuth();
  const tugas = useDB((s) => s.tugas);
  const kelas = useDB((s) => s.kelas);
  const mapel = useDB((s) => s.mapel);
  const siswa = useDB((s) => s.siswa);
  const submissions = useDB((s) => s.submissions);
  const patch = useDB((s) => s.patch);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    mapelId: "",
    kelasId: "",
    deadline: "",
    linkUrl: "",
  });
  const [inspectTugasId, setInspectTugasId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const myKelas = kelas.filter((k) => k.waliKelasId === user?.id);
  const list = tugas
    .filter((t) => myKelas.some((k) => k.id === t.kelasId))
    .filter((t) => t.judul.toLowerCase().includes(q.toLowerCase()));

  const save = () => {
    if (!form.judul || !form.mapelId || !form.kelasId || !form.deadline)
      return toast.error("Lengkapi semua field wajib");
    patch("tugas", (items) => [
      ...items,
      {
        id: genId("t"),
        judul: form.judul,
        deskripsi: form.deskripsi,
        mapelId: form.mapelId,
        kelasId: form.kelasId,
        deadline: new Date(form.deadline).toISOString(),
        linkUrl: form.linkUrl,
        createdAt: new Date().toISOString(),
        createdBy: user!.id,
        status: "aktif" as const,
      },
    ]);
    toast.success("Tugas berhasil dibuat");
    setOpen(false);
    setForm({ judul: "", deskripsi: "", mapelId: "", kelasId: "", deadline: "", linkUrl: "" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Tugas"
        description="Kelola tugas untuk kelas yang Anda ampu."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Tugas baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Tugas baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Judul *</Label>
                  <Input
                    value={form.judul}
                    onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Deskripsi</Label>
                  <Textarea
                    value={form.deskripsi}
                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Mata pelajaran *</Label>
                    <Select
                      value={form.mapelId}
                      onValueChange={(v) => setForm({ ...form, mapelId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {mapel.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Kelas *</Label>
                    <Select
                      value={form.kelasId}
                      onValueChange={(v) => setForm({ ...form, kelasId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {myKelas.map((k) => (
                          <SelectItem key={k.id} value={k.id}>
                            Kelas {k.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Deadline *</Label>
                  <Input
                    type="datetime-local"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>URL lampiran (opsional)</Label>
                  <Input
                    placeholder="Google Drive / YouTube"
                    value={form.linkUrl}
                    onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button onClick={save}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <Input
        placeholder="Cari judul tugas…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-md"
      />

      {list.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada tugas"
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Buat tugas
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((t) => {
            const classStudents = siswa.filter(
              (s) => s.kelasId === t.kelasId && s.status !== "nonaktif",
            );
            const submitted = submissions.filter((s) => s.tugasId === t.id);
            const done = submitted.filter((s) => s.status === "selesai").length;
            const k = kelas.find((x) => x.id === t.kelasId);
            const m = mapel.find((x) => x.id === t.mapelId);
            return (
              <div
                key={t.id}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{t.judul}</h3>
                      <Badge variant="outline">Kelas {k?.nama}</Badge>
                      <Badge variant="secondary">{m?.nama}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.deskripsi}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Deadline{" "}
                      {format(new Date(t.deadline), "dd MMM yyyy HH:mm", { locale: idLocale })}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-primary">
                      {done}/{classStudents.length} siswa selesai
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={inspectTugasId === t.id ? "default" : "outline"}
                      onClick={() => setInspectTugasId(inspectTugasId === t.id ? null : t.id)}
                    >
                      {inspectTugasId === t.id ? "Tutup" : "Periksa"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        patch("tugas", (items) => items.filter((x) => x.id !== t.id));
                        toast.success("Tugas dihapus");
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>

                {inspectTugasId === t.id && (
                  <div className="mt-4 border-t border-border/40 pt-4 space-y-3">
                    <h4 className="font-bold text-sm text-foreground">Status Pengumpulan Siswa:</h4>
                    {classStudents.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Tidak ada siswa aktif di kelas ini.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {classStudents.map((st) => {
                          const sub = submissions.find(
                            (s) => s.tugasId === t.id && s.siswaId === st.id,
                          );
                          const status = sub?.status ?? "belum";
                          const stFeedback = feedback[st.id] ?? sub?.komentarGuru ?? "";
                          return (
                            <div
                              key={st.id}
                              className="flex flex-col gap-2 rounded-xl border border-border/60 p-3 bg-surface-soft/20"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-semibold text-sm">{st.nama}</span>
                                  {sub?.updatedAt && (
                                    <span className="text-[10px] text-muted-foreground ml-2">
                                      {formatDistanceToNow(new Date(sub.updatedAt), {
                                        locale: idLocale,
                                        addSuffix: true,
                                      })}
                                    </span>
                                  )}
                                </div>
                                <Badge
                                  variant={
                                    status === "selesai"
                                      ? "default"
                                      : status === "dikerjakan"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  {status === "selesai"
                                    ? "Selesai"
                                    : status === "dikerjakan"
                                      ? "Perlu Diperiksa"
                                      : "Belum Mengerjakan"}
                                </Badge>
                              </div>
                              {sub?.buktiUrl && (
                                <div className="text-xs">
                                  <span className="font-semibold">Bukti: </span>
                                  <a
                                    href={sub.buktiUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary hover:underline font-semibold break-all"
                                  >
                                    {sub.buktiUrl} ↗
                                  </a>
                                </div>
                              )}
                              {sub?.komentarOrtu && (
                                <p className="text-xs italic text-muted-foreground">
                                  "Ortu: {sub.komentarOrtu}"
                                </p>
                              )}
                              <div className="mt-1 flex gap-2 items-center">
                                <Input
                                  placeholder="Komentar guru..."
                                  value={stFeedback}
                                  onChange={(e) =>
                                    setFeedback({ ...feedback, [st.id]: e.target.value })
                                  }
                                  className="h-8 text-xs max-w-xs bg-card"
                                />
                                <Button
                                  size="sm"
                                  className="h-8 text-xs shrink-0"
                                  onClick={() => {
                                    if (sub) {
                                      patch("submissions", (items) =>
                                        items.map((x) =>
                                          x.id === sub.id
                                            ? {
                                                ...x,
                                                status: "selesai" as const,
                                                komentarGuru: stFeedback,
                                                updatedAt: new Date().toISOString(),
                                              }
                                            : x,
                                        ),
                                      );
                                    } else {
                                      patch("submissions", (items) => [
                                        ...items,
                                        {
                                          id: genId("sub"),
                                          tugasId: t.id,
                                          siswaId: st.id,
                                          status: "selesai" as const,
                                          komentarGuru: stFeedback,
                                          updatedAt: new Date().toISOString(),
                                        },
                                      ]);
                                    }
                                    toast.success(`Tugas ${st.nama} disetujui selesai`);
                                  }}
                                >
                                  Selesai
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
