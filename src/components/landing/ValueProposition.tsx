import { BookMarked, BookOpenCheck, Brain, Wallet, ArrowUpRight, Check } from "lucide-react";

const FEATURES = [
  {
    icon: BookMarked,
    badge: "Akademik",
    title: "Akademik & Tugas",
    desc: "Tugas harian, materi PDF, link YouTube, dan rapor digital — semua mengalir dari kelas ke rumah secara real-time.",
    bullets: ["Tugas harian", "Materi PDF", "Link YouTube", "Download rapor"],
  },
  {
    icon: BookOpenCheck,
    badge: "Tahfidz",
    title: "Monitoring Hafalan Qur'an",
    desc: "Pantau target murojaah, progress per surah, dan status kelancaran setiap siswa dengan rekap mingguan.",
    bullets: ["Target murojaah", "Progress per surah", "Status kelancaran"],
  },
  {
    icon: Wallet,
    badge: "Keuangan",
    title: "Fintech & SPP",
    desc: "Virtual Account, e-wallet, dan pembayaran tunai dengan kuitansi otomatis serta rekap real-time untuk yayasan.",
    bullets: ["Virtual Account", "E-Wallet", "Pembayaran Tunai", "Kuitansi otomatis"],
  },
];

export function ValueProposition() {
  return (
    <section id="fitur" className="relative bg-surface-soft py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-primary-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Value Proposition
          </span>
          <h2 className="mt-5 text-[32px] font-extrabold tracking-tight text-foreground lg:text-[48px]">
            Satu Platform. Seluruh Operasional Sekolah Terintegrasi.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Dari ruang kelas hingga laporan keuangan yayasan — semua dalam satu
            dashboard yang ringan dan mudah digunakan.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          {/* Big feature: Mood Analytics highlight */}
          <article className="group relative overflow-hidden rounded-[32px] border border-primary/15 bg-gradient-emerald p-8 text-primary-foreground shadow-glow-emerald lg:col-span-7 lg:row-span-2 lg:p-10">
            <div className="pointer-events-none absolute -top-32 -right-20 h-72 w-72 rounded-full bg-mint/30 blur-3xl" />
            <div className="relative flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Brain className="h-3.5 w-3.5" />
                USP — Mood Analytics
              </div>
              <h3 className="mt-5 text-3xl font-extrabold leading-tight lg:text-4xl">
                Pahami emosi siswa, bukan hanya nilainya.
              </h3>
              <p className="mt-4 max-w-md text-base leading-[1.7] text-primary-foreground/80">
                Mood tracker berbasis emoji 3D untuk siswa, dipadu insight otomatis
                untuk guru dan orang tua. Deteksi dini kejenuhan sebelum berdampak ke
                akademik dan hafalan.
              </p>

              <div className="mt-8 grid flex-1 grid-cols-5 items-end gap-2 rounded-3xl bg-white/10 p-5 backdrop-blur">
                {[60, 78, 45, 88, 72].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-mint to-mint/40"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[10px] font-medium opacity-70">
                      {["Sen", "Sel", "Rab", "Kam", "Jum"][i]}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href="#mood"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
              >
                Lihat detail Mood Analytics
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </article>

          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="group relative flex flex-col rounded-[32px] border border-border/60 bg-background p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-elevation lg:col-span-5"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <f.icon className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <span className="rounded-full bg-surface-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {f.badge}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 text-base leading-[1.7] text-muted-foreground">
                {f.desc}
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-2">
                {f.bullets.map((b) => (
                  <li
                    key={b}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80"
                  >
                    <Check className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
