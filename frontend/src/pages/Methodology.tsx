import React, { useState, useEffect } from 'react';
import { BookOpen, Database, Shield, Cpu } from 'lucide-react';
import { api } from '../api/client';

export const Methodology: React.FC = () => {
  const [methodology, setMethodology] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getMethodology();
        setMethodology(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Title & Architectural Statement */}
      <div className="terminal-card p-4">
        <div className="flex items-center space-x-2 text-amber-400 mb-1.5 font-mono text-xs">
          <BookOpen className="w-4 h-4" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            MATHEMATICAL & ALGORITHMIC ARCHITECTURE SPECIFICATION
          </h2>
        </div>
        <p className="text-xs text-slate-450 leading-relaxed font-sans">
          FreightIQ operates as a probabilistic chartering decision engine engineered for East Coast Indian bulk coal importers. It replaces rule-of-thumb spot negotiations with calibrated multi-horizon quantile regression, physical port screening (draft, LOA, beam, UKC), and asymmetric Monte Carlo risk simulation.
        </p>
      </div>

      {/* Algorithmic Pipeline Stages */}
      <div className="space-y-3">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          FIVE-STAGE QUANTITATIVE DECISION PIPELINE
        </div>

        {methodology?.pipeline ? (
          methodology.pipeline.map((step: any) => (
            <div key={step.step} className="terminal-card bg-dark-bg p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-2 font-mono">
                  <span className="w-5 h-5 rounded-none bg-amber-400/10 text-amber-300 border border-amber-400/40 flex items-center justify-center font-mono text-[10px]">
                    0{step.step}
                  </span>
                  {step.name}
                </span>
                {step.formula && (
                  <code className="bg-dark-surface px-2 py-0.5 rounded-none text-[10px] text-amber-300 font-mono border border-border-terminal">
                    {step.formula}
                  </code>
                )}
              </div>
              <p className="text-xs text-slate-450 leading-relaxed font-sans">{step.description}</p>
              {step.rule && (
                <div className="text-[10px] font-mono text-amber-300/90 bg-dark-surface p-2 rounded-none border border-border-terminal">
                  {step.rule}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-xs font-mono text-slate-500">Loading mathematical documentation...</div>
        )}
      </div>

      {/* Data Ingestion & Live Swap Protocol */}
      <div className="terminal-card p-4">
        <div className="terminal-header">
          <span className="flex items-center gap-2 font-mono text-xs">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            PRODUCTION DATA INGESTION ARCHITECTURE (ZERO CODE MODIFICATION)
          </span>
          <span className="font-mono text-[10px] text-emerald-400">CSV DROP-IN READY</span>
        </div>

        <p className="text-xs text-slate-450 mb-2.5 leading-relaxed font-sans">
          The demonstration environment uses a synthetic multi-year market designed to validate the out-of-sample backtest protocol offline. Live commercial datasets plug in directly by dropping files into the data directory:
        </p>

        <div className="bg-dark-bg p-3 rounded-none border border-border-terminal font-mono text-xs text-slate-300 space-y-1">
          <div className="text-slate-500"># Direct file drop into freightiq/data/real/</div>
          <div>data/real/rates.csv&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">→ [date, origin, cls, usd_per_t] (Baltic Exchange / Clarksons index)</span></div>
          <div>data/real/congestion.csv&nbsp;&nbsp;<span className="text-slate-500">→ [date, congestion_z] (AIS / Port queue index)</span></div>
          <div>data/real/coal.csv&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">→ [date, coal_usd_t] (API4 / Newcastle physical benchmark)</span></div>
        </div>
      </div>

      {/* Academic & Industry References */}
      <div className="terminal-card p-4">
        <div className="terminal-header">
          <span className="flex items-center gap-2 font-mono text-xs">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            ACADEMIC CITATIONS & MARITIME SOURCES
          </span>
        </div>

        <ul className="text-xs text-slate-450 space-y-2 list-disc list-inside font-sans">
          <li><strong>Baltic Exchange:</strong> Standard Dry Bulk Route Definitions & Capesize (BCI), Panamax (BPI), Supramax (BSI) indices.</li>
          <li><strong>Romano, Patterson & Candès (2019):</strong> <em>Conformalized Quantile Regression</em>, Advances in Neural Information Processing Systems (NeurIPS).</li>
          <li><strong>Ministry of Ports, Shipping and Waterways, Govt. of India:</strong> Indian Major Ports Operational Statistics & Berth Parameters.</li>
          <li><strong>Indian Ports Association (IPA):</strong> Monthly Traffic and Turnaround Metrics for East Coast Terminals.</li>
        </ul>
      </div>
    </div>
  );
};
