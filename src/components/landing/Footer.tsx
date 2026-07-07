import { Sparkles, Mail, MessageCircle, MapPin, Instagram, Linkedin, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-soft">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-emerald shadow-glow-emerald">
                <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                EduIslam<span className="text-primary"> Connect</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-[1.7] text-muted-foreground">
              Platform digital yang menyatukan akademik, hafalan Qur'an, mood analytics, dan
              keuangan sekolah Islam dalam satu ekosistem.
            </p>
            <div className="mt-6 flex gap-2">
              {[Instagram, Linkedin, Youtube].map((I, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-background text-muted-foreground transition hover:border-primary/20 hover:text-primary"
                >
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Produk"
            links={["Fitur Utama", "Mood Analytics", "Keuangan & SPP", "Hafalan Qur'an"]}
          />
          <FooterCol title="Perusahaan" links={["Tentang Kami", "Karier", "Blog", "Kontak"]} />

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Hubungi Kami
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                halo@eduislam.id
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle className="mt-0.5 h-4 w-4 text-primary" />
                WhatsApp: +62 812-3000-4500
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                Jl. Pendidikan No. 17, Jakarta Selatan
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} EduIslam Connect. Hak Cipta Dilindungi.</p>
          <div className="flex shrink-0 gap-4">
            <a href="#" className="hover:text-foreground">
              Kebijakan Privasi
            </a>
            <a href="#" className="hover:text-foreground">
              Syarat & Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">{title}</h4>
      <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="transition hover:text-foreground">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
