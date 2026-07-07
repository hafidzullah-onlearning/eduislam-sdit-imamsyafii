import { MessageSquareWarning, HeartPulse, Wallet } from "lucide-react";

const PAIN = [
  {
    icon: MessageSquareWarning,
    title: "Guru kewalahan mengirim laporan satu per satu.",
    body: "Pesan WhatsApp tersebar, dokumen hilang di chat, dan laporan harian menyita waktu mengajar yang seharusnya untuk siswa.",
    tone: "from-rose-50 to-orange-50",
  },
  {
    icon: HeartPulse,
    title: "Kondisi psikologis siswa sulit dipantau.",
    body: "Tanpa data objektif, kejenuhan, stres, dan perubahan emosi anak baru terlihat ketika sudah memengaruhi nilai dan hafalan.",
    tone: "from-emerald-50 to-teal-50",
  },
  {
    icon: Wallet,
    title: "Pembayaran SPP & tunggakan sulit dipantau real-time.",
    body: "Pencatatan manual membuat laporan keuangan terlambat, tunggakan menumpuk, dan transparansi ke orang tua menjadi rendah.",
    tone: "from-amber-50 to-yellow-50",
  },
];

export function PainPoints() {
  return (
    <section id="solusi" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-surface-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Masalah Nyata
          </span>
          <h2 className="mt-5 text-[32px] font-extrabold tracking-tight text-foreground lg:text-[48px]">
            Mengapa Banyak Sekolah Islam Masih Terjebak Administrasi Manual?
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Beban kerja yang terus bertumbuh tanpa sistem yang menyatukan akademik, emosi anak, dan
            keuangan dalam satu tempat.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PAIN.map((p) => (
            <article
              key={p.title}
              className="group relative overflow-hidden rounded-[32px] border border-border/60 bg-background p-8 shadow-soft transition hover:-translate-y-1 hover:shadow-elevation"
            >
              <div
                className={`pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br ${p.tone} opacity-70 blur-2xl`}
              />
              <div className="relative">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <p.icon className="h-7 w-7" strokeWidth={1.8} />
                </div>
                <h3 className="mt-6 text-xl font-bold leading-tight text-foreground">{p.title}</h3>
                <p className="mt-3 text-base leading-[1.7] text-muted-foreground">{p.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
