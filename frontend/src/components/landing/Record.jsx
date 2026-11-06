import React from "react";
import { Reveal, SectionHead } from "@/components/Reveal";

const NUMBERS = [
  { v: "738", l: "walk-forward decisions · 2021–2026" },
  { v: "0.55%", l: "average saving vs book-now ≈ $10,600 per 150,000 t" },
  { v: "$12.77 → $12.70", l: "mean all-in cost per tonne, baseline vs FreightIQ" },
  { v: "10.2%", l: "of decisions chose to wait" },
];

export default function Record() {
  return (
    <section id="record" className="relative py-24 md:py-32 bg-ink-850/40 border-y border-white/[0.05] overflow-hidden noise">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          index="06"
          eyebrow="Backtest"
          title={<>Honest numbers, proven protocol.</>}
          sub="Replay past decision dates using only information available on each date. Compare with a spot-booking baseline under the same cargo, window and port limits."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12" data-testid="record-numbers">
          {NUMBERS.map((n, i) => (
            <Reveal key={n.v} delay={i * 0.08} className="h-full">
              <div className="hairline rounded-xl bg-ink-900/70 p-7 h-full">
                <div className="font-mono text-2xl md:text-[1.7rem] font-bold text-beacon tabular">
                  {n.v}
                </div>
                <div className="text-fog text-[13px] leading-relaxed mt-3">{n.l}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="hairline rounded-xl bg-ink-900/70 p-7 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
              <p className="font-display text-xl font-semibold tracking-tight">
                Wins vs losses, decision by decision
              </p>
              <p className="font-mono text-[11px] text-dim tracking-[0.14em] uppercase">
                wins outnumber losses ≈ 1.7 : 1 when waiting is cheap
              </p>
            </div>

            <div className="flex h-3 rounded-full overflow-hidden bg-ink-600">
              <div className="bg-mint/80" style={{ width: "6.2%" }} />
              <div className="bg-alert/70" style={{ width: "3.9%" }} />
              <div className="flex-1 bg-white/[0.06]" />
            </div>

            <div className="mt-3 flex flex-wrap gap-6 font-mono text-[11px] tracking-[0.1em] uppercase text-dim">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-mint" /> 6.2% better than baseline
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-alert" /> 3.9% worse — shown too, including losses
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-dim" /> rest: held course
              </span>
            </div>

            <p className="text-dim text-[12px] leading-relaxed mt-7 border-t border-white/[0.06] pt-5">
              Synthetic market data, 738 walk-forward decisions (2021 to 2026): proves the pipeline and protocol. Real-data results replace these before any claim.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
