import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/mock-auth";

const NAV = [
  { label: "Fitur Utama", href: "#fitur" },
  { label: "Solusi", href: "#solusi" },
  { label: "Mood Analytics", href: "#mood" },
  { label: "Keuangan", href: "#keuangan" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-background/70 backdrop-blur-xl backdrop-saturate-150"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-emerald shadow-glow-emerald">
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </span>
          <span className="truncate text-lg font-extrabold tracking-tight text-foreground">
            EduIslam<span className="text-primary"> Connect</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-surface-soft hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to={session ? "/app/dashboard" : "/app/login"}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-soft"
          >
            {session ? "Dashboard" : "Portal Masuk"}
          </Link>
          <a
            href="#cta"
            className="rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-glow-gold transition hover:scale-[1.02]"
          >
            Konsultasi Gratis
          </a>
        </div>

        <button
          aria-label="Buka menu"
          onClick={() => setOpen((o) => !o)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border bg-background/80 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-base font-medium text-foreground hover:bg-surface-soft"
              >
                {n.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              <Link
                to={session ? "/app/dashboard" : "/app/login"}
                className="flex-1 rounded-2xl border border-border px-4 py-3 text-center text-sm font-semibold"
              >
                {session ? "Dashboard" : "Portal Masuk"}
              </Link>
              <a
                href="#cta"
                className="flex-1 rounded-2xl bg-gradient-gold px-4 py-3 text-center text-sm font-semibold text-gold-foreground"
              >
                Konsultasi Gratis
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
