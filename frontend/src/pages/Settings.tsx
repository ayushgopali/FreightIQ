import React from 'react';
import { Settings as SettingsIcon, Sliders, Anchor } from 'lucide-react';

export const Settings: React.FC = () => {
  const ships = [
    { name: 'Handysize', dwt: 35000, loa: 180, beam: 28.0, design_draft: 10.0, light_draft: 4.5, dem: 9000 },
    { name: 'Supramax', dwt: 58000, loa: 190, beam: 32.3, design_draft: 12.8, light_draft: 5.5, dem: 13000 },
    { name: 'Panamax', dwt: 82000, loa: 229, beam: 32.3, design_draft: 14.5, light_draft: 6.0, dem: 17000 },
    { name: 'Capesize', dwt: 170000, loa: 289, beam: 45.0, design_draft: 18.2, light_draft: 7.0, dem: 26000 },
  ];

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="terminal-card p-4">
        <div className="flex items-center space-x-2 text-amber-400 mb-1.5 font-mono text-xs">
          <SettingsIcon className="w-4 h-4" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            SYSTEM PARAMETERS & DRY BULK FLEET REGISTRY
          </h2>
        </div>
        <p className="text-xs text-slate-450 leading-relaxed font-sans">
          Operational constants, physical vessel parameters, safety buffers, and risk coefficients governing the chartering decision engine. Configured in <code className="bg-dark-bg px-1 py-0.5 rounded-none text-white font-mono">freightiq/config.py</code>.
        </p>
      </div>

      {/* Operational Constants */}
      <div className="terminal-card p-4">
        <div className="terminal-header">
          <span className="flex items-center gap-1.5 font-mono text-xs">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            GLOBAL MARITIME SAFETY & RISK PARAMETERS
          </span>
          <span className="font-mono text-[10px] text-slate-400">ENGINE CONFIGURATION</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-none bg-dark-bg border border-border-terminal">
            <span className="text-slate-500 text-[10px] block uppercase">UNDER-KEEL CLEARANCE (UKC)</span>
            <span className="text-lg font-bold text-white mt-0.5 block num-mono">0.60 m</span>
            <span className="text-[10px] text-slate-450 mt-0.5 block">Mandatory port safety clearance</span>
          </div>

          <div className="p-3 rounded-none bg-dark-bg border border-border-terminal">
            <span className="text-slate-500 text-[10px] block uppercase">MINIMUM LOAD RATIO</span>
            <span className="text-lg font-bold text-white mt-0.5 block num-mono">55% DWT</span>
            <span className="text-[10px] text-slate-450 mt-0.5 block">Below threshold = uneconomic call</span>
          </div>

          <div className="p-3 rounded-none bg-dark-bg border border-border-terminal">
            <span className="text-slate-500 text-[10px] block uppercase">RISK AVERSION FACTOR (λ)</span>
            <span className="text-lg font-bold text-amber-400 mt-0.5 block num-mono">0.30</span>
            <span className="text-[10px] text-slate-450 mt-0.5 block">Asymmetric worst-case weighting</span>
          </div>
        </div>
      </div>

      {/* Fleet Physical Constraints Table */}
      <div className="terminal-card p-4">
        <div className="terminal-header">
          <span className="flex items-center gap-1.5 font-mono text-xs">
            <Anchor className="w-3.5 h-3.5 text-amber-400" />
            STANDARD DRY-BULK VESSEL CLASS SPECIFICATIONS
          </span>
          <span className="font-mono text-[10px] text-slate-400">DIMENSIONS IN METRES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border-terminal text-slate-400 text-[10px] uppercase">
                <th className="py-2 px-3">Class</th>
                <th className="py-2 px-3">DWT (t)</th>
                <th className="py-2 px-3">LOA (m)</th>
                <th className="py-2 px-3">Beam (m)</th>
                <th className="py-2 px-3">Design Draft</th>
                <th className="py-2 px-3">Light Draft</th>
                <th className="py-2 px-3 text-right">Demurrage ($/day)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-terminal/50">
              {ships.map((s) => (
                <tr key={s.name} className="hover:bg-dark-bg text-slate-300 transition-colors">
                  <td className="py-2 px-3 font-bold text-white">{s.name}</td>
                  <td className="py-2 px-3 num-mono">{s.dwt.toLocaleString()}</td>
                  <td className="py-2 px-3 num-mono">{s.loa}</td>
                  <td className="py-2 px-3 num-mono">{s.beam.toFixed(1)}</td>
                  <td className="py-2 px-3 num-mono">{s.design_draft.toFixed(1)}m</td>
                  <td className="py-2 px-3 num-mono">{s.light_draft.toFixed(1)}m</td>
                  <td className="py-2 px-3 text-right text-amber-400 font-bold num-mono">${s.dem.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
