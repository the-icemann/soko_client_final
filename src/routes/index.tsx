import { createFileRoute, redirect } from "@tanstack/react-router";

import { CTABanner, Footer } from "@/components/landing-page/cta-and-footer";
import { FeaturesSection } from "@/components/landing-page/FeaturesSection";
import HeroSection from "@/components/landing-page/Hero-section";
import HowItWorksSection from "@/components/landing-page/how-it-works-section";
import NavBar from "@/components/landing-page/nav-bar";
import { StatsSection } from "@/components/landing-page/stats-section";
import { TestimonialsSection } from "@/components/landing-page/TestimonialsSection";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated()) throw redirect({ to: "/home" });
  },
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTABanner />
      <Footer />
      <NavBar />
    </div>
  );
}
