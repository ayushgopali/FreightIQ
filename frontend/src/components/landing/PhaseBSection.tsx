import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ShieldCheck, Database } from 'lucide-react';
import { EvidenceSection } from './EvidenceSection';
import { FaqSection } from './FaqSection';
import { LandingFooter } from './LandingFooter';
import { fmtRate, fmtPct } from '@/lib/api';

interface PhaseBSectionProps {
  meta: any;
  backtest: any;
  onEnterSite: () => void;
  onReplayStory?: () => void;
  isIntroSeen?: boolean;
}

export const PhaseBSection: React.FC<PhaseBSectionProps> = ({
  meta,
  backtest,
  onEnterSite,
  onReplayStory,
  isIntroSeen = false,
}) => {
  // Extract real backend figures from backtest headline
  const hl = backtest?.headline || backtest;
  const totalDecisions = hl?.decisions ?? 738;
  const bookNowPct = hl?.waited_pct != null ? (100 - hl.waited_pct) : 89.8;
  const waitWinRate = hl?.better_pct != null && hl?.waited_pct ? ((hl.better_pct / hl.waited_pct) * 100) : 60.8;
  const avgSavingOnWaits = hl?.saving_usd_150k && hl?.waited_pct ? (hl.saving_usd_150k / (150000 * (hl.waited_pct / 100))) : 0.69;

  return (
    <div id="full-page" className="relative z-20 bg-[#030407] text-[#F4F7FB]" style={{ contentVisibility: 'auto', containIntrinsicSize: '1000px 3000px' }}>
      {/* Optional Replay Banner when returning to "/" */}
      {isIntroSeen && onReplayStory && (
        <div className="w-full bg-[#0B0F1A]/95 border-b border-white/10 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-[#A3ADBF]">
            FreightIQ Maritime Terminal · Full landing view
          </span>
          <button
            onClick={onReplayStory}
            className="text-[#D4FF24] hover:underline flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4FF24] px-2.5 py-1 rounded bg-[#D4FF24]/10 border border-[#D4FF24]/20 transition-all hover:bg-[#D4FF24]/20"
          >
            <span>▶ Replay Drone Story</span>
          </button>
        </div>
      )}

      {/* 1. SHORT HERO RECAP */}
      <section className="relative py-24 md:py-32 border-t border-white/10 overflow-hidden">
        {/* Dim port-night background crop */}
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: 'url(/media/port-night-960.webp)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030407] via-transparent to-[#030407] pointer-events-none" />

        <div className="relative w-full max-w-[1400px] mx-auto px-6 text-center">
          <span className="text-xs font-mono text-[#D4FF24] uppercase tracking-widest px-3 py-1 rounded border border-[#D4FF24]/30 bg-[#D4FF24]/10 inline-block mb-4">
            Commercial Maritime Intelligence
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F4F7FB] max-w-3xl mx-auto leading-tight mb-6">
            Your cargo. Your timing. Your call.
          </h2>
          <p className="text-base sm:text-lg text-[#A3ADBF] max-w-2xl mx-auto leading-relaxed mb-8">
            FreightIQ couples quantitative voyage freight forecasting with terminal physical feasibility screening for bulk coal charterers across all major East Coast Indian ports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterSite}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded bg-[#D4FF24] hover:bg-[#C5F213] text-[#0B0F1A] font-semibold text-sm transition-all hover:scale-[1.02] shadow-xl shadow-[#D4FF24]/20"
            >
              <span>Enter FreightIQ Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded border border-white/15 hover:border-white/30 bg-[#0B0F1A] text-[#F4F7FB] font-medium text-sm transition-colors"
            >
              <span>Explore Time Machine</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. PORTS BAND: ALL 7 EAST COAST PORTS */}
      <section className="relative py-16 bg-[#0B0F1A] border-y border-white/10 overflow-hidden">
        {/* Dim port-night background crop */}
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: 'url(/media/port-night-960.webp)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F1A] via-transparent to-[#0B0F1A] pointer-events-none" />

        <div className="relative w-full max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono text-[#8DB4F5] uppercase tracking-wider block">
                Port Screening Matrix
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F4F7FB] mt-1">
                7 Monitored East Coast Terminals
              </h3>
            </div>
            <Link
              to="/ports"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#D4FF24] hover:underline"
            >
              <span>Inspect full draft envelopes</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {(meta?.ports || [
              { name: 'Paradip', draft_m: 16.5, state: 'Odisha' },
              { name: 'Visakhapatnam', draft_m: 15.5, state: 'Andhra Pradesh' },
              { name: 'Gangavaram', draft_m: 18.0, state: 'Andhra Pradesh' },
              { name: 'Gopalpur', draft_m: 12.0, state: 'Odisha' },
              { name: 'Dhamra', draft_m: 17.5, state: 'Odisha' },
              { name: 'Sagar Sandheads', draft_m: 13.0, state: 'West Bengal' },
              { name: 'Haldia', draft_m: 9.0, state: 'West Bengal' },
            ]).map((port: any) => (
              <div
                key={port.name}
                className="bg-[#030407]/80 border border-white/10 rounded-lg p-3 text-center flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[#F4F7FB] truncate">{port.name}</div>
                  <div className="text-[10px] text-[#A3ADBF] truncate">{port.state}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10">
                  <div className="text-sm font-mono font-bold text-[#8DB4F5]">{port.draft_m}m</div>
                  <span className="text-[9px] font-mono text-[#A3ADBF]/60 block mt-0.5">Verified: no</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE RECORD: WALK-FORWARD BACKTEST */}
      <section className="relative py-20 bg-[#030407] overflow-hidden">
        {/* Dim port-night background crop */}
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: 'url(/media/port-night-960.webp)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030407] via-transparent to-[#030407] pointer-events-none" />

        <div className="relative w-full max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-mono text-[#8DB4F5] uppercase tracking-wider block mb-2">
                Walk-Forward Decision Record
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F4F7FB] tracking-tight">
                738 Walk-Forward Decisions.
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#A3ADBF] max-w-xl">
                Strict out-of-sample backtest simulating a chartering desk over 2021–2026. Honest disclosure: over 90% of disciplined recommendations are "Book now".
              </p>
            </div>
            <Link
              to="/evidence"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#D4FF24] hover:underline"
            >
              <span>View full methodology & code</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0B0F1A]/80 border border-white/10 rounded-lg p-5">
              <div className="text-xs font-mono text-[#A3ADBF]">Total Decisions</div>
              <div className="text-3xl font-mono font-bold text-[#F4F7FB] mt-1">
                {totalDecisions}
              </div>
              <div className="text-[11px] font-mono text-[#A3ADBF]/70 mt-1">Walk-forward weekly cadence</div>
            </div>

            <div className="bg-[#0B0F1A]/80 border border-white/10 rounded-lg p-5">
              <div className="text-xs font-mono text-[#A3ADBF]">Book-Now Share</div>
              <div className="text-3xl font-mono font-bold text-[#8DB4F5] mt-1">
                {fmtPct(bookNowPct)}
              </div>
              <div className="text-[11px] font-mono text-[#A3ADBF]/70 mt-1">Disciplined risk aversion</div>
            </div>

            <div className="bg-[#0B0F1A]/80 border border-white/10 rounded-lg p-5">
              <div className="text-xs font-mono text-[#A3ADBF]">Wait Recommendation Wins</div>
              <div className="text-3xl font-mono font-bold text-[#10B981] mt-1">
                {fmtPct(waitWinRate)}
              </div>
              <div className="text-[11px] font-mono text-[#A3ADBF]/70 mt-1">Net saving after carrying costs</div>
            </div>

            <div className="bg-[#0B0F1A]/80 border border-white/10 rounded-lg p-5">
              <div className="text-xs font-mono text-[#A3ADBF]">Avg Saving on Waits</div>
              <div className="text-3xl font-mono font-bold text-[#D4FF24] mt-1">
                +{fmtRate(avgSavingOnWaits)}
              </div>
              <div className="text-[11px] font-mono text-[#A3ADBF]/70 mt-1">Per metric tonne</div>
            </div>
          </div>

          <div className="text-xs font-mono text-[#A3ADBF]/70 text-center">
            Synthetic data demo. In production, load proprietary fixtures and Baltic CSVs directly via the backend pipeline.
          </div>
        </div>
      </section>

      {/* 4. FROM THE EVIDENCE CARDS */}
      <EvidenceSection />

      {/* 5. ACCESSIBLE FAQ ACCORDION */}
      <FaqSection />

      {/* 6. CONVERSION TERMINAL CTA: LARGE LIME ENTER FREIGHTIQ BUTTON */}
      <section className="relative py-24 md:py-32 bg-[#030407] border-t border-white/10 overflow-hidden text-center">
        {/* Dim port-night background crop */}
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: 'url(/media/port-night-960.webp)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030407] via-[#030407]/80 to-transparent pointer-events-none" />

        <div className="relative w-full max-w-[960px] mx-auto px-6">
          <span className="text-xs font-mono text-[#D4FF24] uppercase tracking-widest px-3 py-1 rounded border border-[#D4FF24]/30 bg-[#D4FF24]/10 inline-block mb-4">
            07 · Commercial Terminal Access
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F4F7FB] max-w-2xl mx-auto leading-tight mb-6">
            Enter the FreightIQ Terminal.
          </h2>
          <p className="text-base sm:text-lg text-[#A3ADBF] max-w-xl mx-auto leading-relaxed mb-10">
            Simulate voyage freight economics, inspect physical port draft boundaries, and stress-test your chartering schedule against real-time probability cones.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterSite}
              data-testid="enter-freightiq-large-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded bg-[#D4FF24] hover:bg-[#C5F213] text-[#0B0F1A] font-bold text-base transition-all hover:scale-[1.03] active:scale-[0.98] shadow-2xl shadow-[#D4FF24]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF24] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030407]"
            >
              <span>Enter FreightIQ</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
            <Link
              to="/method"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded border border-white/20 hover:border-white/40 bg-[#0B0F1A] text-[#F4F7FB] font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1558C9]"
            >
              <span>Read Methodology Whitepaper</span>
              <ArrowUpRight className="w-4 h-4 text-[#8DB4F5]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <LandingFooter />
    </div>
  );
};

export default PhaseBSection;

