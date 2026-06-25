import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { PainPoints } from "@/components/landing/PainPoints";
import { ValueProposition } from "@/components/landing/ValueProposition";
import { MoodSplit } from "@/components/landing/MoodSplit";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { MoodAnalyticsUSP } from "@/components/landing/MoodAnalyticsUSP";
import { FinancialTransparency } from "@/components/landing/FinancialTransparency";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";

const TITLE = "EduIslam Connect — Platform Sekolah Islam Modern";
const DESC =
  "Satu platform untuk akademik, hafalan Qur'an, mood analytics, komunikasi orang tua, dan SPP digital. Dirancang khusus untuk sekolah Islam modern.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <Hero />
      <TrustBar />
      <PainPoints />
      <ValueProposition />
      <MoodSplit />
      <HowItWorks />
      <MoodAnalyticsUSP />
      <FinancialTransparency />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
      <StickyMobileCTA />
    </main>
  );
}
