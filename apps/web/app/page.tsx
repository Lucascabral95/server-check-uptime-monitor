import { Navbar } from "@/presentation/components/Landing/NavbarSection";
import { LogosSection } from "@/presentation/components/Landing/LogosSection";
import { TestimonialsSection } from "@/presentation/components/Landing/TestimonialsSection";
import { Footer } from "@/presentation/components/Landing/FooterSection";
import { HeroSection } from "@/presentation/components/Landing/HeroSection";
import { FeaturesSection } from "@/presentation/components/Landing/FeaturesSection";
import { MetricsSection } from "@/presentation/components/Landing/MetricsSection";
import { CTASection } from "@/presentation/components/Landing/CTASection";

import "./App.scss";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />
      <HeroSection />
      <LogosSection />
      <FeaturesSection />
      <MetricsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
