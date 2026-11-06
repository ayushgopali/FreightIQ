import React from "react";
import { Reveal, SectionHead } from "@/components/Reveal";

const DraftBars = () => (
  <div className="space-y-5 mt-6">
    {[
      { ship: "Capesize", need: "18.0 m", limit: "14.5 m", pct: 80.6, status: "part-loaded" },
      { ship: "Panamax", need: "12.8 m", limit: "14.5 m", pct: 100, status: "feasible" },
    ].map((b) => (
      <div key={b.ship}>
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-mono text-xs text-slate-200">{b.ship}</span>
          <span
            className={`font-mono text-[10px] tracking-[0.14em] uppercase ${
              b.status === "feasible" ? "text-mint" : "text-beacon"
            }`}
          >
            {b.status}
          </span>
        </div>
        <div className="relative h-2 rounded-full bg-ink-600 overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full ${
              b.status === "feasible" ? "bg-mint/80" : "bg-beacon/80"
            }`}
            style={{ width: `${b.pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 font-mono text-[10px] text-dim tabular">
          <span>needs {b.need}</span>
          <span>Paradip allows {b.limit}</span>
        </div>
      </div>
    ))}
  </div>
);

const Drivers = () => (
  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 mt-6">
    {[
      ["Rate trend", "4-week momentum, mean deviation", 78],
      ["Congestion", "port-wait index scales demurrage", 55],
      ["Seasonality", "annual cycle in the band", 40],
      ["Waiting cost", "$/t/week × weeks held", 64],
    ].map(([t, d, pct]) => (
      <div key={t}>
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-sm text-slate-200 font-medium">{t}</span>
          <span className="font-mono text-[10px] text-radar tabular">{pct}%</span>
        </div>
        <p className="text-[12px] text-dim mb-2">{d}</p>
        <div className="h-1 rounded-full bg-ink-600 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-radar/70 to-radar/30"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    ))}
  </div>
);

const Card = ({ className = "", children }) => (
  <div className={`hairline card-sheen rounded-2xl bg-ink-800/60 p-7 md:p-8 h-full ${className}`}>
    {children}
  </div>
);

export default function Bento() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          index="03"
          eyebrow="The Engine"
          title={<>Advice you can interrogate, not a black box.</>}
        />

        <div className="grid md:grid-cols-12 gap-5">
          <Reveal className="md:col-span-7">
            <Card>
              <p className="mono-label text-radar mb-4">Forecast</p>
              <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-3">
                Ranges, not a single number
              </h3>
              <p className="text-fog text-sm leading-relaxed max-w-lg">
                An 8-week outlook per origin and ship class, from the 10th to the 90th percentile — conformally calibrated so the band means what it says.
              </p>
              <svg viewBox="0 0 480 120" className="w-full h-auto mt-7">
                <path
                  d="M0,88 L60,80 L120,86 L180,64 L240,70 L300,52 L360,44 L420,38 L480,30"
                  fill="none"
                  stroke="#FFB800"
                  strokeWidth="2"
                />
                <path
                  d="M240,70 L300,40 L360,26 L420,18 L480,8 L480,62 L420,60 L360,64 L300,68 L240,74 Z"
                  fill="rgba(0,240,255,0.10)"
                />
                <path
                  d="M240,70 L300,40 L360,26 L420,18 L480,8"
                  fill="none"
                  stroke="rgba(0,240,255,0.5)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <path
                  d="M240,70 L300,68 L360,64 L420,60 L480,62"
                  fill="none"
                  stroke="rgba(0,240,255,0.5)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <line
                  x1="240"
                  y1="10"
                  x2="240"
                  y2="112"
                  stroke="rgba(241,245,249,0.2)"
                  strokeDasharray="2 4"
                />
                <text
                  x="246"
                  y="20"
                  fontSize="9"
                  fill="#64748B"
                  fontFamily="JetBrains Mono"
                  letterSpacing="2"
                >
                  P10–P90
                </text>
              </svg>
            </Card>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-5">
            <Card>
              <p className="mono-label text-radar mb-4">Port screen</p>
              <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-3">
                Feasible ships only
              </h3>
              <p className="text-fog text-sm leading-relaxed">
                Length, beam and draft are checked per port. Draft-limited ships are shown part-loaded, never assumed full.
              </p>
              <DraftBars />
            </Card>
          </Reveal>

          <Reveal delay={0.05} className="md:col-span-5">
            <Card>
              <p className="mono-label text-radar mb-4">Decision rule</p>
              <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-5">
                Book or wait
              </h3>
              <div className="rounded-lg bg-ink-900 border border-white/[0.07] p-4 font-mono text-[13px] leading-relaxed">
                <div className="text-dim"># risk-adjusted score</div>
                <div className="text-slate-100 mt-1">
                  score = mean + <span className="text-radar">0.3</span> · (P90 − mean)
                </div>
                <div className="text-dim mt-3"># wait only if it clears the bar</div>
                <div className="mt-1">
                  <span className="text-beacon">WAIT</span> only if saving &gt;{" "}
                  <span className="text-beacon">1%</span> vs best book-now
                </div>
              </div>
              <p className="text-fog text-sm leading-relaxed mt-5">
                Expected and worst-case cost of booking now versus waiting up to 8 weeks — with the drivers explained.
              </p>
            </Card>
          </Reveal>

          <Reveal delay={0.12} className="md:col-span-7">
            <Card>
              <p className="mono-label text-radar mb-4">Explanations</p>
              <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-3">
                Why you can trust the advice
              </h3>
              <p className="text-fog text-sm leading-relaxed">
                Every verdict ships with its drivers: rate trend, congestion, seasonality and the cost of waiting.
              </p>
              <Drivers />
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
