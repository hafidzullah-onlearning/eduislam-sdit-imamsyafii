import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/app/common/PageHeader";
import { StatCard } from "@/components/app/common/StatCard";
import { TrendingUp, Users, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/mock-auth";
import { useDB, genId } from "@/lib/mock-store";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { createServerFn } from "@tanstack/react-start";
import fs from "node:fs";
import path from "node:path";
import { toast } from "sonner";

export const Route = createFileRoute("/app/laporan")({ component: LaporanPage });

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

// Server function for generating class progress recommendations via Gemini AI
export const generateLaporanSaran = createServerFn({ method: "POST" })
  .validator(
    (data: {
      jumlahSiswa: number;
      rataNilai: number;
      diBawahKkm: number;
      tahfidzTotal: number;
      tahfidzLancar: number;
      skorKarakter: number;
      skorDisiplin: number;
      skorKeaktifan: number;
      skorKerjasama: number;
      moodSenang: number;
      moodBiasa: number;
      moodBosan: number;
      moodSedih: number;
      moodMarah: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured on the server");
    }

    const prompt = `Sebagai Konsultan Pendidikan Islam (EduIslam Advisor), berikan analisis ringkas dan saran taktis untuk guru wali kelas berdasarkan data performa siswa kelasnya minggu ini.
PANJANG JAWABAN HARUS BERKISAR ANTARA 400 HINGGA 500 KATA SAJA. JANGAN TERLALU PENDEK DAN JANGAN MELEBIHI 500 KATA.

Data Kelas:
- Jumlah Siswa: ${data.jumlahSiswa}
- Rata-rata Nilai Akademik Kelas: ${data.rataNilai} (dari KKM: 75)
- Jumlah Siswa di bawah KKM: ${data.diBawahKkm} dari ${data.jumlahSiswa} siswa.
- Setoran Tahfidz: ${data.tahfidzLancar} lancar dari total ${data.tahfidzTotal} setoran.
- Rata-rata Skor Perilaku Siswa (Skala 1-5):
  * Karakter Islami: ${data.skorKarakter.toFixed(1)}/5
  * Disiplin: ${data.skorDisiplin.toFixed(1)}/5
  * Keaktifan: ${data.skorKeaktifan.toFixed(1)}/5
  * Kerjasama: ${data.skorKerjasama.toFixed(1)}/5
- Distribusi Mood Siswa di Sekolah Hari Ini: ${data.moodSenang} senang, ${data.moodBiasa} biasa, ${data.moodBosan} bosan, ${data.moodSedih} sedih, ${data.moodMarah} marah.

Tuliskan analisis & rekomendasi dalam format berikut:
1. **Analisis Umum**: Ringkasan kondisi akademik, hafalan, karakter, dan emosional siswa.
2. **Rekomendasi Akademik**: Langkah taktis meningkatkan nilai siswa yang di bawah KKM.
3. **Rekomendasi Karakter & Spiritual**: Pendekatan Islami untuk meningkatkan disiplin/karakter atau hafalan Qur'an.
4. **Perhatian Emosional**: Catatan tentang suasana hati siswa dan saran menciptakan atmosfer kelas yang ceria.

Gunakan bahasa Indonesia yang santun, hangat, bernuansa Islami (menggunakan salam/barakallah jika sesuai), dan pastikan total panjang jawaban Anda adalah antara 400 sampai 500 kata.`;

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
const generateLocalLaporanSaran = (data: {
  jumlahSiswa: number;
  rataNilai: number;
  diBawahKkm: number;
  tahfidzTotal: number;
  tahfidzLancar: number;
  skorKarakter: number;
  skorDisiplin: number;
  skorKeaktifan: number;
  skorKerjasama: number;
}) => {
  return `### Analisis & Saran Pembelajaran Kelas (Draf Standar)

Assalamu'alaikum Warahmatullahi Wabarakatuh, Ustadz/Ustadzah yang dirahmati Allah. Berikut adalah analisis perkembangan umum dan rekomendasi taktis untuk kelas Anda berdasarkan data statistik yang tercatat minggu ini:

1. **Analisis Umum**:
Rata-rata akademik kelas saat ini berada di angka **${data.rataNilai}**, dengan **${data.diBawahKkm}** siswa masih berada di bawah KKM (75). Hal ini memerlukan intervensi terstruktur agar pemahaman konsep dasar siswa dapat meningkat sebelum evaluasi berikutnya. Di sisi spiritual, terdapat **${data.tahfidzLancar}** setoran lancar dari total **${data.tahfidzTotal}** setoran tahfidz yang diajukan siswa. Skor karakter menunjukkan performa disiplin berada di angka **${data.skorDisiplin.toFixed(1)}/5** dan karakter Islami di angka **${data.skorKarakter.toFixed(1)}/5**, yang mengindikasikan adab harian siswa sudah cukup baik namun tetap memerlukan pembiasaan konsisten.

2. **Rekomendasi Akademik**:
- Lakukan sesi bimbingan belajar tambahan (*remedial teaching*) secara terfokus untuk **${data.diBawahKkm}** siswa yang nilainya masih di bawah KKM.
- Selenggarakan pembelajaran berbasis tutor sebaya (*peer tutoring*), memasangkan siswa berprestasi tinggi dengan siswa yang membutuhkan bantuan ekstra untuk memperkuat pemahaman konsep bersama.
- Berikan latihan soal terarah secara berkala untuk mengevaluasi pemahaman materi sulit sebelum beralih ke bab baru.

3. **Rekomendasi Karakter & Spiritual**:
- Untuk mendongkrak setoran tahfidz, buat program target hafalan harian yang realistis dan jadwalkan sesi murojaah bersama selama 10-15 menit setiap pagi sebelum jam pelajaran dimulai.
- Tingkatkan kedisiplinan dan adab harian dengan memperkuat pembiasaan salat dhuha dan dhuhur berjamaah, serta memberikan apresiasi berupa bintang prestasi (*star chart*) mingguan bagi siswa terdisiplin.

4. **Perhatian Emosional**:
- Lakukan pendekatan persuasif kepada siswa yang menunjukkan suasana hati bosan atau sedih melalui percakapan hangat dari hati ke hati.
- Sisipkan jeda peregangan (*ice breaking*) bernuansa edukasi Islam di sela-sela jam pelajaran intensif guna mengembalikan fokus dan keceriaan belajar Ananda.

Barakallahu fiikum atas dedikasi dan kesabaran Ustadz/Ustadzah dalam mendidik para generasi penerus Islam. Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;
};

function LaporanPage() {
  const { user, session } = useAuth();
  const kelas = useDB((s) => s.kelas);
  const siswa = useDB((s) => s.siswa);
  const nilai = useDB((s) => s.nilai);
  const tahfidz = useDB((s) => s.tahfidz);
  const perilaku = useDB((s) => s.perilaku);
  const mood = useDB((s) => s.mood);

  const [saranAI, setSaranAI] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const myKelas = kelas.filter((k) => k.waliKelasId === user?.id);
  const mySiswa = siswa.filter((s) => myKelas.some((k) => k.id === s.kelasId));

  const chart = useMemo(
    () =>
      mySiswa.map((s) => {
        const arr = nilai.filter((n) => n.siswaId === s.id && n.status === "published");
        return {
          siswa: s.nama.split(" ")[0],
          Rata: arr.length ? Math.round(arr.reduce((a, b) => a + b.nilai, 0) / arr.length) : 0,
        };
      }),
    [mySiswa, nilai],
  );

  const rata = chart.length ? Math.round(chart.reduce((a, b) => a + b.Rata, 0) / chart.length) : 0;
  const diBawahKkm = chart.filter((item) => item.Rata < 75).length;

  // Compile class metrics for AI analysis
  const myTahfidz = useMemo(
    () => tahfidz.filter((t) => mySiswa.some((s) => s.id === t.siswaId)),
    [tahfidz, mySiswa],
  );
  const tahfidzTotal = myTahfidz.length;
  const tahfidzLancar = myTahfidz.filter((t) => t.status === "lancar").length;

  const myPerilaku = useMemo(
    () => perilaku.filter((p) => mySiswa.some((s) => s.id === p.siswaId)),
    [perilaku, mySiswa],
  );
  const pKarakter = myPerilaku.filter((p) => p.aspek === "karakter-islami");
  const pDisiplin = myPerilaku.filter((p) => p.aspek === "disiplin");
  const pKeaktifan = myPerilaku.filter((p) => p.aspek === "keaktifan");
  const pKerjasama = myPerilaku.filter((p) => p.aspek === "kerjasama");

  const avgKarakter = pKarakter.length
    ? pKarakter.reduce((a, b) => a + b.skor, 0) / pKarakter.length
    : 4.0;
  const avgDisiplin = pDisiplin.length
    ? pDisiplin.reduce((a, b) => a + b.skor, 0) / pDisiplin.length
    : 4.0;
  const avgKeaktifan = pKeaktifan.length
    ? pKeaktifan.reduce((a, b) => a + b.skor, 0) / pKeaktifan.length
    : 4.0;
  const avgKerjasama = pKerjasama.length
    ? pKerjasama.reduce((a, b) => a + b.skor, 0) / pKerjasama.length
    : 4.0;

  const myMoods = useMemo(
    () => mood.filter((m) => mySiswa.some((s) => s.id === m.siswaId) && m.sumber === "sekolah"),
    [mood, mySiswa],
  );
  const lastMoods = myMoods.slice(-30);
  const moodSenang = lastMoods.filter((m) => m.emoji === "senang").length;
  const moodBiasa = lastMoods.filter((m) => m.emoji === "biasa").length;
  const moodBosan = lastMoods.filter((m) => m.emoji === "bosan").length;
  const moodSedih = lastMoods.filter((m) => m.emoji === "sedih").length;
  const moodMarah = lastMoods.filter((m) => m.emoji === "marah").length;

  const handleGenerateSaran = async () => {
    setLoadingAI(true);
    try {
      const response = await generateLaporanSaran({
        data: {
          jumlahSiswa: mySiswa.length,
          rataNilai: rata,
          diBawahKkm,
          tahfidzTotal,
          tahfidzLancar,
          skorKarakter: avgKarakter,
          skorDisiplin: avgDisiplin,
          skorKeaktifan: avgKeaktifan,
          skorKerjasama: avgKerjasama,
          moodSenang,
          moodBiasa,
          moodBosan,
          moodSedih,
          moodMarah,
        },
      });

      if (!response || !response.text) {
        throw new Error("Received empty or invalid response from AI server function");
      }

      setSaranAI(response.text);
      toast.success("Analisis AI berhasil dibuat!");
    } catch (error) {
      console.error("AI class advisor failed:", error);
      const fallbackText = generateLocalLaporanSaran({
        jumlahSiswa: mySiswa.length,
        rataNilai: rata,
        diBawahKkm,
        tahfidzTotal,
        tahfidzLancar,
        skorKarakter: avgKarakter,
        skorDisiplin: avgDisiplin,
        skorKeaktifan: avgKeaktifan,
        skorKerjasama: avgKerjasama,
      });
      setSaranAI(fallbackText);
      toast.info("Menggunakan draf analisis standar karena AI tidak merespon.");
    } finally {
      setLoadingAI(false);
    }
  };

  if (session?.role === "ortu") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
          <TrendingUp className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold">Akses Ditolak</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Maaf, halaman Laporan & Rekomendasi Kelas hanya dapat diakses oleh Guru dan Admin Sekolah.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan Kelas" description="Ringkasan performa akademik siswa Anda." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Siswa aktif" value={mySiswa.length} icon={Users} />
        <StatCard label="Rata-rata kelas" value={rata} icon={Award} tone="success" />
        <StatCard
          label="Nilai terpublish"
          value={
            nilai.filter((n) => n.status === "published" && mySiswa.some((s) => s.id === n.siswaId))
              .length
          }
          icon={TrendingUp}
          tone="info"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft lg:col-span-2">
          <h3 className="mb-4 font-bold text-base">Rata-rata Nilai per Siswa</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="siswa" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                  }}
                />
                <Bar dataKey="Rata" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Rekomendasi & Analisis AI</h3>
              <Button
                size="sm"
                onClick={handleGenerateSaran}
                disabled={loadingAI}
                className="gap-1.5 rounded-full"
              >
                {loadingAI ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Analisis Kelas
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Analisis otomatis performa akademik, tahfidz, perilaku, dan emosi siswa untuk masukan
              guru.
            </p>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto max-h-[250px] border border-border/60 rounded-xl bg-surface-soft/10 p-3.5">
            {saranAI ? (
              <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none">
                {saranAI}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-6">
                <Sparkles className="h-7 w-7 text-primary/30 mb-2 animate-pulse" />
                <p className="text-[11px] leading-normal px-4">
                  Klik tombol di atas untuk menganalisis data kelas secara otomatis menggunakan
                  Gemini AI.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
