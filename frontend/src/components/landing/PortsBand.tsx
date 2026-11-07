import React from 'react';
import { Link } from 'react-router-dom';
import { Anchor, ShieldAlert } from 'lucide-react';

interface PortsBandProps {
  portsData?: any[];
}

const DEFAULT_PORTS = [
  { name: 'Paradip', code: 'paradip', state: 'Odisha', draft: 14.5, loa: 260, verified: false },
  { name: 'Visakhapatnam', code: 'vizag', state: 'Andhra Pradesh', draft: 16.5, loa: 280, verified: false },
  { name: 'Gangavaram', code: 'gangavaram', state: 'Andhra Pradesh', draft: 18.5, loa: 300, verified: false },
  { name: 'Gopalpur', code: 'gopalpur', state: 'Odisha', draft: 12.0, loa: 235, verified: false },
  { name: 'Dhamra', code: 'dhamra', state: 'Odisha', draft: 17.5, loa: 300, verified: false },
  { name: 'Sagar — Sandheads', code: 'sagar', state: 'West Bengal', draft: 13.0, loa: 300, verified: false },
  { name: 'Haldia', code: 'haldia', state: 'West Bengal', draft: 9.0, loa: 200, verified: false },
];

export const PortsBand: React.FC<PortsBandProps> = ({ portsData }) => {
  const ports = portsData && portsData.length === 7
    ? portsData.map(p => ({
        name: p.name,
        code: p.code,
        state: p.state,
        draft: p.draft_m || p.draft,
        loa: p.loa_m || p.loa,
        verified: false,
      }))
    : DEFAULT_PORTS;

  return (
    <section id="ports" className="relative py-24 md:py-32 pointer-events-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 pointer-events-auto">
        <div className="landing-card p-8 md:p-12 bg-white/95 backdrop-blur-md border border-[#E6E2D9] shadow-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="landing-label text-[#1558C9] mb-3 block">03 · Physical Berth Envelope</span>
              <h2 className="landing-h2 text-[#0B0F1A] font-medium leading-[1.1] tracking-tight">
                7 Indian East Coast Ports. Screened in real time.
              </h2>
            </div>
            <Link to="/ports" className="landing-link font-mono text-sm">
              <span>View full port matrix & limits</span>
              <span className="link-arrow">→</span>
            </Link>
          </div>

          {/* All 7 Ports on ONE ROW (scrolls inside its container on small screens) */}
          <div className="overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-4 min-w-[1050px]">
              {ports.map((port) => (
                <div
                  key={port.name}
                  className="flex-1 p-4 rounded bg-[#FBF8F2] border border-[#E6E2D9] hover:border-[#1558C9] hover:shadow-xs transition-all group min-w-[140px]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] text-[#555B6A] uppercase tracking-wider block">
                      {port.state}
                    </span>
                    <Anchor className="w-3.5 h-3.5 text-[#1558C9] group-hover:scale-110 transition-transform" />
                  </div>

                  <h3 className="font-heading font-semibold text-sm text-[#0B0F1A] truncate" title={port.name}>
                    {port.name}
                  </h3>

                  <div className="mt-3 pt-3 border-t border-[#E6E2D9] space-y-1.5 font-mono text-xs">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[#555B6A] text-[11px]">Max Draft</span>
                      <span className="font-bold text-[#0B0F1A]">{port.draft.toFixed(1)}m</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[#555B6A] text-[11px]">Max LOA</span>
                      <span className="text-[#0B0F1A]">{port.loa}m</span>
                    </div>
                  </div>

                  {/* Required "Verified: no" Chip */}
                  <div className="mt-3.5 pt-2 border-t border-[#E6E2D9]/70 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <ShieldAlert className="w-2.5 h-2.5" />
                      Verified: no
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-mono text-[#555B6A]">
            <span>* All port limits compiled from published port authority handbooks. Requires master mariner verification before commercial fixture.</span>
            <Link to="/ports" className="text-[#0F47A3] hover:underline hidden sm:inline">
              Screen your vessel draft →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
