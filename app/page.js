"use client";
import { LangProvider } from "@/lib/i18n";
import { Navbar, Hero, Pillars, Process, Funding, Team, Faq, Contact, Footer } from "@/components/Sections";

export default function Page() {
  return (
    <LangProvider>
      <Navbar />
      <main>
        <Hero />
        <Pillars />
        <Process />
        <Funding />
        <Team />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </LangProvider>
  );
}
