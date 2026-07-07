import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { EmptyState } from "@/components/app/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB, genId } from "@/lib/mock-store";
import { toast } from "sonner";
import { createServerFn } from "@tanstack/react-start";
import fs from "node:fs";
import path from "node:path";

export const Route = createFileRoute("/app/materi")({ component: MateriPage });

// Helper to reliably load GEMINI_API_KEY in both dev and production
function getGeminiApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/^GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/m);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch (e) {
    console.error("Error reading .env file manually:", e);
  }
  return null;
}

// Server function for generating material learning instructions via Gemini AI
export const generateMateriInstructions = createServerFn({ method: "POST" })
  .validator(
    (data: { judul: string; mapelName: string; kelasName: string; linkUrl: string }) => data,
  )
  .handler(async ({ data }) => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured on the server");
    }

    const prompt = `Tulis deskripsi / petunjuk belajar yang ramah, hangat, dan sangat mudah dipahami oleh orang tua siswa Sekolah Dasar (SD) serta anak mereka untuk mendampingi belajar di rumah.
Materi pelajaran ini dikirim oleh guru untuk dipelajari mandiri.

Informasi Materi:
- Judul Materi: ${data.judul}
- Mata Pelajaran: ${data.mapelName}
- Tingkat Kelas: ${data.kelasName}
- Tautan Sumber/Lampiran: ${data.linkUrl || "Tidak ada lampiran"}

Petunjuk belajar ini WAJIB berisi:
1. Ringkasan Singkat: Jelaskan apa yang dipelajari dengan kalimat yang sangat sederhana dan menarik bagi anak-anak.
2. Panduan Orang Tua: Langkah-langkah konkrit dan praktis yang bisa dilakukan orang tua di rumah untuk membantu anak memahami materi ini.
3. Pertanyaan Pemantik: 2-3 pertanyaan seru/interaktif yang bisa ditanyakan orang tua untuk memicu rasa ingin tahu anak.

Gunakan gaya bahasa yang santun, hangat, bernuansa Islami (menggunakan Assalamu'alaikum / Barakallahu fiikum jika sesuai), dan hindari istilah akademis yang terlalu rumit.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
    }

    const resData = (await response.json()) as any;
    const generatedText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error("No text returned from Gemini API");
    }

    return { text: generatedText };
  });

// High-quality local rule-based fallback generator
const generateLocalInstructions = (
  judul: string,
  mapelName: string,
  kelasName: string,
  linkUrl: string,
) => {
  return `Assalamu'alaikum Warahmatullahi Wabarakatuh, Ayah dan Bunda yang dirahmati Allah.

Berikut adalah petunjuk belajar untuk mendampingi Ananda mempelajari materi "${judul}" dalam mata pelajaran ${mapelName} untuk ${kelasName}.

1. Ringkasan Singkat:
Hari ini kita akan belajar tentang "${judul}". Materi ini mengajak Ananda untuk memahami konsep dasar dari ${mapelName} dengan cara yang menyenangkan dan praktis.

2. Panduan Pendampingan untuk Orang Tua di Rumah:
- Langkah 1: Ajak Ananda berdoa sebelum mulai belajar agar Allah memberikan keberkahan ilmu.
- Langkah 2: Pelajari materi bersama melalui tautan berikut: ${linkUrl || "(Gunakan buku cetak/catatan Ananda)"}
- Langkah 3: Berikan senyuman dan apresiasi atas setiap proses belajar yang diselesaikan Ananda.

3. Pertanyaan Pemantik Seru:
- "Apa hal baru dan menarik yang sudah kamu pelajari tadi?"
- "Bisa tolong ceritakan kembali bagian paling menyenangkan dari materi ini ke Ayah/Bunda?"

