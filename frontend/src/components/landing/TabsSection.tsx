import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const TabsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);

  const tabs = [
    {
      num: '01',
      title: 'Forecast',
      headline: 'Quantile Gradient Boosting across Horizons 1–8 Weeks',
      text: 'Instead of single-point forecasts that fail during geopolitical freight shocks, FreightIQ computes calibrated 10th, 50th, and 90th percentiles using HistGradientBoostingRegressor and conformal quantile calibration. Models 52-week rate momentum, bunker spread, and vessel supply bottlenecks.',
      diagram: (
        <div className="relative w-full h-[220px] rounded-lg overflow-hidden border border-white/10 shadow-sm bg-[#0B0F1A] p-4 flex items-center justify-center">
          <svg viewBox="0 0 320 180" className="w-full h-full" aria-label="Quantile Forecast Diagram">
            {/* Grid lines */}
            <line x1="40" y1="30" x2="290" y2="30" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="40" y1="80" x2="290" y2="80" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="40" y1="130" x2="290" y2="130" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            {/* Historical line */}
            <path d="M 40,110 L 80,95 L 120,105 L 150,85" fill="none" stroke="#A3ADBF" strokeWidth="1.5" />
            {/* Conformal Cone */}
            <polygon
              points="150,85 190,65 240,45 290,35 290,145 240,130 190,110 150,85"
              fill="rgba(21, 88, 201, 0.2)"
              stroke="#1558C9"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {/* Median P50 */}
            <path d="M 150,85 L 190,82 L 240,78 L 290,70" fill="none" stroke="#D4FF24" strokeWidth="2" />
            <circle cx="150" cy="85" r="3.5" fill="#D4FF24" />
            <text x="150" y="72" fontSize="9" fill="#D4FF24" fontFamily="JetBrains Mono" fontWeight="bold">As-of Spot</text>
            <text x="290" y="28" fontSize="9" fill="#8DB4F5" fontFamily="JetBrains Mono" textAnchor="end">P90 Bound</text>
            <text x="290" y="65" fontSize="9" fill="#D4FF24" fontFamily="JetBrains Mono" textAnchor="end">P50 Expected</text>
            <text x="290" y="155" fontSize="9" fill="#8DB4F5" fontFamily="JetBrains Mono" textAnchor="end">P10 Favorable</text>
          </svg>
        </div>
      ),
    },
    {
      num: '02',
      title: 'Port screen',
      headline: 'Physical Berth Envelope & Under-Keel Clearance (UKC)',
      text: 'A favorable freight forecast is worthless if your vessel cannot physically berth. FreightIQ checks ship deadweight against max permissible draft, length overall (LOA), beam, and tide window for 7 Indian East Coast terminals, screening for draft-constrained deadweight deductions before pricing.',
      diagram: (
        <div className="relative w-full h-[220px] rounded-lg overflow-hidden border border-white/10 shadow-sm bg-[#0B0F1A] p-4 flex items-center justify-center">
          <svg viewBox="0 0 320 180" className="w-full h-full" aria-label="Port Draft Screening Diagram">
            {/* Water Surface Line */}
            <line x1="30" y1="55" x2="290" y2="55" stroke="#8DB4F5" strokeWidth="1.5" />
            <text x="35" y="48" fontSize="9" fill="#8DB4F5" fontFamily="JetBrains Mono">Chart Datum Level</text>
            {/* Vessel Draft Profile */}
            <path d="M 80,55 L 95,115 L 225,115 L 240,55 Z" fill="rgba(21, 88, 201, 0.25)" stroke="#1558C9" strokeWidth="1.5" />
            <rect x="135" y="38" width="50" height="17" fill="#1558C9" rx="2" />
            <text x="160" y="88" fontSize="10" fill="#FFFFFF" fontFamily="JetBrains Mono" textAnchor="middle">Draft 14.5m</text>
            {/* Seabed & Max Draft limit */}
            <line x1="30" y1="130" x2="290" y2="130" stroke="#D4FF24" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="285" y="124" fontSize="9" fill="#D4FF24" fontFamily="JetBrains Mono" textAnchor="end">Max Draft Limit 14.5m</text>
            {/* UKC clearance buffer */}
            <rect x="35" y="15" width="100" height="18" rx="3" fill="#0B0F1A" stroke="#D4FF24" strokeWidth="1" />
            <text x="85" y="27" fontSize="9" fill="#D4FF24" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">UKC +0.60M · SAFE</text>
          </svg>
        </div>
      ),
    },
    {
      num: '03',
      title: 'Decide',
      headline: 'Asymmetric Monte Carlo Expected Utility & Hurdle Gate',
      text: 'Combines forward rate distributions, port wait times, demurrage rates ($26,000/day for Capesize), and carrying costs ($0.05/t/week). If waiting does not beat prompt booking by at least the 1.0% risk hurdle margin, FreightIQ decisively issues a BOOK NOW verdict.',
      diagram: (
        <div className="relative w-full h-[220px] rounded-lg overflow-hidden border border-white/10 shadow-sm bg-[#0B0F1A] p-4 flex items-center justify-center">
          <svg viewBox="0 0 320 180" className="w-full h-full" aria-label="Chartering Decision Diagram">
            {/* Axes */}
            <line x1="40" y1="140" x2="280" y2="140" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="40" y1="30" x2="40" y2="140" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <text x="280" y="155" fontSize="9" fill="#A3ADBF" fontFamily="JetBrains Mono" textAnchor="end">Wait Window (Weeks)</text>
            <text x="35" y="24" fontSize="9" fill="#A3ADBF" fontFamily="JetBrains Mono">Total Cost ($/t)</text>
            {/* Book Now Baseline Horizontal line */}
            <line x1="40" y1="65" x2="280" y2="65" stroke="#A3ADBF" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="280" y="60" fontSize="9" fill="#A3ADBF" fontFamily="JetBrains Mono" textAnchor="end">Book Now: $13.45/t</text>
            {/* Wait Curve */}
            <path d="M 40,65 Q 120,68 180,80 T 280,115" fill="none" stroke="#8DB4F5" strokeWidth="1.5" />
            {/* Decision Dot */}
            <circle cx="40" cy="65" r="4.5" fill="#D4FF24" stroke="#0B0F1A" strokeWidth="1.5" />
            {/* Verdict Box */}
            <rect x="70" y="85" width="160" height="38" rx="4" fill="#0B0F1A" stroke="#D4FF24" strokeWidth="1" />
            <text x="150" y="102" fontSize="11" fill="#D4FF24" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">VERDICT: BOOK NOW</text>
            <text x="150" y="116" fontSize="9" fill="#FFFFFF" fontFamily="JetBrains Mono" textAnchor="middle">Hurdle not cleared (+0.35/t)</text>
          </svg>
        </div>
      ),
    },
  ];

  return (
    <section id="engine" className="relative py-24 md:py-32 pointer-events-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 pointer-events-auto">
        <div className="landing-card p-8 md:p-14 bg-white/95 backdrop-blur-md border border-[#E6E2D9] shadow-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="landing-label text-[#1558C9] mb-3 block">02 · Decision Engine</span>
              <h2 className="landing-h2 text-[#0B0F1A] font-medium leading-[1.1] tracking-tight">
                How FreightIQ decides.
              </h2>
            </div>
            <Link to="/method" className="landing-link font-mono text-sm">
              <span>Read mathematical architecture</span>
              <span className="link-arrow">→</span>
            </Link>
          </div>

          {/* Large Tabs Bar (Keyboard Operable) */}
          <div
            role="tablist"
            aria-label="Engine Steps"
            className="grid grid-cols-3 border-b border-[#E6E2D9] pb-px gap-2"
          >
            {tabs.map((tab, idx) => {
              const isSelected = activeTab === idx;
              return (
                <button
                  key={tab.num}
                  role="tab"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onClick={() => setActiveTab(idx as 0 | 1 | 2)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') setActiveTab(((idx + 1) % 3) as 0 | 1 | 2);
                    if (e.key === 'ArrowLeft') setActiveTab(((idx + 2) % 3) as 0 | 1 | 2);
                  }}
                  className={`text-left pb-4 border-b-2 transition-all min-h-[44px] ${
                    isSelected
                      ? 'border-[#1558C9] text-[#0B0F1A]'
                      : 'border-transparent text-[#555B6A] hover:text-[#0B0F1A]'
                  }`}
                >
                  <span className="font-mono text-xs md:text-sm font-bold text-[#1558C9] block">
                    {tab.num}
                  </span>
                  <span className="font-heading font-medium text-base sm:text-lg md:text-xl block mt-0.5">
                    {tab.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Panel */}
          <div className="mt-10 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-heading text-xl md:text-2xl font-medium text-[#0B0F1A] leading-snug">
                {tabs[activeTab].headline}
              </h3>
              <p className="text-base text-[#555B6A] leading-relaxed">
                {tabs[activeTab].text}
              </p>
              <div className="pt-4">
                <Link to="/method" className="landing-link font-mono text-xs uppercase tracking-wider">
                  <span>Explore formula & code in /method</span>
                  <span className="link-arrow">→</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="p-3 bg-[#FBF8F2] rounded border border-[#E6E2D9] shadow-xs">
                {tabs[activeTab].diagram}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
