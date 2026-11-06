import React from 'react';
import {
  Compass,
  Navigation2,
  Anchor,
  History,
  BarChart3,
  BookOpen,
  Settings,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dataSource: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, dataSource }) => {
  const navItems = [
    { id: 'command', label: 'Command Centre', code: '01', icon: Compass },
    { id: 'decision', label: 'Chartering Decision', code: '02', icon: Navigation2 },
    { id: 'ports', label: 'Port Intelligence', code: '03', icon: Anchor },
    { id: 'replay', label: 'Historical Replay', code: '04', icon: History },
    { id: 'backtest', label: 'Backtest & Analytics', code: '05', icon: BarChart3 },
    { id: 'methodology', label: 'Data & Methodology', code: '06', icon: BookOpen },
    { id: 'settings', label: 'System Settings', code: '07', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-[#12161C]/85 backdrop-blur-xl border-r border-white/[0.06] flex flex-col h-screen select-none shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* Terminal Wordmark Header */}
      <div className="p-3.5 border-b border-white/[0.06] bg-[#0E1216]/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-b from-[#1C232C] to-[#12161C] border border-white/10 flex items-center justify-center text-[#E08E39] font-mono font-bold text-xs shadow-inner">
            FIQ
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-wider text-xs font-mono text-white">FREIGHT<span className="text-[#E08E39]">IQ</span></span>
              <span className="text-[9px] bg-[#1A2028] text-[#8A96A6] px-1 py-0.2 rounded border border-white/5 font-mono">v1.2</span>
            </div>
            <div className="text-[9.5px] text-[#8A96A6] tracking-tight font-mono">MARITIME RISK TERMINAL</div>
          </div>
        </div>
      </div>

      {/* Navigation Links (Tactile Pill Styles from Reference) */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        <div className="px-2.5 pb-1 text-[9px] font-bold uppercase tracking-wider text-[#526071] font-mono">
          OPERATIONAL WORKSPACES
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-mono rounded-md transition-all text-left ${
                isActive
                  ? 'bg-gradient-to-r from-[#E08E39]/15 to-transparent text-white border-l-2 border-[#E08E39] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                  : 'text-[#8A96A6] hover:text-[#F3F4F6] hover:bg-[#181F28]/60 border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#E08E39]' : 'text-[#526071]'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <span className={`text-[10px] font-mono ${isActive ? 'text-[#E08E39] font-bold' : 'text-[#475364]'}`}>
                {item.code}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Terminal System Status Footer */}
      <div className="p-3 border-t border-white/[0.06] bg-[#0E1216]/60 text-[10px] font-mono">
        <div className="bg-[#141920]/80 border border-white/[0.06] rounded-md p-2 space-y-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-[#8A96A6] flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-[#526071]" />
              ENGINE
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[#22C55E] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22C55E]"></span>
              ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-white/[0.04] pt-1.5">
            <span className="text-[#8A96A6]">FEED</span>
            <span className={`px-1.5 py-0.2 uppercase font-semibold text-[9px] rounded border ${
              dataSource === 'synthetic'
                ? 'bg-[#E08E39]/10 text-[#E08E39] border-[#E08E39]/30'
                : 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
            }`}>
              {dataSource}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

