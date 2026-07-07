import { ArrowRight, PhoneCall } from "lucide-react";

export function FinalCTA() {
  return (
    <section id="cta" className="relative px-5 py-20 lg:px-8 lg:py-28">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-gradient-premium p-8 text-primary-foreground shadow-glow-emerald lg:p-20">
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-mint/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-gradient-gold px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-foreground shadow-glow-gold">
            Mulai Sekarang
          </span>
          <h2 className="mt-6 text-[32px] font-extrabold leading-[1.1] tracking-tight lg:text-[56px]">
            Siap Membawa Sekolah Islam Anda
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-mint to-gold bg-clip-text text-transparent">
              ke Level Berikutnya?
            </span>
          </h2>
          <p className="mt-6 text-lg leading-[1.7] text-primary-foreground/80">
            Jadwalkan demo bersama tim EduIslam dan lihat bagaimana teknologi dapat memperkuat
            kolaborasi antara sekolah dan orang tua.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-7 py-4 text-base font-semibold text-gold-foreground shadow-glow-gold transition hover:scale-[1.03]"
            >
              Jadwalkan Demo Gratis
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-4 text-base font-semibold backdrop-blur transition hover:bg-white/10"
            >
              <PhoneCall className="h-4 w-4" />
              Hubungi Konsultan
            </a>
          </div>

          <p className="mt-5 text-sm text-primary-foreground/60">
            Tanpa biaya komitmen awal • Onboarding 90 hari • Garansi adopsi
          </p>
        </div>
      </div>
    </section>
  );
}
