import React from "react";
import Logo from "@/components/Logo";
import { Reveal } from "@/components/Reveal";

const SOURCES = [
  { name: "Baltic Exchange", href: "https://www.balticexchange.com" },
  { name: "Ministry of Ports, Shipping & Waterways", href: "https://shipmin.gov.in" },
  { name: "Indian Ports Association", href: "https://ipa.nic.in" },
  { name: "Paradip Port Authority", href: "https://www.paradipport.gov.in" },
  { name: "Visakhapatnam Port", href: "https://www.vizagport.com" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-ink-950">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16">
        <div className="grid md:grid-cols-12 gap-10">
          <Reveal className="md:col-span-5">
            <Logo />
            <p className="mt-5 text-fog text-sm leading-relaxed max-w-sm">
              Forecast-driven chartering decisions for East Coast bulk imports. Forecast ranges per ship class, port feasibility screening, and a book-now vs wait verdict with worst-case cost.
            </p>
            <p className="mono-label mt-6 normal-case tracking-[0.06em]">
              Built by Team Code Hunters · NOVEX Hackathon 2026 · Final Round
            </p>
          </Reveal>

          <Reveal delay={0.08} className="md:col-span-4">
            <p className="mono-label text-radar mb-5">Planned data sources</p>
            <ul className="space-y-2.5">
              {SOURCES.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-fog hover:text-slate-100 transition-colors"
                  >
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.16} className="md:col-span-3">
            <p className="mono-label text-radar mb-5">Stack</p>
            <ul className="space-y-2.5 font-mono text-[12px] text-dim">
              <li>Python · pandas · NumPy</li>
              <li>Quantile gradient boosting + conformal calibration</li>
              <li>Rules + cost simulation engine</li>
              <li>Configurable port/route data layer</li>
              <li>React console + forecast bands</li>
            </ul>
          </Reveal>
        </div>

        <div className="mt-14 pt-6 border-t border-white/[0.05] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-dim">
            Synthetic demo data — backtest numbers are protocol results, not live advice
          </p>
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-dim">
            © 2026 FreightIQ
          </p>
        </div>
      </div>
    </footer>
  );
}
