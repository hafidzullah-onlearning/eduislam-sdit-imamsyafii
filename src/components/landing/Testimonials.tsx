import { Star } from "lucide-react";
import principal from "@/assets/testimonial-principal.jpg";
import teacher from "@/assets/testimonial-teacher.jpg";
import parent from "@/assets/testimonial-parent.jpg";

const ITEMS = [
  {
    img: principal,
    name: "Ust. Ahmad Fadli, M.Pd.",
    role: "Kepala Sekolah, SDIT Al-Hikmah",
    body: "Sejak menggunakan EduIslam, laporan keuangan yayasan jadi real-time dan komunikasi guru-orang tua lebih tertib. Kami bisa fokus pada tarbiyah, bukan administrasi.",
  },
  {
    img: teacher,
    name: "Ustadzah Nadia Rahmawati",
    role: "Guru Tahfidz Kelas 4",
    body: "Input hafalan dan mood siswa cukup beberapa ketukan. Saya bisa lihat pola siswa yang lelah dan mendiskusikannya dengan orang tua sebelum berdampak ke hafalan.",
  },
  {
    img: parent,
    name: "Bunda Diana Maharani",
    role: "Orang Tua Siswa Kelas 5",
    body: "Saya tahu perkembangan akademik, hafalan, dan kondisi emosi anak setiap hari. Bayar SPP juga tinggal scan VA — tidak perlu transfer manual lagi.",
  },
];

export function Testimonials() {
  return (
    <section className="relative bg-surface-soft py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-primary-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Suara Komunitas
          </span>
          <h2 className="mt-5 text-[32px] font-extrabold tracking-tight text-foreground lg:text-[48px]">
            Dipercaya oleh sekolah Islam yang ingin bertumbuh.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {ITEMS.map((t) => (
            <article
              key={t.name}
              className="flex flex-col rounded-[32px] border border-border/60 bg-background p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-elevation"
            >
              <div className="flex items-center gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-5 flex-1 text-base leading-[1.7] text-foreground">"{t.body}"</p>
              <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                <img
                  src={t.img}
                  alt={t.name}
                  width={56}
                  height={56}
                  loading="lazy"
                  className="h-14 w-14 rounded-2xl object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
