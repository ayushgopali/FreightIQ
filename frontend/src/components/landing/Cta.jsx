import React from "react";
import { Link } from "react-router-dom";
import { Reveal } from "@/components/Reveal";

const TERMINAL_LINES = [
  { p: "$", cmd: "freightiq decide --port paradip --origin south-africa --cargo 150000" },
  { p: ">", out: "forecast range   $15.90 – $19.40 /t   (P10–P90, 8-week horizon)" },
  { p: ">", out: "capesize @ paradip   PART-LOADED · ≈135,000 t usable" },
  { p: ">", out: "verdict   BOOK NOW — waiting does not clear the 1% bar" },
];

export default function Cta() {
  return (
    <section className="relative py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0 glow-rad" />
      <div className="relative mx-auto max-w-4xl px-5 md:px-8">
        <Reveal>
          <div className="hairline rounded-2xl bg-ink-800/80 backdrop-blur-md overflow-hidden shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.07] bg-ink-900/60">
              <span className="h-2.5 w-2.5 rounded-full bg-alert/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-beacon/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-mint/70" />
              <span className="ml-3 font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
                freightiq — console
              </span>
            </div>

            <div className="p-6 md:p-9 font-mono text-[13px] leading-loose">
              {TERMINAL_LINES.map((l, i) => (
                <div key={i} className="flex gap-3">
                  <span className={l.p === "$" ? "text-beacon" : "text-radar"}>{l.p}</span>
                  <span className={l.p === "$" ? "text-slate-100 break-all" : "text-fog"}>
                    {l.cmd || l.out}
                  </span>
                </div>
              ))}
              <div className="mt-2 flex gap-3">
                <span className="text-radar">$</span>
                <span className="inline-block h-4 w-2 bg-beacon animate-pulse" />
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/console"
              data-testid="cta-launch-console-button"
              className="inline-block rounded-full bg-beacon px-9 py-4 text-sm font-semibold text-ink-900 transition-transform hover:scale-[1.04] active:scale-95"
            >
              Open the Console — run a decision
            </Link>
            <p className="mono-label mt-5 normal-case tracking-[0.08em]">
              free during the pilot · forecast + port screen + verdict
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
