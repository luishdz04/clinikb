"use client";

import { MainLayout } from "@/components/layout";
import { HeroSection, ServicesSection, CTASection } from "@/components/home";

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <ServicesSection />
      <CTASection />
    </MainLayout>
  );
}
