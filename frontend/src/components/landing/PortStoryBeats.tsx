import React, { useMemo } from 'react';
import { ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { fmtRate, fmtPct } from '@/lib/api';

interface PortStoryBeatsProps {
  activeBeat: number;
  beatProgress: number; // 0 to 1 inside active beat
  onSkipIntro: () => void;
  onEnterSite: () => void;
  meta: any;
  backtest: any;
  decision: any;
}

export const PortStoryBeats: React.FC<PortStoryBeatsProps> = ({
  activeBeat,
  beatProgress,
  onSkipIntro,
  onEnterSite,
  meta,
  backtest,
  decision,
}) => {
  // Opacity fade envelope: fades in first 25%, stays solid 25-80%, fades out last 20%
  const getBeatOpacity = (targetBeat: number) => {
    if (activeBeat !== targetBeat) return 0;
    if (targetBeat === 5) {
      return Math.min(1, beatProgress / 0.20);
    }
    if (beatProgress < 0.25) {
      return beatProgress / 0.25;
    } else if (beatProgress > 0.80) {
      return (1.0 - beatProgress) / 0.20;
    }
    return 1;
  };

  // Real data figures from backend
  const expectedCost = decision?.expected_cost_usd_per_t ?? 12.10;
  const p90Cost = decision?.p90_cost_usd_per_t ?? 13.90;
  const expectedSaving = decision?.expected_saving_usd_per_t ?? 0.65;
  const hurdleMargin = 0.50;
  const clearsMargin = expectedSaving >= hurdleMargin;
  const displayVerdict = clearsMargin && (decision?.verdict?.toLowerCase().includes('wait') ?? true)
    ? 'WAIT 2 WEEKS'
    : 'BOOK NOW';
  const isWaitVerdict = displayVerdict === 'WAIT 2 WEEKS';

  // Step index in Beat 4 (0: Forecast, 1: Port Screen, 2: Decide)
  const stepIndex = beatProgress < 0.33 ? 0 : beatProgress < 0.66 ? 1 : 2;
  const stepSubProgress = stepIndex === 0
    ? beatProgress / 0.33
    : stepIndex === 1
    ? (beatProgress - 0.33) / 0.33
    : (beatProgress - 0.66) / 0.34;

  // Beat 3 Count-up ($340,000)
  const countUp340k = Math.floor(340000 * Math.min(1.0, Math.max(0.0, (beatProgress - 0.15) / 0.60)));

  // Beat 5 Record stats calculations
  const hl = backtest?.headline || backtest;
  const totalDecTarget = hl?.decisions ?? 738;
  const bNowPctTarget = hl?.waited_pct != null ? (100 - hl.waited_pct) : 89.8;
  const wWinRateTarget = hl?.better_pct != null && hl?.waited_pct ? ((hl.better_pct / hl.waited_pct) * 100) : 60.8;
  const avgSaveTarget = hl?.saving_usd_150k && hl?.waited_pct ? (hl.saving_usd_150k / (150000 * (hl.waited_pct / 100))) : 0.69;

  const beat5CountT = Math.min(1.0, Math.max(0.0, (beatProgress - 0.40) / 0.55));
  const currentTotalDec = Math.floor(totalDecTarget * beat5CountT);
  const currentBookNow = (bNowPctTarget * beat5CountT).toFixed(1);
  const currentWinRate = (wWinRateTarget * beat5CountT).toFixed(1);
  const currentAvgSave = (avgSaveTarget * beat5CountT).toFixed(2);

  const portsList = meta?.ports || [
    { name: 'Paradip', draft_m: 16.5, max_d: 18.0 },
    { name: 'Visakhapatnam', draft_m: 15.5, max_d: 18.0 },
    { name: 'Gangavaram', draft_m: 18.0, max_d: 18.0 },
    { name: 'Gopalpur', draft_m: 12.0, max_d: 18.0 },
    { name: 'Dhamra', draft_m: 17.5, max_d: 18.0 },
    { name: 'Sagar Sandheads', draft_m: 13.0, max_d: 18.0 },
    { name: 'Haldia', draft_m: 9.0, max_d: 18.0 },
  ];

  return (
    <div className="fixed inset-0 z-20 pointer-events-none select-none flex flex-col justify-between p-4 sm:p-8 md:p-12">
      {/* TOP BAR: Wordmark, Story Hairline Progress & Skip Intro */}
      <header className="relative w-full flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm tracking-widest text-[#D4FF24] uppercase font-bold">
            FreightIQ
          </span>
          <span className="hidden sm:inline-block text-xs font-mono text-[#A3ADBF]">
            · Maritime Decision Intelligence
          </span>
        </div>

        {/* Hairline Progress Bar with Beat indicator & dot */}
        <div className="flex items-center gap-3 bg-[#0B0F1A]/90 border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
          <div className="w-24 sm:w-36 h-1 bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-[#D4FF24] transition-all duration-100 relative"
              style={{
                width: `${((activeBeat + beatProgress) / 6) * 100}%`,
              }}
            />
          </div>
          <span className="font-mono text-xs text-[#D4FF24] font-semibold whitespace-nowrap">
            {activeBeat + 1} of 6
          </span>
        </div>

        {/* Skip Intro button */}
        <button
          onClick={onSkipIntro}
          className="text-xs font-mono text-[#A3ADBF] hover:text-[#F4F7FB] border border-white/15 hover:border-white/30 bg-[#0B0F1A]/90 px-3.5 py-1.5 rounded transition-colors"
          title="Press Esc or click to jump straight into terminal"
        >
          Skip intro <span className="opacity-50 ml-1">Esc</span>
        </button>
      </header>

      {/* MAIN DYNAMIC BEATS REGION */}
      <div className="relative flex-1 flex flex-col justify-center my-auto w-full max-w-[1400px] mx-auto py-4">

        {/* ============================================================== */}
        {/* BEAT 0: Exposure Fade & Scroll Cue                             */}
        {/* ============================================================== */}
        {activeBeat === 0 && (
          <div
            className="flex flex-col items-center justify-center text-center mx-auto transition-opacity duration-300 w-full"
            style={{ opacity: getBeatOpacity(0) }}
          >
            <div className="text-xs font-mono text-[#D4FF24] tracking-widest uppercase mb-3 px-3 py-1 border border-[#D4FF24]/30 rounded bg-[#D4FF24]/10">
              Synthetic Data Walk-Forward Demo
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#F4F7FB] mb-4">
              FreightIQ
            </h1>
            <p className="text-sm md:text-base text-[#A3ADBF] max-w-md mx-auto mb-8 leading-relaxed">
              Quantitative voyage rate forecasting & physical draft screening for Indian coal imports.
            </p>
            <div className="flex flex-col items-center gap-2 text-xs font-mono text-[#D4FF24] animate-bounce">
              <span>Scroll to begin story</span>
              <ChevronDown className="w-4 h-4 text-[#D4FF24]" />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* BEAT 1: "Book the ship now, or wait?"                          */}
        {/* ============================================================== */}
        {activeBeat === 1 && (
          <div
            className="w-full max-w-2xl text-left bg-[#0B0F1A]/90 border border-white/10 p-6 md:p-8 rounded-xl shadow-xl transition-opacity duration-300 ml-0 mr-auto"
            style={{ opacity: getBeatOpacity(1) }}
          >
            <div className="text-xs font-mono text-[#8DB4F5] uppercase tracking-wider mb-2">
              The Importer's Dilemma
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F7FB] leading-tight mb-4">
              Book the ship now, or wait?
            </h2>
            <p className="text-base sm:text-lg text-[#A3ADBF] leading-relaxed mb-6 font-normal">
              For East Coast Indian coal importers, chartering Cape or Panamax bulk vessels is fraught with spot freight volatility. Lock in today’s rate, or wait for forecast dips?
            </p>
            <div className="flex items-center gap-3 text-xs font-mono text-[#D4FF24] border-t border-white/10 pt-4">
              <span className="w-2 h-2 rounded-full bg-[#D4FF24]" />
              <span>738 Historical Backtest Decisions Evaluated · 89.8% Book Now Rate</span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* BEAT 2: Live Charter Decision (Text Left, SVG + Card Right)    */}
        {/* ============================================================== */}
        {activeBeat === 2 && (
          <div
            className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center transition-opacity duration-300"
            style={{ opacity: getBeatOpacity(2) }}
          >
            {/* LEFT REGION: Text Card */}
            <div className="bg-[#0B0F1A]/90 border border-white/10 p-6 md:p-8 rounded-xl shadow-xl">
              <span className="text-xs font-mono text-[#8DB4F5] uppercase tracking-wider block mb-1">
                Real Decision Engine
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#F4F7FB] mb-3">
                Live Charter Decision
              </h3>
              <p className="text-sm text-[#A3ADBF] leading-relaxed mb-4">
                Calibrated quantile forecast balances freight swings against $0.05/t/week inventory holding penalty for bulk charterers.
              </p>
              <div className="text-xs font-mono text-[#8DB4F5] border-t border-white/10 pt-3 flex items-center justify-between">
                <span>Vessel: Capesize (170,000 t)</span>
                <span>Richards Bay → Paradip</span>
              </div>
            </div>

            {/* RIGHT REGION: SVG Forecast Animation & Decision Card */}
            <div className="bg-[#0B0F1A]/95 border border-white/15 p-6 rounded-xl shadow-2xl pointer-events-auto flex flex-col gap-4">
              {/* SVG Animation: Forecast Cone Opening & Median Draw */}
              <div className="relative w-full h-[150px] bg-[#030407] rounded-lg border border-white/10 p-2 overflow-hidden">
                <svg viewBox="0 0 320 140" className="w-full h-full" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="30" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <line x1="30" y1="70" x2="300" y2="70" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <line x1="30" y1="120" x2="300" y2="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

                  {/* Cone Opening Calculation */}
                  {(() => {
                    const coneT = Math.min(1.0, Math.max(0.0, beatProgress / 0.65));
                    const topY = 70 - 45 * coneT;
                    const botY = 70 + 45 * coneT;
                    const medX = 30 + 260 * Math.min(1.0, coneT * 1.2);
                    const showDot = coneT > 0.45;
                    return (
                      <>
                        {/* Fanned Cone Polygon */}
                        <polygon
                          points={`30,70 290,${topY} 290,${botY}`}
                          fill="rgba(21, 88, 201, 0.18)"
                          stroke="#1558C9"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                        {/* P50 Median Line */}
                        <line
                          x1="30"
                          y1="70"
                          x2={medX}
                          y2="75"
                          stroke="#8DB4F5"
                          strokeWidth="2"
                        />
                        {/* Chosen-Week Dot on Week 2 */}
                        {showDot && (
                          <g transform="translate(160, 73)">
                            <circle r="6" fill="none" stroke="#D4FF24" strokeWidth="1" opacity="0.6" />
                            <circle r="4" fill="#D4FF24" stroke="#0B0F1A" strokeWidth="1.5" />
                            <text x="8" y="-6" fontSize="9" fill="#D4FF24" fontFamily="JetBrains Mono" fontWeight="bold">
                              W2 OPTIMAL
                            </text>
                          </g>
                        )}
                      </>
                    );
                  })()}

                  {/* As-Of Spot Dot */}
                  <circle cx="30" cy="70" r="4" fill="#FFFFFF" stroke="#1558C9" strokeWidth="1.5" />
                  <text x="35" y="86" fontSize="9" fill="#A3ADBF" fontFamily="JetBrains Mono">Spot $14.10</text>
                </svg>
              </div>

              {/* Real Figures Count Up */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-mono text-[#A3ADBF]">Decision Horizon: +2 Weeks</span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${isWaitVerdict ? 'bg-[#D4FF24] text-[#0B0F1A]' : 'bg-[#1558C9] text-white'}`}>
                  {displayVerdict}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] font-mono text-[#A3ADBF]">Expected Freight</div>
                  <div className="text-lg font-mono font-bold text-[#F4F7FB]">
                    {fmtRate(expectedCost)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-[#A3ADBF]">P90 Worst Case</div>
                  <div className="text-lg font-mono font-bold text-[#8DB4F5]">
                    {fmtRate(p90Cost)}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-2.5 rounded flex items-center justify-between">
                <span className="text-xs text-[#A3ADBF]">Expected Saving</span>
                <span className="text-xs font-mono font-bold text-[#D4FF24]">
                  +{fmtRate(expectedSaving)} (+$110,500 total)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* BEAT 3: "$340,000" (Text Left, Diverging Lines SVG Right)      */}
        {/* ============================================================== */}
        {activeBeat === 3 && (
          <div
            className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center transition-opacity duration-300"
            style={{ opacity: getBeatOpacity(3) }}
          >
            {/* LEFT REGION: Huge $340,000 Count-Up Card */}
            <div className="bg-[#0B0F1A]/90 border border-white/10 p-6 md:p-8 rounded-xl shadow-xl">
              <div className="text-xs font-mono text-[#D4FF24] uppercase tracking-wider mb-2">
                The Stakes · Asymmetric Risk
              </div>
              <div className="text-5xl sm:text-6xl font-bold font-mono text-[#F4F7FB] tracking-tight mb-2">
                ${countUp340k.toLocaleString()}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[#8DB4F5] mb-2">
                $2.00/t swing on a 170,000 t cargo
              </h3>
              <p className="text-xs sm:text-sm text-[#A3ADBF] leading-relaxed mb-4">
                Missing a market dip by two weeks or fixing into an unhedged bunker rally can wipe out an entire quarter of commercial plant margin.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-white/10 pt-3 text-[#A3ADBF]">
                <div>Carrying Cost: $0.05/t/wk</div>
                <div>Demurrage Risk: $26,000/day</div>
              </div>
            </div>

            {/* RIGHT REGION: Diverging Rate Lines SVG with $2/t Bracket */}
            <div className="bg-[#0B0F1A]/95 border border-white/15 p-6 rounded-xl shadow-2xl pointer-events-auto">
              <div className="text-xs font-mono text-[#8DB4F5] uppercase mb-3 flex items-center justify-between">
                <span>Rate Divergence Simulation</span>
                <span className="text-[#D4FF24]">Δ $2.00/t Bracket</span>
              </div>

              <div className="relative w-full h-[180px] bg-[#030407] rounded-lg border border-white/10 p-2 overflow-hidden">
                <svg viewBox="0 0 320 160" className="w-full h-full" preserveAspectRatio="none">
                  {/* Grid */}
                  <line x1="30" y1="30" x2="260" y2="30" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <line x1="30" y1="80" x2="260" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <line x1="30" y1="130" x2="260" y2="130" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

                  {(() => {
                    const divT = Math.min(1.0, Math.max(0.0, beatProgress / 0.75));
                    const endX = 30 + 220 * divT;
                    const topEndY = 80 - 45 * divT;
                    const botEndY = 80 + 45 * divT;

                    return (
                      <>
                        {/* Upper Line: Prompt Surge */}
                        <path
                          d={`M 30,80 Q ${30 + 110 * divT},80 ${endX},${topEndY}`}
                          fill="none"
                          stroke="#8DB4F5"
                          strokeWidth="2"
                        />
                        {/* Lower Line: Forecast Drop */}
                        <path
                          d={`M 30,80 Q ${30 + 110 * divT},80 ${endX},${botEndY}`}
                          fill="none"
                          stroke="#1558C9"
                          strokeWidth="2"
                        />

                        {/* As-Of Origin Dot */}
                        <circle cx="30" cy="80" r="3.5" fill="#FFFFFF" />
                        <text x="35" y="96" fontSize="9" fill="#A3ADBF" fontFamily="JetBrains Mono">Spot $14.10</text>

                        {/* Labels at ends */}
                        {divT > 0.5 && (
                          <>
                            <text x={endX + 5} y={topEndY + 3} fontSize="9" fill="#8DB4F5" fontFamily="JetBrains Mono">
                              +$2.00 Spike
                            </text>
                            <text x={endX + 5} y={botEndY + 3} fontSize="9" fill="#1558C9" fontFamily="JetBrains Mono">
                              -$0.65 Saving
                            </text>
                          </>
                        )}

                        {/* Vertical $2/t Dimension Bracket */}
                        {divT > 0.7 && (
                          <g transform="translate(285, 0)">
                            {/* Top tick */}
                            <line x1="-5" y1="35" x2="5" y2="35" stroke="#D4FF24" strokeWidth="1.5" />
                            {/* Bottom tick */}
                            <line x1="-5" y1="125" x2="5" y2="125" stroke="#D4FF24" strokeWidth="1.5" />
                            {/* Vertical line */}
                            <line x1="0" y1="35" x2="0" y2="125" stroke="#D4FF24" strokeWidth="1.5" strokeDasharray="3 3" />
                            {/* Center Tag */}
                            <rect x="-24" y="68" width="48" height="22" rx="3" fill="#0B0F1A" stroke="#D4FF24" strokeWidth="1" />
                            <text x="0" y="82" fontSize="9" fill="#D4FF24" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">
                              $2/t
                            </text>
                          </g>
                        )}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* BEAT 4: Three-Stage Protocol (Step Cards Left, SVG Right)      */}
        {/* ============================================================== */}
        {activeBeat === 4 && (
          <div
            className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center transition-opacity duration-300"
            style={{ opacity: getBeatOpacity(4) }}
          >
            {/* LEFT REGION: 3 Step Cards */}
            <div className="bg-[#0B0F1A]/90 border border-white/10 p-6 md:p-8 rounded-xl shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#8DB4F5] uppercase tracking-wider">
                  Three-Stage Decision Protocol
                </span>
                <span className="text-xs font-mono text-[#D4FF24]">
                  Step {stepIndex + 1} of 3
                </span>
              </div>

              {/* Step 1 Card */}
              <div className={`p-3.5 rounded border transition-all ${stepIndex === 0 ? 'border-[#1558C9] bg-[#1558C9]/15' : 'border-white/5 opacity-40'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded bg-[#1558C9] text-white flex items-center justify-center font-mono text-[10px] font-bold">01</span>
                  <h4 className="text-sm font-bold text-[#F4F7FB]">Forecast Cost Trajectory</h4>
                </div>
                <p className="text-xs text-[#A3ADBF]">Multi-horizon quantile regressors model bunker, momentum and seasonal rates.</p>
              </div>

              {/* Step 2 Card */}
              <div className={`p-3.5 rounded border transition-all ${stepIndex === 1 ? 'border-[#D4FF24] bg-[#D4FF24]/10' : 'border-white/5 opacity-40'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded bg-[#D4FF24] text-[#0B0F1A] flex items-center justify-center font-mono text-[10px] font-bold">02</span>
                  <h4 className="text-sm font-bold text-[#D4FF24]">Port Physical Screen</h4>
                </div>
                <p className="text-xs text-[#A3ADBF]">Verifies 16.5m draft limits and LOA berths across 7 East Coast ports.</p>
              </div>

              {/* Step 3 Card */}
              <div className={`p-3.5 rounded border transition-all ${stepIndex === 2 ? 'border-[#8DB4F5] bg-[#8DB4F5]/15' : 'border-white/5 opacity-40'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded bg-[#8DB4F5] text-[#0B0F1A] flex items-center justify-center font-mono text-[10px] font-bold">03</span>
                  <h4 className="text-sm font-bold text-[#F4F7FB]">Loss-Averse Decision</h4>
                </div>
                <p className="text-xs text-[#A3ADBF]">Advises "Wait" only when expected drops clear downside risk hurdles.</p>
              </div>
            </div>

            {/* RIGHT REGION: Active SVG Animation per Step */}
            <div className="bg-[#0B0F1A]/95 border border-white/15 p-6 rounded-xl shadow-2xl pointer-events-auto h-[260px] flex flex-col justify-between">
              {/* STEP 1 SVG: Forecast Cone & 80% Band */}
              {stepIndex === 0 && (
                <div className="w-full h-full flex flex-col justify-between">
                  <span className="text-xs font-mono text-[#8DB4F5] uppercase">Step 01 · Calibrated Quantile Conformal Band</span>
                  <svg viewBox="0 0 320 160" className="w-full h-[180px]" preserveAspectRatio="none">
                    {/* Grid */}
                    <line x1="30" y1="30" x2="290" y2="30" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <line x1="30" y1="80" x2="290" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <line x1="30" y1="130" x2="290" y2="130" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

                    {/* Fanning Band */}
                    <polygon
                      points="30,80 280,35 280,125"
                      fill="rgba(21, 88, 201, 0.22)"
                      stroke="#1558C9"
                      strokeWidth="1.2"
                      strokeDasharray="4 3"
                    />
                    {/* Median Line */}
                    <line x1="30" y1="80" x2="280" y2="85" stroke="#D4FF24" strokeWidth="2" />
                    <circle cx="30" cy="80" r="3.5" fill="#FFFFFF" />

                    <text x="285" y="38" fontSize="9" fill="#8DB4F5" fontFamily="JetBrains Mono" textAnchor="end">P90 $13.90</text>
                    <text x="285" y="82" fontSize="9" fill="#D4FF24" fontFamily="JetBrains Mono" textAnchor="end">P50 $12.10</text>
                    <text x="285" y="128" fontSize="9" fill="#8DB4F5" fontFamily="JetBrains Mono" textAnchor="end">P10 $10.80</text>
                  </svg>
                </div>
              )}

              {/* STEP 2 SVG: Ship Hull Cross Section, Lime Draft Line, Real Load Bar */}
              {stepIndex === 1 && (
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-mono text-[#D4FF24]">
                    <span>Step 02 · Hull Cross-Section & Draft</span>
                    <span>Paradip Max: 14.5m</span>
                  </div>

                  <svg viewBox="0 0 320 150" className="w-full h-[150px]">
                    {/* Waterline */}
                    <line x1="20" y1="40" x2="300" y2="40" stroke="#8DB4F5" strokeWidth="1.5" />
                    <text x="25" y="32" fontSize="8" fill="#8DB4F5" fontFamily="JetBrains Mono">Chart Datum Waterline</text>

                    {/* Ship Hull Cross-Section Geometry */}
                    <path
                      d="M 60,40 L 80,110 L 240,110 L 260,40 Z"
                      fill="rgba(21, 88, 201, 0.25)"
                      stroke="#1558C9"
                      strokeWidth="1.5"
                    />

                    {/* Lime Draft Line cutting across the hull */}
                    <line x1="50" y1="92" x2="270" y2="92" stroke="#D4FF24" strokeWidth="2" strokeDasharray="4 2" />
                    <text x="275" y="90" fontSize="8" fill="#D4FF24" fontFamily="JetBrains Mono">Draft 14.5m</text>

                    {/* Permissible Load Bar filling to 79.4% */}
                    {(() => {
                      const loadPct = 79.4 * Math.min(1.0, stepSubProgress * 1.5);
                      return (
                        <g transform="translate(60, 125)">
                          <rect x="0" y="0" width="200" height="12" rx="3" fill="rgba(255,255,255,0.08)" />
                          <rect x="0" y="0" width={(200 * loadPct) / 100} height="12" rx="3" fill="#D4FF24" />
                          <text x="100" y="9" fontSize="8" fill="#0B0F1A" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">
                            PERMISSIBLE LOAD: {loadPct.toFixed(1)}% (135,000 t)
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                  <div className="text-[10px] font-mono text-[#A3ADBF] flex items-center justify-between">
                    <span>UKC Clearance Buffer: +0.85m</span>
                    <span className="text-[#D4FF24]">SAFE FEASIBILITY</span>
                  </div>
                </div>
              )}

              {/* STEP 3 SVG: Book Now vs Wait Bars, P90 Tick, Settling Verdict Dot */}
              {stepIndex === 2 && (
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-mono text-[#F4F7FB]">
                    <span>Step 03 · Hurdle Evaluation</span>
                    <span className="text-[#D4FF24]">Verdict Settling</span>
                  </div>

                  <svg viewBox="0 0 320 150" className="w-full h-[150px]">
                    {/* Baseline Grid */}
                    <line x1="30" y1="120" x2="290" y2="120" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

                    {/* Bar 1: Book Now ($14.10/t) */}
                    <rect x="70" y="30" width="50" height="90" rx="3" fill="rgba(255,255,255,0.12)" stroke="#A3ADBF" strokeWidth="1" />
                    <text x="95" y="135" fontSize="9" fill="#A3ADBF" fontFamily="JetBrains Mono" textAnchor="middle">Book Now</text>
                    <text x="95" y="24" fontSize="9" fill="#A3ADBF" fontFamily="JetBrains Mono" textAnchor="middle">$14.10</text>

                    {/* Bar 2: Wait 2 Wks ($13.45/t) */}
                    <rect x="180" y="45" width="50" height="75" rx="3" fill="rgba(21, 88, 201, 0.35)" stroke="#1558C9" strokeWidth="1.5" />
                    <text x="205" y="135" fontSize="9" fill="#D4FF24" fontFamily="JetBrains Mono" textAnchor="middle">Wait 2 Wks</text>
                    <text x="205" y="40" fontSize="9" fill="#D4FF24" fontFamily="JetBrains Mono" textAnchor="middle">$13.45</text>

                    {/* P90 Tick on Wait bar */}
                    <line x1="170" y1="20" x2="240" y2="20" stroke="#8DB4F5" strokeWidth="1.5" strokeDasharray="3 2" />
                    <line x1="205" y1="45" x2="205" y2="20" stroke="#8DB4F5" strokeWidth="1.2" strokeDasharray="2 2" />
                    <text x="245" y="23" fontSize="8" fill="#8DB4F5" fontFamily="JetBrains Mono">P90 $13.90</text>

                    {/* Settling Verdict Dot */}
                    {(() => {
                      const dotT = Math.min(1.0, stepSubProgress * 1.4);
                      const dotX = 95 + (205 - 95) * dotT;
                      const dotY = 30 + (45 - 30) * dotT;
                      return (
                        <g transform={`translate(${dotX}, ${dotY})`}>
                          <circle r="7" fill="none" stroke="#D4FF24" strokeWidth="1" opacity="0.6" />
                          <circle r="5" fill="#D4FF24" stroke="#0B0F1A" strokeWidth="2" />
                        </g>
                      );
                    })()}
                  </svg>
                  <div className="text-[10px] font-mono text-[#D4FF24] text-center font-bold">
                    WINNER: WAIT 2 WEEKS (SAVES $0.65/t OVER PROMPT)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* BEAT 5: 7 Port Tiles Sequence & Record Stats Count-Up          */}
        {/* ============================================================== */}
        {activeBeat === 5 && (
          <div
            className="w-full flex flex-col gap-4 bg-[#0B0F1A]/95 border border-white/10 p-5 sm:p-6 rounded-xl shadow-xl transition-opacity duration-300 pointer-events-auto mt-auto"
            style={{ opacity: getBeatOpacity(5) }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#8DB4F5] uppercase tracking-wider">
                East Coast Port Limits & Backtest Record
              </span>
              <span className="text-[11px] font-mono text-[#D4FF24] bg-[#D4FF24]/10 border border-[#D4FF24]/30 px-2.5 py-0.5 rounded">
                Synthetic data · 0 of 7 port limits verified
              </span>
            </div>

            {/* 7 Port Tiles Filling in Sequence */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {portsList.map((port: any, idx: number) => {
                // Staggered fill progress per tile [0..1]
                const startT = idx * 0.08;
                const fillT = Math.min(1.0, Math.max(0.0, (beatProgress - startT) / 0.20));
                const draftFillPct = ((port.draft_m / 18.0) * 100) * fillT;

                return (
                  <div key={port.name} className="bg-white/5 border border-white/10 p-2.5 rounded text-center flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#F4F7FB] truncate">{port.name}</div>
                      <div className="text-[11px] font-mono text-[#8DB4F5]">{port.draft_m}m draft</div>
                    </div>
                    {/* Filling Draft Bar */}
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2 relative">
                      <div
                        className="h-full bg-[#D4FF24] transition-all duration-75"
                        style={{ width: `${draftFillPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Record Stats Count Up */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-3 text-center">
              <div>
                <div className="text-lg sm:text-2xl font-mono font-bold text-[#F4F7FB]">
                  {currentTotalDec}
                </div>
                <div className="text-[10px] font-mono text-[#A3ADBF] uppercase">Decisions Evaluated</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-mono font-bold text-[#8DB4F5]">
                  {currentBookNow}%
                </div>
                <div className="text-[10px] font-mono text-[#A3ADBF] uppercase">Book Now Rate</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-mono font-bold text-[#D4FF24]">
                  {currentWinRate}%
                </div>
                <div className="text-[10px] font-mono text-[#A3ADBF] uppercase">Wait Win Rate</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-mono font-bold text-[#D4FF24]">
                  +${currentAvgSave}/t
                </div>
                <div className="text-[10px] font-mono text-[#A3ADBF] uppercase">Avg Saving on Waits</div>
              </div>
            </div>

            {/* Enter Terminal Button at bottom of story */}
            <div className="flex items-center justify-center pt-2">
              <button
                onClick={onEnterSite}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded bg-[#D4FF24] hover:bg-[#C5F213] text-[#0B0F1A] font-bold text-sm shadow-lg transition-transform hover:scale-[1.02]"
              >
                <span>Enter FreightIQ Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PortStoryBeats;
