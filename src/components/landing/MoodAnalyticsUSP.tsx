import { Sparkles, TrendingDown, Lightbulb } from "lucide-react";
import { MoodChart } from "./visuals/MoodChart";
import happy from "@/assets/emoji-happy.png";
import sleepy from "@/assets/emoji-sleepy.png";
import bored from "@/assets/emoji-bored.png";
import sad from "@/assets/emoji-sad.png";
import angry from "@/assets/emoji-angry.png";

const EMOJIS = [
  { src: happy, label: "Bahagia", value: 42 },
  { src: sleepy, label: "Lelah", value: 18 },
  { src: bored, label: "Bosan", value: 22 },
  { src: sad, label: "Sedih", value: 12 },
  { src: angry, label: "Marah", value: 6 },
];

export function MoodAnalyticsUSP() {
  return (
    <section id="mood" className="relative overflow-hidden bg-gradient-premium py-24 text-primary-foreground lg:py-32">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-mint/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }} />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-foreground shadow-glow-gold">
            <Sparkles className="h-3.5 w-3.5" />
            Fitur Eksklusif EduIslam
          </span>
          <h2 className="mt-6 text-[32px] font-extrabold tracking-tight lg:text-[52px]">
            Bukan Sekadar Nilai Akademik.
            <br />
            <span className="bg-gradient-to-r from-mint to-gold bg-clip-text text-transparent">
              Pahami Kondisi Emosi Anak.
            </span>
          </h2>
          <p className="mt-6 text-lg leading-[1.7] text-primary-foreground/80">
            Deteksi kejenuhan belajar lebih awal sebelum memengaruhi performa
            akademik dan hafalan Qur'an. Data emosi dikumpulkan setiap hari oleh
            siswa, dianalisis, dan diterjemahkan menjadi insight yang dapat
            ditindaklanjuti.
          </p>
        </div>

        {/* Emoji row */}
        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-5 gap-3 sm:gap-5">
          {EMOJIS.map((e) => (
            <div
              key={e.label}
              className="glass-dark group relative flex flex-col items-center gap-2 rounded-[28px] p-4 transition hover:-translate-y-2 sm:p-6"
            >
              <img
                src={e.src}
                alt={e.label}
                width={512}
                height={512}
                loading="lazy"
                className="h-14 w-14 drop-shadow-2xl transition group-hover:scale-110 sm:h-20 sm:w-20"
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70 sm:text-xs">
                {e.label}
              </span>
              <span className="text-base font-extrabold sm:text-lg">{e.value}%</span>
            </div>
          ))}
        </div>

        {/* Insight panels */}
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="glass-dark rounded-[32px] p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
                  Tren Mood 14 hari terakhir
                </p>
                <h3 className="mt-1 text-xl font-bold">Kelas 5B — Tahfidz Junior</h3>
              </div>
              <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-gold">
                Live
              </span>
            </div>
            <div className="mt-6">
              <MoodChart variant="dark" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-dark rounded-[28px] p-6">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gold/20 text-gold">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Insight Otomatis</p>
                  <p className="mt-1 text-sm leading-[1.7] text-primary-foreground/80">
                    Mood "Bosan" naik 14% setiap Kamis sore — pertimbangkan jeda
                    aktivitas atau variasi metode pada jadwal tersebut.
                  </p>
                </div>
              </div>
            </div>
            <div className="glass-dark rounded-[28px] p-6">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-mint/20 text-mint">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Deteksi Dini</p>
                  <p className="mt-1 text-sm leading-[1.7] text-primary-foreground/80">
                    3 siswa menunjukkan pola kelelahan beruntun. Sistem mengusulkan
                    sesi konseling singkat dengan wali kelas minggu ini.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
