import React from 'react';
import { RefreshCw, Radio } from 'lucide-react';
import { Origin, PortName } from '../../types';

interface TopBarProps {
  title: string;
  subtitle: string;
  selectedOrigin: Origin;
  selectedPort: PortName;
  cargoT: number;
  asofDate: string;
  dataSource: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  selectedOrigin,
  selectedPort,
  cargoT,
  asofDate,
  dataSource,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <header className="h-13 bg-[#12161C]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 flex items-center justify-between shrink-0 z-10 select-none shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
      {/* Title & Technical Subtitle */}
      <div className="flex items-center space-x-3">
        <div>
          <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">
            {title}
          </span>
          <span className="text-[11px] text-[#8A96A6] font-mono ml-2 hidden md:inline">
            // {subtitle}
          </span>
        </div>
      </div>

      {/* Institutional Context Strip */}
      <div className="flex items-center space-x-2 text-xs font-mono">
        {/* Synthetic Data Flag */}
        {dataSource === 'synthetic' && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#1A2028] border border-white/10 rounded-md text-[#E08E39] text-[10px] shadow-sm">
            <Radio className="w-2.5 h-2.5 text-[#E08E39]" />
            <span className="font-semibold">BENCHMARK CALIBRATED</span>
          </div>
        )}

        {/* Corridor Telemetry Block (Tactile Pill) */}
        <div className="flex items-center space-x-2 bg-gradient-to-b from-[#1C232D] to-[#12171E] border border-white/10 rounded-md px-3 py-1.5 text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_4px_rgba(0,0,0,0.4)]">
          <span className="text-[#8A96A6]">CORRIDOR:</span>
          <span className="font-bold text-white">{selectedOrigin}</span>
          <span className="text-[#526071]">➔</span>
          <span className="font-bold text-[#E08E39]">{selectedPort}</span>
          <span className="text-white/10">|</span>
          <span className="text-[#8A96A6]">PARCEL:</span>
          <span className="text-white font-bold">{cargoT.toLocaleString()} MT</span>
        </div>

        {/* Valuation Date Block (Tactile Pill) */}
        <div className="flex items-center space-x-1.5 bg-gradient-to-b from-[#1C232D] to-[#12171E] border border-white/10 rounded-md px-2.5 py-1.5 text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_4px_rgba(0,0,0,0.4)]">
          <span className="text-[#8A96A6]">AS-OF:</span>
          <span className="font-bold text-white">{asofDate}</span>
        </div>

        {/* Refresh Action */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh valuation data"
            className="p-1.5 border border-white/10 bg-gradient-to-b from-[#1C232D] to-[#12171E] rounded-md text-[#8A96A6] hover:text-white hover:border-[#E08E39] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_4px_rgba(0,0,0,0.4)] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#E08E39]' : ''}`} />
          </button>
        )}
      </div>
    </header>
  );
};

