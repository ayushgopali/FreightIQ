import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'Is the data real?',
    a: 'No, this is a demonstration environment using synthetic data generated from statistical distributions calibrated to real historical Baltic Exchange capesize/panamax index dynamics (2021–2026). In production, you can load your proprietary charter fixtures and Baltic CSVs directly via the backend data pipeline or the API.',
  },
  {
    q: 'Why are savings small?',
    a: 'Because nearly 90% of optimal decisions are “book now”. Dry-bulk freight carries significant tail risk, and waiting accumulates stockpile holding costs ($0.05/t/week) and demurrage risks. Average savings of 0.55% across 738 decisions reflect disciplined execution—saving $10,600 to $45,000 only when high-probability softening windows emerge, rather than gambling on volatile spot speculation.',
  },
  {
    q: 'Are port limits verified?',
    a: 'No, 0 of the 7 port limits are currently legally verified. All drafts, beam limitations, and LOAs are compiled from publicly available port authority handbooks and published circulars. Before executing commercial fixtures, operational teams must verify actual berth soundings and UKC guidelines with local port conservators and master mariners.',
  },
  {
    q: 'What is the worst case (P90)?',
    a: 'The worst case is the 90th percentile (P90) of the Monte Carlo simulation. It represents the conservative tail-risk scenario where freight spikes against expectation and terminal congestion causes demurrage ($26,000/day for Capesize). FreightIQ explicitly models this P90 cost to ensure charterers never take risks that jeopardize cargo economics.',
  },
  {
    q: 'Can I use my own numbers?',
    a: 'Yes. In the FreightIQ Commercial Console, every parameter is fully configurable in real time: cargo tonnage, origin loading port, destination terminal, vessel class, wait cost per tonne per week, risk aversion multiplier, and hurdle margin. You can test your exact trade scenario instantly.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-20 md:py-28 bg-[#0B0F1A] border-t border-b border-white/10 overflow-hidden">
      {/* Dim port-night background crop */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: 'url(/media/port-night-960.webp)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A] via-transparent to-[#0B0F1A] pointer-events-none" />

      <div className="relative w-full max-w-[960px] mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-mono text-[#8DB4F5] uppercase tracking-wider mb-2 block">
            06 · Questions & Transparency
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F7FB] tracking-tight">
            Frequently Asked Questions.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#A3ADBF] max-w-xl mx-auto">
            Direct, unvarnished answers about model methodology, synthetic data calibration, and commercial risk controls.
          </p>
        </div>

        {/* Accessible Accordion */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-lg bg-[#030407]/80 backdrop-blur-sm border border-white/10 overflow-hidden transition-all hover:border-white/20"
              >
                <button
                  id={`faq-btn-${idx}`}
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1558C9]"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                >
                  <span className="text-base font-semibold text-[#F4F7FB]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#8DB4F5] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-panel-${idx}`}
                    role="region"
                    aria-labelledby={`faq-btn-${idx}`}
                    className="px-6 pb-6 pt-2 text-sm text-[#A3ADBF] leading-relaxed border-t border-white/5 font-sans"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
