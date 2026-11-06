import React from "react";
import { Reveal, SectionHead } from "@/components/Reveal";

const STEPS = [
  { n: "01", t: "Inputs", d: "Cargo, port, window", tag: "150,000 t · Paradip · 6 wk" },
  { n: "02", t: "Data", d: "Rates, congestion, ports", tag: "indices · coal · port JSON" },
  { n: "03", t: "Forecast", d: "Range per ship class", tag: "P10 → P90 · 8-week horizon" },
  { n: "04", t: "Port screen", d: "Feasible ships only", tag: "draft · LOA · beam checks" },
  { n: "05", t: "Decide", d: "Book or wait + risk", tag: "expected & worst-case cost" },
];

export default function Workflow() {
  return (
    <section id="engine" className="relative py-24 md:py-32 bg-ink-850/40 border-y border-white/[0.05]">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          index="02"
          eyebrow="The Pipeline"
          title={<>Forecast, screen, decide.</>}
          sub="Five steps from a cargo spec to a defensible verdict. Every layer is transparent — the advice comes with its drivers attached."
        />

        <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06}>
              <div className="group grid grid-cols-12 items-center gap-4 py-6 md:py-7 px-2 md:px-4 hover:bg-white/[0.02] transition-colors duration-300">
                <div className="col-span-2 md:col-span-1 font-mono text-sm text-radar tracking-[0.2em]">
                  {s.n}
                </div>
                <div className="col-span-10 md:col-span-4 font-display text-2xl md:text-3xl font-semibold tracking-tight transition-transform duration-300 group-hover:translate-x-2">
                  {s.t}
                </div>
                <div className="col-span-8 col-start-3 md:col-span-4 md:col-start-6 text-fog text-sm">
                  {s.d}
                </div>
                <div className="col-span-10 col-start-3 md:col-span-3 md:col-start-10 font-mono text-[11px] text-dim tracking-wide md:text-right">
                  {s.tag}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
