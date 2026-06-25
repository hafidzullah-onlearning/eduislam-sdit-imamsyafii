import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const QA = [
  {
    q: "Apakah data siswa aman?",
    a: "Ya. Data tersimpan terenkripsi (in-transit & at-rest) dengan kontrol akses berbasis peran (admin, guru, orang tua). Server kami berada di data center bersertifikasi ISO 27001 dan tunduk pada regulasi pelindungan data pribadi.",
  },
  {
    q: "Bagaimana jika orang tua tidak memiliki m-banking?",
    a: "Pembayaran tetap dapat dilakukan secara tunai melalui sekolah, atau melalui mini-market dan agen e-wallet. Semua transaksi otomatis tercatat dan kuitansi digital langsung terkirim ke orang tua.",
  },
  {
    q: "Apakah bisa digunakan lebih dari satu kelas?",
    a: "Tentu. Sekolah dapat mengelola jumlah kelas tanpa batas — mulai dari satu kelas pelopor hingga seluruh jenjang. Tugas, hafalan, dan mood dipantau per kelas dengan rekap untuk wali kelas dan koordinator.",
  },
  {
    q: "Apakah bisa digunakan oleh yayasan dengan banyak sekolah?",
    a: "Ya. EduIslam mendukung struktur yayasan multi-sekolah dengan dashboard yayasan terpisah yang merangkum data akademik, mood, dan keuangan dari setiap unit pendidikan.",
  },
  {
    q: "Apakah tersedia pelatihan implementasi?",
    a: "Setiap sekolah mendapatkan onboarding terstruktur, pelatihan guru & admin, serta materi panduan untuk orang tua. Tim Customer Success kami mendampingi 90 hari pertama hingga adopsi stabil.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-primary-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            FAQ
          </span>
          <h2 className="mt-5 text-[32px] font-extrabold tracking-tight text-foreground lg:text-[48px]">
            Pertanyaan yang sering ditanyakan.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Tidak menemukan jawaban yang Anda cari? Tim kami siap membantu lewat
            konsultasi gratis.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12 space-y-3">
          {QA.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="overflow-hidden rounded-3xl border border-border/60 bg-background px-6 shadow-soft last:border-b"
            >
              <AccordionTrigger className="py-5 text-left text-base font-bold text-foreground hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base leading-[1.7] text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
