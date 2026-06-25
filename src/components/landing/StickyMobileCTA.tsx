import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div
      className={`fixed inset-x-0 bottom-3 z-40 px-3 transition-all duration-300 lg:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <a
        href="#cta"
        className="flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-6 py-3.5 text-sm font-semibold text-gold-foreground shadow-glow-gold"
      >
        Jadwalkan Demo Gratis
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}
