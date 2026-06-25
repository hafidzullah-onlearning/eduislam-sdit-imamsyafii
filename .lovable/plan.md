
# EduIslam Connect — Landing Page Plan

A single-page premium SaaS landing site in Bahasa Indonesia, styled like Stripe / Linear / Notion with modern Islamic branding. All 12 sections from the brief, fully responsive, mobile-first.

## Design System (src/styles.css)

Tokens (oklch equivalents of brief hexes):
- `--background` #FFFFFF, `--surface-soft` #F8FAFC, `--surface-muted` #F5F7FA
- `--primary` Deep Emerald #065F46, `--primary-foreground` white
- `--secondary` Islamic Navy #1E3A8A
- `--accent-gold` #D97706, `--accent-mint` #34D399
- `--foreground` slate-900, `--muted-foreground` slate-500
- Gradients: `--gradient-hero` (emerald → navy soft), `--gradient-gold` (gold → amber)
- Shadows: `--shadow-soft`, `--shadow-elevation`, `--shadow-glow-emerald`
- Radii: rounded-3xl / rounded-[32px] / rounded-[40px] across cards, CTAs, inputs

Typography: Plus Jakarta Sans (headings + body) loaded via `<link>` in `src/routes/__root.tsx`. Weights 400/500/600/700/800. Hero 72/42px, section 48/32px, body 18px @ 170% line-height.

## File Structure

```
src/routes/index.tsx              # Composes all sections, head() SEO
src/routes/__root.tsx             # Add font <link> tags
src/styles.css                    # Tokens + utility classes
src/components/landing/
  Navbar.tsx                      # Sticky w/ blur-on-scroll
  Hero.tsx                        # Headline + dual visual (dashboard + mobile)
  TrustBar.tsx
  PainPoints.tsx                  # 3 problem cards
  ValueProposition.tsx            # 4-feature grid
  MoodSplit.tsx                   # School-vs-Home mood comparison
  HowItWorks.tsx                  # 4-step timeline
  MoodAnalyticsUSP.tsx            # Premium dark section, 3D emoji, chart
  FinancialTransparency.tsx       # Dashboard mock + stats
  Testimonials.tsx                # 3 cards
  FAQ.tsx                         # Accordion (shadcn)
  FinalCTA.tsx                    # Emerald background
  Footer.tsx
  StickyMobileCTA.tsx
  visuals/
    DashboardMock.tsx             # SVG/HTML mock — stats, SPP, mood chart, hafalan
    MobileAppMock.tsx             # Phone frame w/ parent app
    MoodChart.tsx                 # Recharts line/area
    Mood3DEmoji.tsx               # Generated 3D emoji images
```

## Section Content (copy locked from brief)

1. **Navbar** — Logo, menu (Fitur, Solusi, Mood Analytics, Keuangan, FAQ), Portal Masuk (ghost), Konsultasi Gratis (gold CTA). Blur backdrop on scroll via IntersectionObserver / scroll listener.
2. **Hero** — Headline "Modernisasi Sekolah Islam Tanpa Kehilangan Sentuhan Tarbiyah." + subheadline, dual CTA, microcopy, social proof line, dashboard mock + floating phone mock with soft glow.
3. **Trust Bar** — Tagline + 5–6 placeholder institution logos (text badges in muted style).
4. **Pain Points** — 3 large rounded-[32px] cards with premium Lucide icons in emerald circles.
5. **Value Proposition** — 4-feature bento grid (Akademik, Hafalan Qur'an, Mood Analytics, Fintech SPP) — varying card sizes.
6. **Mood Split** — Side-by-side "Mood Sekolah" vs "Mood Rumah" charts with connecting motif.
7. **How It Works** — 4-step horizontal timeline with numbered nodes, flow: Admin → Guru → Orang Tua.
8. **Mood Analytics USP** — Dark emerald/navy gradient background, "Fitur Eksklusif EduIslam" gold badge, interactive-style chart, 3D emoji row (Happy/Sleepy/Bored/Sad/Angry), insight callout.
9. **Financial Transparency** — Payment dashboard mock + 3 metric tiles with animated counters.
10. **Testimonials** — 3 cards: Kepala Sekolah, Guru, Orang Tua. Generated portrait avatars.
11. **FAQ** — shadcn Accordion, 5 questions from brief.
12. **Final CTA** — Full-bleed emerald section with gold primary button + secondary outline.
13. **Footer** — Logo, nav, kontak (email/WhatsApp/alamat), social, copyright.
14. **Sticky Mobile CTA** — Appears after hero scroll on mobile only.

## Assets (imagegen, saved to src/assets/)

- `hero-dashboard.png` — Dashboard UI screenshot illustration (premium, emerald/white)
- `hero-mobile-app.png` — Parent mobile app mock (transparent)
- `emoji-happy.png`, `emoji-sleepy.png`, `emoji-bored.png`, `emoji-sad.png`, `emoji-angry.png` — 3D rendered, Apple-style, transparent backgrounds
- `testimonial-1/2/3.jpg` — Indonesian Muslim portraits (hijabi teacher, principal, parent)
- `logo-eduislam.svg` — Wordmark with subtle book/crescent mark (or text component)

## Technical Details

- TanStack Start: extend `src/routes/index.tsx` `head()` with full SEO (title <60ch, meta desc <160ch, OG, Twitter, JSON-LD Organization + SoftwareApplication).
- Charts: install `recharts` via `bun add recharts`.
- Animations: framer-motion (already common) — install if missing. Scroll-reveal via `whileInView`, animated counters with motion `useMotionValue` + `useTransform`.
- Accordion/FAQ uses existing shadcn `accordion.tsx`.
- All colors via tokens — no hardcoded hex in components.
- Lazy load below-fold images with `loading="lazy"`.
- Single H1 (hero), semantic `<section>` with aria-labels.
- Mobile-first responsive: grid → flex breakpoints at sm/md/lg, `min-w-0` + `shrink-0` for header rows.

## Out of Scope

- Backend / auth / Cloud — pure marketing page.
- Real login portal — "Portal Masuk" CTA links to `#` placeholder.
- Form submission — Konsultasi Gratis CTA scrolls to final CTA / opens mailto.

Approve and I'll build.
