import React from 'react';
import { Link } from 'react-router-dom';
import { Info, CheckCircle2 } from 'lucide-react';

interface RecordSectionProps {
  backtest: any;
}

export const RecordSection: React.FC<RecordSectionProps> = ({ backtest }) => {

  const headline = backtest?.headline || {
    decisions: 738,
    better_pct: 6.2,
    worse_pct: 3.9,
    waited_pct: 10.2,
    saving_pct: 0.55,
    saving_usd_150k: 10600,
  };

  const bookNowShare = (100 - headline.waited_pct).toFixed(1);

  const stats = [
    {
      label: 'Walk-Forward Decisions',
      value: headline.decisions,
      suffix: '',
      note: '2021–2026 strict zero-lookahead',
    },
    {
      label: 'Book-Now Share',
      value: bookNowShare,
      suffix: '%',
      note: 'Discipline against speculation',
    },
    {
      label: 'Wait-Decision Share',
      value: headline.waited_pct,
      suffix: '%',
      note: 'Selective high-conviction windows',
    },
    {
      label: 'Wins vs Losses',
      value: `${headline.better_pct}% / ${headline.worse_pct}%`,
      suffix: '',
      note: 'Transparent accounting of losses',
    },
  ];

  return (
    <section id="record" className="relative py-24 md:py-32 pointer-events-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 pointer-events-auto">
        <div className="landing-card p-8 md:p-14 bg-white/95 backdrop-blur-md border border-[#E6E2D9] shadow-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="landing-label text-[#1558C9] mb-3 block">04 · Empirical Evidence</span>
              <h2 className="landing-h2 text-[#0B0F1A] font-medium leading-[1.1] tracking-tight">
                The backtest record.
              </h2>
            </div>
            <Link to="/evidence" className="landing-link font-mono text-sm">
              <span>Inspect walk-forward audit logs</span>
              <span className="link-arrow">→</span>
            </Link>
          </div>

          {/* Count-Up Stat Tiles */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded bg-[#F3F1EC] border border-[#E6E2D9] transition-all hover:bg-white hover:border-[#1558C9] hover:shadow-xs"
              >
                <span className="landing-label text-[11px] text-[#555B6A] block mb-2">
                  {stat.label}
                </span>
                <div className="font-mono text-3xl md:text-4xl font-bold text-[#0B0F1A] tabular">
                  {stat.value}{stat.suffix}
                </div>
                <p className="mt-2 text-xs text-[#555B6A] leading-normal font-sans">
                  {stat.note}
                </p>
              </div>
            ))}
          </div>

          {/* The Honest Line: Most decisions were "book now" */}
          <div className="mt-8 p-5 rounded bg-[#EBF3FF] border border-[#BDD6FF] flex items-start gap-3.5 text-sm text-[#0B0F1A]">
            <CheckCircle2 className="w-5 h-5 text-[#1558C9] shrink-0 mt-0.5" />
            <div className="leading-relaxed font-sans">
              <strong>The honest reality of maritime freight:</strong> Most decisions ({bookNowShare}%) were “book now”. Freight markets exhibit steep tail risk; holding unhedged cargo invites demurrage and inventory degradation. FreightIQ only recommends waiting when forward drops exceed carrying costs and risk hurdle margin.
            </div>
          </div>

          {/* Synthetic Data Disclosure Line */}
          <div className="mt-6 pt-4 border-t border-[#E6E2D9] flex items-center gap-2 text-xs font-mono text-[#555B6A]">
            <Info className="w-3.5 h-3.5 text-[#555B6A] shrink-0" />
            <span>
              Synthetic data demo — backtest figures are protocol validation results from calibrated Baltic distributions, not guarantees of forward market performance.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
