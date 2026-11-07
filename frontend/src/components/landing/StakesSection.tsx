import React from 'react';
import { TrendingUp, Scale, DollarSign, Calendar } from 'lucide-react';
import { fmtUsd } from '@/lib/api';

interface StakesSectionProps {
  backtest: any;
}

export const StakesSection: React.FC<StakesSectionProps> = ({ backtest }) => {
  const avgSavingOnWaits = backtest?.headline?.saving_usd_150k
    ? fmtUsd(backtest.headline.saving_usd_150k)
    : '$10,600';

  const facts = [
    {
      icon: Scale,
      label: 'Standard Capesize Parcel',
      value: '170,000 tonnes',
      note: 'One standard voyage from Richards Bay or Newcastle',
    },
    {
      icon: TrendingUp,
      label: 'Typical Monthly Swing',
      value: '$2.00 / tonne',
      note: 'Historical 4-week spot volatility on Cape routes',
    },
    {
      icon: DollarSign,
      label: 'Inventory Carrying Cost',
      value: '$0.05 / t / week',
      note: 'Opportunity cost and stockpile demurrage buffer',
    },
    {
      icon: Calendar,
      label: 'Average Saving on Waits',
      value: `${avgSavingOnWaits} / cargo`,
      note: 'Derived from 738 zero-lookahead walk-forward decisions',
    },
  ];

  return (
    <section id="stakes" className="relative py-24 md:py-32 pointer-events-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 pointer-events-auto">
        <div className="landing-card p-8 md:p-16 bg-white/95 backdrop-blur-md border border-[#E6E2D9] shadow-lg">
          <div className="max-w-3xl">
            <span className="landing-label text-[#1558C9] mb-3 block">01 · Commercial Exposure</span>
            <h2 className="landing-h2 text-[#0B0F1A] font-medium leading-[1.1] tracking-tight">
              One fixture decision can swing EBITDA by hundreds of thousands.
            </h2>
          </div>

          {/* Giant Number & Explanation */}
          <div className="mt-12 pt-8 border-t border-[#E6E2D9] grid lg:grid-cols-12 gap-8 items-baseline">
            <div className="lg:col-span-6">
              <div className="font-heading text-6xl sm:text-7xl md:text-8xl font-medium tracking-tight text-[#0B0F1A]">
                $340,000
              </div>
              <p className="mt-3 text-base md:text-lg font-medium text-[#0F47A3]">
                The real financial impact of a $2.00/t freight swing on a 170,000-tonne Capesize coal voyage.
              </p>
            </div>

            <div className="lg:col-span-6 space-y-4 text-base text-[#555B6A] leading-relaxed">
              <p>
                In dry-bulk shipping, chartering teams routinely face an asymmetric dilemma: book spot immediately to lock in supply, or wait two to six weeks hoping rates soften.
              </p>
              <p>
                Without calibrated forward quantiles and physical port draft constraints, waiting often backfires due to stockpile holding charges ($0.05/t/week) or unforeseen port demurrage spikes. FreightIQ replaces intuition with audited probabilistic optimization.
              </p>
            </div>
          </div>

          {/* Facts Table from Real Data */}
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facts.map((fact) => {
              const Icon = fact.icon;
              return (
                <div
                  key={fact.label}
                  className="p-5 rounded bg-[#F3F1EC] border border-[#E6E2D9] transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-2 mb-3 text-[#1558C9]">
                    <Icon className="w-4 h-4" />
                    <span className="landing-label text-[11px] text-[#555B6A]">{fact.label}</span>
                  </div>
                  <div className="font-mono text-xl font-bold text-[#0B0F1A] tabular">
                    {fact.value}
                  </div>
                  <p className="mt-1.5 text-xs text-[#555B6A] leading-normal font-sans">
                    {fact.note}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

