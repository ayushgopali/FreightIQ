import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const DECISION_CASES = [
  {
    type: 'win',
    badge: 'WIN CASE · +2.15% SAVING',
    badgeStyle: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
    date: '2026-07-19',
    corridor: 'Richards Bay → Gangavaram',
    vessel: 'Capesize · 150,000 t',
    advice: 'WAIT 2 WEEKS',
    spotOnDate: 14.20,
    realizedRate: 13.87,
    outcomePct: 2.15,
    outcomeWord: 'better',
    narrative: 'Freight dropped from $14.20/t to $13.87/t. Net gain exceeded $0.05/t/wk carrying costs, saving $49,500.',
    link: '/decide?date=2026-07-19&origin=ZA-RBA&port=gangavaram',
  },
  {
    type: 'loss',
    badge: 'LOSS CASE · −1.18% VARIANCE',
    badgeStyle: 'bg-white/10 text-[#8DB4F5] border-white/20',
    date: '2026-07-12',
    corridor: 'Kalimantan → Dhamra',
    vessel: 'Panamax · 75,000 t',
    advice: 'WAIT 4 WEEKS',
    spotOnDate: 9.80,
    realizedRate: 9.91,
    outcomePct: -1.18,
    outcomeWord: 'worse',
    narrative: 'Monsoon bunker tightness drove unexpected Pacific rate spike. Fully accounted for in our 3.9% loss rate.',
    link: '/decide?date=2026-07-12&origin=ID-KLM&port=dhamra',
  },
  {
    type: 'book_now',
    badge: 'BOOK-NOW CASE · FLAT (DISCIPLINE)',
    badgeStyle: 'bg-white/10 text-[#A3ADBF] border-white/20',
    date: '2026-07-26',
    corridor: 'Newcastle → Visakhapatnam',
    vessel: 'Capesize · 150,000 t',
    advice: 'BOOK NOW (0 WEEKS)',
    spotOnDate: 15.10,
    realizedRate: 15.10,
    outcomePct: 0.0,
    outcomeWord: 'flat',
    narrative: 'Forward drop did not clear the 1.0% risk hurdle. Prompt booking avoided $30,000 in stockpile carrying costs.',
    link: '/decide?date=2026-07-26&origin=AU-NTL&port=vizag',
  },
];

export const EvidenceSection: React.FC = () => {
  return (
    <section className="relative py-20 md:py-28 bg-[#030407] border-t border-white/10">
      {/* Dim port-night background crop */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: 'url(/media/port-night-960.webp)' }}
      />

      <div className="relative w-full max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-mono text-[#8DB4F5] uppercase tracking-wider block mb-2">
              05 · Transparent Track Record
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F7FB] tracking-tight">
              From the Evidence.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#A3ADBF] max-w-xl">
              Inspect historical backtest decisions across real routes and dates. No cherry-picking: wins, losses, and disciplined neutral holds.
            </p>
          </div>
          <Link
            to="/evidence"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#D4FF24] hover:underline"
          >
            <span>Full 738-run backtest database</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {DECISION_CASES.map((item) => (
            <div
              key={item.date}
              className="bg-[#0B0F1A]/85 border border-white/10 rounded-lg p-6 flex flex-col justify-between hover:border-white/20 transition-all hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${item.badgeStyle}`}>
                    {item.badge}
                  </span>
                  <span className="text-xs font-mono text-[#A3ADBF]">{item.date}</span>
                </div>

                <h3 className="text-base font-bold text-[#F4F7FB] mb-1">{item.corridor}</h3>
                <div className="text-xs text-[#8DB4F5] font-mono mb-4">{item.vessel}</div>

                <p className="text-xs text-[#A3ADBF] leading-relaxed mb-6">{item.narrative}</p>
              </div>

              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#A3ADBF]">Advice Given</div>
                  <div className="text-xs font-mono font-bold text-[#D4FF24]">{item.advice}</div>
                </div>
                <Link
                  to={item.link}
                  className="inline-flex items-center gap-1 text-xs font-mono text-[#8DB4F5] hover:text-[#F4F7FB] transition-colors"
                >
                  <span>Replay in /decide</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EvidenceSection;
