import { ArrowRight, Play, ShieldCheck, Sparkles } from "lucide-react";
import { DashboardMock } from "./visuals/DashboardMock";
import { MobileAppMock } from "./visuals/MobileAppMock";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-32">
      {/* Background blooms */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -top-20 right-0 h-[420px] w-[420px] rounded-full bg-gold/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          {/* Copy */}
          <div className="animate-reveal">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-soft/70 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Platform Manajemen Sekolah Islam Modern
            </div>

            <h1 className="mt-6 text-[42px] font-extrabold leading-[1.05] tracking-tight text-foreground lg:text-[72px]">
              Modernisasi Sekolah Islam{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                Tanpa Kehilangan
              </span>{" "}
              Sentuhan Tarbiyah.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-[1.7] text-muted-foreground">
              Satu platform terintegrasi untuk mengelola akademik, hafalan Qur'an, analisis mood
              siswa, komunikasi orang tua, dan pembayaran SPP dalam satu ekosistem digital yang
              aman.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#cta"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-7 py-4 text-base font-semibold text-gold-foreground shadow-glow-gold transition hover:scale-[1.02]"
              >
                Jadwalkan Demo Gratis
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </a>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background/80 px-7 py-4 text-base font-semibold text-foreground backdrop-blur transition hover:border-primary/30 hover:bg-surface-soft"
              >
                <Play className="h-4 w-4 text-primary" />
                Lihat Cara Kerja
              </a>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Tanpa biaya komitmen awal
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
              <span>Dipercaya sekolah Islam modern yang ingin bertumbuh lebih cepat.</span>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-[48px] bg-gradient-emerald opacity-10 blur-3xl" />
            <div className="relative">
              <DashboardMock />
              <div className="absolute -bottom-10 -right-2 w-[44%] animate-float md:-right-6 lg:-bottom-14 lg:-right-10">
                <MobileAppMock />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
