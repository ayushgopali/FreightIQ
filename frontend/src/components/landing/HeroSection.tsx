import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { teamConfig, isPlaceholder } from '@/config/team';
import { fmtRate, fmtPct, fmtUsd } from '@/lib/api';

interface HeroSectionProps {
  decision: any;
  backtest: any;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ decision, backtest }) => {
  const [chartDrawn, setChartDrawn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChartDrawn(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Team eyebrow: hidden if team.ts has placeholders
  const showEyebrow = !isPlaceholder(teamConfig.teamName) && !isPlaceholder(teamConfig.college);

  // Decision figures from real backend output
  const isWait = decision?.recommendation === 'WAIT';
  const verdict = isWait ? 'WAIT' : 'BOOK NOW';
  const expectedCost = decision?.expected_cost_t || 13.45;
  const worstCost = decision?.worst_cost_t || 14.80;
  const savingPct = decision?.saving_pct ?? -2.63;
  const savingUsd = decision?.saving_usd ?? 0;
  const vesselText = decision?.feasibility?.ship_class
    ? `${decision.feasibility.ship_class} · 168,000 t usable`
    : 'Capesize · 168,000 t usable';

  // Total decisions from real backtest data
  const totalDecisions = backtest?.headline?.decisions || 738;

  return (
    <section className="relative min-h-screen pt-28 pb-20 flex items-center justify-center pointer-events-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 grid lg:grid-cols-12 gap-8 items-center pointer-events-auto">
        {/* Left Column: Glass Editorial Panel */}
        <div className="lg:col-span-7 landing-glass p-8 md:p-12 shadow-xl border border-[#E6E2D9]">
          {/* Eyebrow - Hidden if placeholders in team.ts */}
          {showEyebrow && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1558C9]/10 text-[#0F47A3] font-mono text-xs font-semibold">
              <span>{teamConfig.teamName}</span>
              <span>·</span>
              <span>{teamConfig.college}</span>
            </div>
          )}

          {/* Large Editorial Headline */}
          <h1 className="landing-h1 text-[#0B0F1A] font-medium leading-[1.08] tracking-tight">
            Book the ship now, or wait?
          </h1>

          {/* Precision Paragraph for East Coast Indian Coal Importers */}
          <p className="mt-6 text-lg md:text-xl text-[#555B6A] leading-relaxed max-w-2xl font-normal">
            For power producers and steel mills importing dry-bulk thermal coal across Paradip, Visakhapatnam, and Dhamra.
            Replace rule-of-thumb chartering with multi-horizon quantile forecasting, draft feasibility screening, and asymmetric downside simulation.
          </p>

          {/* Action Buttons: The ONE Lime Button + Secondary */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/console"
              className="landing-btn-lime"
              data-testid="hero-launch-console"
            >
              <span>Launch the Console</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <a
              href="#record"
              className="landing-btn-secondary"
              data-testid="hero-see-backtest"
            >
              <span>See the backtest record</span>
            </a>
          </div>

          {/* Trust Line from Real Backtest Data */}
          <div className="mt-8 pt-6 border-t border-[#E6E2D9] flex items-center gap-2 text-xs font-mono text-[#555B6A]">
            <ShieldCheck className="w-4 h-4 text-[#087A5B]" />
            <span>
              Synthetic data demo · <strong className="text-[#0B0F1A] font-bold">{totalDecisions} walk-forward decisions</strong> (2021–2026)
            </span>
          </div>
        </div>

        {/* Right Column: Live FreightIQ Decision Glass Card */}
        <div className="lg:col-span-5">
          <div className="landing-glass p-6 md:p-8 shadow-xl border border-[#E6E2D9] relative overflow-hidden">
            {/* Top Tag & Corridor */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E6E2D9]">
              <div>
                <span className="landing-label text-[#0F47A3] block">Live Commercial Verdict</span>
                <span className="font-mono text-xs text-[#0B0F1A] font-semibold">
                  Richards Bay → Paradip · 150,000 t
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-[#F3F1EC] text-[#555B6A] border border-[#E6E2D9]">
                P90 Monte Carlo
              </span>
            </div>

            {/* Giant Verdict Display */}
            <div className="py-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="landing-label text-[#555B6A] block">Recommendation</span>
                  <div
                    className={`font-heading text-3xl md:text-4xl font-bold tracking-tight ${
                      isWait ? 'text-[#087A5B]' : 'text-[#0B0F1A]'
                    }`}
                  >
                    {verdict}
                    {isWait && decision?.wait_weeks ? ` · ${decision.wait_weeks} WEEKS` : ''}
                  </div>
                </div>

                {/* Expected saving with sign and word: e.g. "better" / "worse" */}
                <div className="text-right">
                  <span className="landing-label text-[#555B6A] block">Net Saving vs Spot</span>
                  <div
                    className={`font-mono text-sm md:text-base font-bold tabular ${
                      savingPct >= 0 ? 'text-[#087A5B]' : 'text-[#B42318]'
                    }`}
                  >
                    {savingPct >= 0 ? `+${fmtUsd(savingUsd)} better` : `${fmtPct(savingPct)} worse`}
                  </div>
                </div>
              </div>

              {/* Strict Note Alignment: if saving does not clear margin, verdict is Book now */}
              <p className="mt-3 text-xs font-mono text-[#555B6A] leading-relaxed bg-[#F3F1EC] p-2.5 rounded border border-[#E6E2D9]">
                {isWait
                  ? `Expected drop of ${fmtPct(savingPct)} clears the $0.05/t/week wait cost and risk hurdle.`
                  : `Waiting yields ${fmtPct(savingPct)} worse expected outcome once $0.05/t/wk carrying costs are included. Prompt fixture recommended.`}
              </p>
            </div>

            {/* Figures Grid: Expected Cost, Worst Case P90, Recommended Vessel */}
            <div className="grid grid-cols-2 gap-3 py-4 border-t border-b border-[#E6E2D9] font-mono text-xs">
              <div>
                <span className="text-[#555B6A] text-[11px] block">Expected Cost</span>
                <span className="text-base font-bold text-[#0B0F1A]">{fmtRate(expectedCost)}/t</span>
              </div>
              <div>
                <span className="text-[#555B6A] text-[11px] block">Worst Case (P90)</span>
                <span className="text-base font-bold text-[#B42318]">{fmtRate(worstCost)}/t</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-[#E6E2D9]/60 flex items-center justify-between">
                <span className="text-[#555B6A]">Recommended Vessel</span>
                <span className="text-[#0B0F1A] font-semibold">{vesselText}</span>
              </div>
            </div>

            {/* Mini Forecast Chart Drawing In */}
            <div className="mt-4 pt-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#555B6A] mb-1.5">
                <span>Forward Trajectory</span>
                <span className="text-[#0F47A3] font-medium">8-Week Conformal Cone</span>
              </div>
              <div className="h-16 w-full relative">
                <svg
                  viewBox="0 0 280 60"
                  className="w-full h-full overflow-visible"
                  aria-label="Forward Freight Trajectory Mini Chart"
                >
                  {/* Confidence Interval Cone (P10 to P90) */}
                  <path
                    d="M 10,32 L 80,30 L 140,28 L 200,22 L 270,16 L 270,48 L 200,42 L 140,38 L 80,34 Z"
                    fill="rgba(21, 88, 201, 0.12)"
                    stroke="rgba(21, 88, 201, 0.35)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    className={`transition-opacity duration-1000 ${chartDrawn ? 'opacity-100' : 'opacity-0'}`}
                  />
                  {/* Median Line (P50) */}
                  <path
                    d="M 10,32 L 80,31 L 140,30 L 200,28 L 270,25"
                    fill="none"
                    stroke="#1558C9"
                    strokeWidth="2.2"
                    strokeDasharray="300"
                    strokeDashoffset={chartDrawn ? 0 : 300}
                    style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
                  />
                  {/* Origin Spot Point */}
                  <circle cx="10" cy="32" r="3.5" fill="#1558C9" />
                  {/* As-of Marker */}
                  <line x1="80" y1="6" x2="80" y2="54" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="82" y="14" fontSize="8" fill="#555B6A" fontFamily="JetBrains Mono">
                    As-of
                  </text>
                  <text x="268" y="14" fontSize="8" fill="#555B6A" fontFamily="JetBrains Mono" textAnchor="end">
                    +8 wk
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
