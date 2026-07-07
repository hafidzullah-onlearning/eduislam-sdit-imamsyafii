import { School, Home, ArrowLeftRight } from "lucide-react";
import { MoodChart } from "./visuals/MoodChart";

export function MoodSplit() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-primary-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Mood Sekolah vs Mood Rumah
          </span>
          <h2 className="mt-5 text-[32px] font-extrabold tracking-tight text-foreground lg:text-[48px]">
            Pahami Kondisi Anak Secara Lebih Utuh.
          </h2>
          <p className="mt-5 text-lg leading-[1.7] text-muted-foreground">
            Guru melihat anak di sekolah. Orang tua melihat anak di rumah.
            <br className="hidden sm:inline" />
            EduIslam menghubungkan keduanya.
          </p>
        </div>

        <div className="relative mt-14 grid items-center gap-5 lg:grid-cols-[1fr_auto_1fr]">
          <article className="rounded-[32px] border border-border/60 bg-background p-7 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <School className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Senin – Jumat
                  </p>
                  <h3 className="text-lg font-bold">Mood di Sekolah</h3>
                </div>
              </div>
              <span className="rounded-full bg-mint/20 px-3 py-1 text-xs font-semibold text-primary">
                +12% fokus
              </span>
            </div>
            <div className="mt-6">
              <MoodChart variant="school" />
            </div>
          </article>

          <div className="mx-auto hidden h-14 w-14 place-items-center rounded-full bg-gradient-gold text-gold-foreground shadow-glow-gold lg:grid">
            <ArrowLeftRight className="h-5 w-5" />
          </div>

          <article className="rounded-[32px] border border-border/60 bg-background p-7 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/10 text-secondary">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sore – Malam
                  </p>
                  <h3 className="text-lg font-bold">Mood di Rumah</h3>
                </div>
              </div>
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                Perlu perhatian
              </span>
            </div>
            <div className="mt-6">
              <MoodChart variant="home" />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
