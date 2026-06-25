import { Settings, Users, HeartHandshake, RefreshCw } from "lucide-react";

const STEPS = [
  { icon: Settings, title: "Admin mengelola data sekolah", desc: "Yayasan dan admin sekolah menyiapkan kelas, guru, siswa, dan struktur biaya hanya sekali." },
  { icon: Users, title: "Guru menginput tugas, hafalan, dan mood", desc: "Aktivitas harian, capaian Qur'an, dan kondisi emosional siswa tercatat di satu tempat." },
  { icon: HeartHandshake, title: "Orang tua mendampingi & memberi feedback", desc: "Notifikasi real-time membuat orang tua tidak tertinggal perkembangan anak setiap hari." },
  { icon: RefreshCw, title: "Semua data tersinkronisasi real-time", desc: "Dashboard yayasan, sekolah, dan keluarga selalu menampilkan data yang sama." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative bg-surface-soft py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-primary-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Cara Kerja
          </span>
          <h2 className="mt-5 text-[32px] font-extrabold tracking-tight text-foreground lg:text-[48px]">
            Bagaimana EduIslam Bekerja?
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Empat langkah sederhana yang menghubungkan admin, guru, dan orang tua dalam
            satu alur kerja yang mulus.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 hidden w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent lg:left-1/2 lg:-translate-x-1/2 lg:block" />

          <ol className="grid gap-6 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="relative rounded-[32px] border border-border/60 bg-background p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-elevation"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-emerald text-primary-foreground shadow-glow-emerald">
                    <s.icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <span className="text-5xl font-extrabold text-primary/10">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold leading-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-[1.7] text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
