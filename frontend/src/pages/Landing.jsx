import React from "react";
import Nav from "@/components/Nav";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/Marquee";
import Stakes from "@/components/landing/Stakes";
import Workflow from "@/components/landing/Workflow";
import Bento from "@/components/landing/Bento";
import Trust from "@/components/landing/Trust";
import PortMatrix from "@/components/landing/PortMatrix";
import Record from "@/components/landing/Record";
import Cta from "@/components/landing/Cta";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="bg-ink-900 min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Stakes />
        <Workflow />
        <Bento />
        <Trust />
        <PortMatrix />
        <Record />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
