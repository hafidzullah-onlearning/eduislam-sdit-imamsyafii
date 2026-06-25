import { useEffect, useRef, useState } from "react";
import { CreditCard, FileCheck2, Wallet, ArrowUpRight, Check } from "lucide-react";

function useCount(target: number, start: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return value;
}

const RECENT = [
  { name: "Aisyah Kamilah", grade: "Kelas 4A", amount: "Rp 850.000", status: "Lunas" },
  { name: "Muhammad Hafiz", grade: "Kelas 6B", amount: "Rp 850.000", status: "Lunas" },
  { name: "Khadijah Putri", grade: "Kelas 3C", amount: "Rp 425.000", status: "Cicilan" },
  { name: "Ibrahim Yusuf", grade: "Kelas 5A", amount: "Rp 850.000", status: "Lunas" },
];

export function FinancialTransparency() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const collected = useCount(94, visible);
  const onTime = useCount(87, visible);
  const families = useCount(1240, visible);

  return (
    <section id="keuangan" ref={ref} className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <span className="inline-flex rounded-full bg-primary-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Fintech & SPP
            </span>
            <h2 className="mt-5 text-[32px] font-extrabold tracking-tight text-foreground lg:text-[48px]">
              Keuangan Sekolah Lebih Transparan dan Terkontrol.
            </h2>
            <p className="mt-5 text-lg leading-[1.7] text-muted-foreground">
              Pantau penerimaan SPP, kirim invoice otomatis, dan terima pembayaran
              dari berbagai channel — semua dengan bukti digital yang rapi untuk
              audit yayasan.
            </p>

            <ul className="mt-8 grid gap-3">
              {[
                { icon: CreditCard, t: "Virtual Account & E-Wallet otomatis terverifikasi" },
                { icon: FileCheck2, t: "Invoice & kuitansi terbit otomatis untuk orang tua" },
                { icon: Wallet, t: "Pembayaran tunai tetap terlacak dengan bukti digital" },
              ].map((it) => (
                <li key={it.t} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background p-4 shadow-soft">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <it.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium leading-[1.6] text-foreground">{it.t}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <Stat value={`${collected}%`} label="SPP tertagih" />
              <Stat value={`${onTime}%`} label="Tepat waktu" />
              <Stat value={`${families.toLocaleString("id-ID")}+`} label="Keluarga aktif" />
            </div>
          </div>

          {/* Dashboard mock */}
          <div className="rounded-[32px] border border-border/60 bg-gradient-to-b from-surface-soft to-background p-5 shadow-elevation lg:p-7">
            <div className="rounded-3xl border border-border/60 bg-background p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Penerimaan SPP</p>
                  <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    Rp 1.052.300.000
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-mint/15 px-3 py-1.5 text-xs font-semibold text-primary">
                  +18% MoM
                </span>
              </div>

              {/* Mini bar chart */}
              <div className="mt-6 grid grid-cols-12 items-end gap-1.5">
                {[42, 55, 48, 63, 58, 72, 68, 80, 76, 88, 84, 95].map((h, i) => (
                  <div
                    key={i}
                    className="rounded-t-md bg-gradient-to-t from-primary to-primary/40"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <span>Jan</span><span>Mar</span><span>Mei</span><span>Jul</span><span>Sep</span><span>Des</span>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-border/60 bg-background p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Pembayaran Terbaru</p>
                <a href="#" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Lihat semua <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
              <ul className="mt-3 divide-y divide-border">
                {RECENT.map((r) => (
                  <li key={r.name} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.grade}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold tabular-nums">{r.amount}</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          r.status === "Lunas"
                            ? "bg-mint/15 text-primary"
                            : "bg-gold/15 text-gold"
                        }`}
                      >
                        {r.status === "Lunas" && <Check className="h-3 w-3" strokeWidth={3} />}
                        {r.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background p-4 text-center shadow-soft">
      <p className="text-2xl font-extrabold tracking-tight text-primary tabular-nums">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