Barakallahu fiikum. Selamat belajar bersama Ananda tercinta!`;
};

interface Materi {
  id: string;
  judul: string;
  deskripsi: string;
  linkUrl: string;
  kelasId: string;
  mapelId: string;
  guruId: string;
  createdAt: string;
}

function MateriPage() {
  const { session, user } = useAuth();
  const isGuru = user?.role === "guru";
  const isOrtu = user?.role === "ortu";
  const isAdmin = user?.role === "admin";

  const kelas = useDB((s) => s.kelas);
  const mapel = useDB((s) => s.mapel);
  const siswa = useDB((s) => s.siswa);
  const materiList = useDB((s) => s.materi);
  const patch = useDB((s) => s.patch);

  const myKelas = isGuru ? kelas.filter((k) => k.waliKelasId === user?.id) : [];

  const anak = isOrtu
    ? siswa
        .filter((s) => s.orangTuaId === user?.id && s.status !== "nonaktif")
        .find((k) => k.id === session?.activeSiswaId)
    : null;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    linkUrl: "",
    kelasId: "",
    mapelId: "",
  });
  const [loadingAI, setLoadingAI] = useState(false);

  const handleSave = () => {
    if (!form.judul || !form.kelasId || !form.mapelId) {
      return toast.error("Lengkapi semua field wajib");
    }

    const newMateri: Materi = {
      id: genId("materi"),
      judul: form.judul,
      deskripsi: form.deskripsi,
      linkUrl: form.linkUrl,
      kelasId: form.kelasId,
      mapelId: form.mapelId,
      guruId: user?.id ?? "",
      createdAt: new Date().toISOString(),
    };

    patch("materi", (prev) => [...prev, newMateri]);
    toast.success("Materi berhasil dibagikan");
    setOpen(false);
    setForm({ judul: "", deskripsi: "", linkUrl: "", kelasId: "", mapelId: "" });
  };

  const handleDelete = (id: string) => {
    patch("materi", (prev) => prev.filter((m) => m.id !== id));
    toast.success("Materi berhasil dihapus");
  };

  const handleGenerateAI = async () => {
    if (!form.judul || !form.kelasId || !form.mapelId) {
      return toast.error(
        "Lengkapi Judul, Mapel, dan Kelas terlebih dahulu agar AI memahami konteksnya.",
      );
    }

    setLoadingAI(true);
    const selectedKelas = kelas.find((k) => k.id === form.kelasId);
    const selectedMapel = mapel.find((m) => m.id === form.mapelId);

    const kelasName = selectedKelas ? `Kelas ${selectedKelas.nama}` : "Kelas";
    const mapelName = selectedMapel ? selectedMapel.nama : "Pelajaran";

    try {
      const response = await generateMateriInstructions({
        data: {
          judul: form.judul,
          mapelName,
          kelasName,
          linkUrl: form.linkUrl,
        },
      });

      if (!response || !response.text) {
        throw new Error("Received empty or invalid response from AI server function");
      }

      setForm((prev) => ({ ...prev, deskripsi: response.text }));
      toast.success("Petunjuk belajar berhasil dibuat oleh AI!");
    } catch (error) {
      console.error("AI generation failed:", error);
      const fallbackText = generateLocalInstructions(
        form.judul,
        mapelName,
        kelasName,
        form.linkUrl,
      );
      setForm((prev) => ({ ...prev, deskripsi: fallbackText }));
      toast.info("Menggunakan draf petunjuk standar karena AI tidak merespon.");
    } finally {
      setLoadingAI(false);
    }
  };

  // Filter list of materials to show based on user role and active child
  const list = isGuru
    ? materiList.filter((m) => myKelas.some((k) => k.id === m.kelasId))
    : isOrtu
      ? anak
        ? materiList.filter((m) => m.kelasId === anak.kelasId)
        : []
      : materiList;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materi Pembelajaran"
        description={
          isOrtu
            ? "Materi belajar dan petunjuk pendampingan belajar untuk Ananda di rumah."
            : "Bagikan materi, video, dan bahan bacaan ke kelas yang Anda ampu."
        }
        actions={
          isGuru || isAdmin ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" /> Materi baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Materi baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Judul Materi *</Label>
                    <Input
                      value={form.judul}
                      onChange={(e) => setForm({ ...form, judul: e.target.value })}
                      placeholder="Contoh: Pengenalan Huruf Hijaiyah"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Mata Pelajaran *</Label>
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
                      <Label>Kelas Penerima *</Label>
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
                    <Label>URL Sumber (Drive / YouTube / PDF)</Label>
                    <Input
                      value={form.linkUrl}
                      onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label>Deskripsi / Petunjuk Belajar</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-primary font-semibold hover:bg-primary/10 gap-1 px-2.5 rounded-full"
                        onClick={handleGenerateAI}
                        disabled={loadingAI}
                      >
                        {loadingAI ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                            Menulis...
                          </>
                        ) : (
                          "✨ Tulis dengan AI"
                        )}
                      </Button>
                    </div>
                    <Textarea
                      value={form.deskripsi}
                      onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                      placeholder="Tulis petunjuk belajar atau klik tombol di atas untuk generate otomatis oleh AI..."
                      className="h-36 font-sans text-sm"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleSave}>Bagikan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {list.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Belum ada materi"
          description={
            isOrtu
              ? "Belum ada materi pembelajaran yang dibagikan guru untuk kelas Ananda."
              : "Buat materi pertama Anda dan bagikan ke kelas."
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((m) => {
            const k = kelas.find((x) => x.id === m.kelasId);
            const mp = mapel.find((x) => x.id === m.mapelId);
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-foreground">{m.judul}</h3>
                      <Badge variant="outline">Kelas {k?.nama}</Badge>
                      <Badge variant="secondary">{mp?.nama}</Badge>
                    </div>
                    {m.deskripsi && (
                      <div className="mt-3 text-sm text-foreground/90 whitespace-pre-wrap bg-surface-soft/40 p-4 rounded-xl border border-border/40">
                        {m.deskripsi}
                      </div>
                    )}
                    {m.linkUrl && (
                      <div className="mt-3">
                        <a
                          href={m.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition"
                        >
                          Buka Materi Belajar ↗
                        </a>
                      </div>
                    )}
                  </div>
                  {(isGuru || isAdmin) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive border-border/60 shrink-0"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
