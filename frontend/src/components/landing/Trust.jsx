import React, { useRef, useState, useEffect } from "react";
import { useInView, animate } from "framer-motion";
import { Reveal, SectionHead } from "@/components/Reveal";

const Counter = ({ to, decimals = 1, suffix = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const c = animate(0, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => c.stop();
  }, [inView, to]);

  return (
    <span ref={ref} className="tabular">
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const METRICS = [
  {
    to: 78.8,
    suffix: "%",
    label: "Calibrated range",
    sub: "the 80% forecast band is conformally calibrated — coverage is measured on the backtest, not assumed",
  },
  {
    to: 10.8,
    suffix: "%",
    label: "Beats a naive forecast",
    sub: "lower median error than a no-change forecast; any horizon that fails falls back to naive",
  },
  {
    to: 0,
    suffix: "",
    decimals: 0,
    label: "Look-ahead leaks",
    sub: "a unit test poisons future data and checks that earlier forecasts are identical",
  },
  {
    to: 0,
    suffix: "",
    decimals: 0,
    label: "Port-limit violations",
    sub: "port limits are transparent hard rules — dated, editable per port, with manual override",
  },
];

export default function Trust() {
  return (
    <section className="relative py-24 md:py-32 bg-ink-850/40 border-y border-white/[0.05] overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          index="04"
          eyebrow="Proof Protocol"
          title={<>Measured on the backtest, not asserted.</>}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" data-testid="trust-metrics-grid">
          {METRICS.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.08} className="h-full">
              <div className="hairline rounded-xl bg-ink-800/70 p-7 h-full relative overflow-hidden group hover:border-radar/35 transition-colors duration-300">
                <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-radar/[0.06] group-hover:bg-radar/[0.12] transition-colors duration-500" />
                <div className="font-mono text-4xl md:text-[2.75rem] font-bold text-slate-100">
                  <Counter to={m.to} suffix={m.suffix} decimals={m.decimals ?? 1} />
                </div>
                <div className="font-display text-base font-semibold text-slate-200 mt-4 mb-2">
                  {m.label}
                </div>
                <p className="text-dim text-[12px] leading-relaxed">{m.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
