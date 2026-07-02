import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/common/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/app/bantuan")({ component: BantuanPage });

const FAQ = [
  { q: "Bagaimana cara membayar SPP?", a: "Buka menu SPP & Tagihan, pilih tagihan aktif, lalu pilih metode pembayaran (VA, QRIS, e-wallet, atau kartu)." },
  { q: "Bagaimana melihat progres tahfidz anak?", a: "Menu Tahfidz menampilkan riwayat setoran dan progres terhadap target juz." },
  { q: "Apakah data mood anak saya aman?", a: "Ya, semua data terenkripsi dan hanya dapat diakses oleh Anda dan wali kelas terkait." },
  { q: "Bagaimana menghubungi wali kelas?", a: "Gunakan menu Catatan Guru untuk melihat pesan dari guru, atau hubungi sekolah lewat WhatsApp resmi." },
];

function BantuanPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Pusat Bantuan" description="Pertanyaan yang sering diajukan dan panduan cepat." />
      <div className="max-w-2xl rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
        <Accordion type="single" collapsible>
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`i-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
