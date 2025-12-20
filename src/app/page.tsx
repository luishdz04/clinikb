"use client";

import { MainLayout } from "@/components/layout";
import { HeroSection, AboutSection, ServicesSection, CTASection } from "@/components/home";

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <CTASection />
    </MainLayout>
  );
}
