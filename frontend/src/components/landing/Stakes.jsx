import React from "react";
import { Reveal, SectionHead } from "@/components/Reveal";

const PROBLEMS = [
  {
    n: "01",
    t: "Volatile spot rates",
    d: "The same cargo costs very different amounts depending on the booking date.",
  },
  {
    n: "02",
    t: "Ports decide which ships can load",
    d: "Draft, length and beam limits cap ship size, so the cheapest class per tonne may not be usable.",
  },
  {
    n: "03",
    t: "No decision tool",
    d: "Market tools show rates and tracking. Importers still decide by phone calls and spreadsheets.",
  },
];

export default function Stakes() {
  return (
    <section id="stakes" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          index="01"
          eyebrow="The Stakes"
          title={<>Spot chartering is a high-stakes guess.</>}
        />
        <div className="grid lg:grid-cols-12 gap-10 items-end mb-16">
          <Reveal className="lg:col-span-7">
            <div className="font-display font-black tracking-tight leading-none text-[17vw] sm:text-8xl lg:text-[7.5rem]">
              <span className="text-beacon">$340,000</span>
            </div>
          </Reveal>
          <Reveal delay={0.12} className="lg:col-span-5">
            <p className="text-fog text-base md:text-lg leading-relaxed">
              moves on one 170,000 t Capesize voyage for every{" "}
              <span className="text-slate-100 font-medium">$2/tonne</span> of freight.
              Book a week too early or a week too late — the market rarely tells you which until it is over.
            </p>
          </Reveal>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.1} className="h-full">
              <div className="hairline card-sheen rounded-xl bg-ink-800/60 p-7 h-full hover:border-radar/30 transition-colors duration-300 group">
                <div className="font-mono text-xs text-radar tracking-[0.2em] mb-8">{p.n}</div>
                <h3 className="font-display text-xl font-semibold mb-3 leading-snug group-hover:text-white transition-colors">{p.t}</h3>
                <p className="text-fog text-sm leading-relaxed">{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
