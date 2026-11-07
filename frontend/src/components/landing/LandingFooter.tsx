import React from 'react';
import { Link } from 'react-router-dom';
import { teamConfig, isPlaceholder } from '@/config/team';

const SOURCES = [
  { name: 'Baltic Exchange Indices', href: 'https://www.balticexchange.com' },
  { name: 'Ministry of Ports, Shipping & Waterways', href: 'https://shipmin.gov.in' },
  { name: 'Indian Ports Association', href: 'https://ipa.nic.in' },
  { name: 'Paradip Port Authority Guidelines', href: 'https://www.paradipport.gov.in' },
  { name: 'Visakhapatnam Port Authority Handbooks', href: 'https://www.vizagport.com' },
];

export const LandingFooter: React.FC = () => {
  const hasTeam = !isPlaceholder(teamConfig.teamName);
  const hasCollege = !isPlaceholder(teamConfig.college);

  return (
    <footer className="relative bg-[#030407] border-t border-white/10 py-16 text-[#F4F7FB]">
      <div className="w-full max-w-[1400px] mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-10">
          {/* Brand & Team */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#1558C9] text-white flex items-center justify-center font-bold text-base">
                F
              </div>
              <span className="font-bold text-xl text-[#F4F7FB]">FreightIQ</span>
            </div>

            <p className="text-sm text-[#A3ADBF] leading-relaxed max-w-sm">
              Probabilistic chartering decision engine engineered for East Coast Indian bulk coal imports.
              Calibrated forward quantiles, physical port envelope screening, and asymmetric Monte Carlo downside protection.
            </p>

            {/* Team & College (Placeholders strictly hidden, never invented) */}
            {(hasTeam || hasCollege || teamConfig.event) && (
              <div className="pt-2 font-mono text-xs text-[#A3ADBF]/80">
                {hasTeam && <span className="font-semibold text-[#D4FF24]">{teamConfig.teamName} · </span>}
                {hasCollege && <span>{teamConfig.college} · </span>}
                <span>{teamConfig.event}</span>
              </div>
            )}
          </div>

          {/* Platform Navigation */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <span className="text-[#8DB4F5] uppercase tracking-wider block mb-4">Platform Pages</span>
            <ul className="space-y-2.5">
              <li>
                <Link to="/console" className="text-[#A3ADBF] hover:text-[#F4F7FB] transition-colors">
                  Commercial Console
                </Link>
              </li>
              <li>
                <Link to="/ports" className="text-[#A3ADBF] hover:text-[#F4F7FB] transition-colors">
                  Port Draft Screening (/ports)
                </Link>
              </li>
              <li>
                <Link to="/evidence" className="text-[#A3ADBF] hover:text-[#F4F7FB] transition-colors">
                  Backtest Record (/evidence)
                </Link>
              </li>
              <li>
                <Link to="/method" className="text-[#A3ADBF] hover:text-[#F4F7FB] transition-colors">
                  Methodology Whitepaper (/method)
                </Link>
              </li>
              <li>
                <Link to="/demo" className="text-[#A3ADBF] hover:text-[#F4F7FB] transition-colors">
                  Time Machine Demo (/demo)
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Benchmark Sources */}
          <div className="md:col-span-4 space-y-3 font-mono text-xs">
            <span className="text-[#8DB4F5] uppercase tracking-wider block mb-4">Official Sources</span>
            <ul className="space-y-2.5">
              {SOURCES.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A3ADBF] hover:text-[#8DB4F5] transition-colors flex items-center justify-between"
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] opacity-40">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Honesty Line */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#A3ADBF]/60">
          <div>
            Synthetic data demo. All port limits and drafts are compiled from published circulars and unverified for commercial fixtures.
          </div>
          <div>FreightIQ · 2026</div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
