import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Layers,
  MapPin,
} from 'lucide-react';
import { api } from '../api/client';
import {
  PortName,
  ShipClass,
  PortFeasibilityResponse,
  PortsMatrixResponse
} from '../types';
import { PortMap } from '../components/charts/PortMap';

interface PortIntelligenceProps {
  port: PortName;
  setPort: (p: PortName) => void;
  cargoT: number;
  setCargoT: (c: number) => void;
}

export const PortIntelligence: React.FC<PortIntelligenceProps> = ({
  port,
  setPort,
  cargoT,
  setCargoT,
}) => {
  const [activeShipClass, setActiveShipClass] = useState<ShipClass>('Capesize');
  const [portFeasibility, setPortFeasibility] = useState<PortFeasibilityResponse | null>(null);
  const [matrixData, setMatrixData] = useState<PortsMatrixResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [pf, mat] = await Promise.all([
          api.getPortDetail(port, cargoT),
          api.getPortsMatrix(cargoT),
        ]);
        if (mounted) {
          setPortFeasibility(pf);
          setMatrixData(mat);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load port feasibility data');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [port, cargoT]);

  // Feasibility mapping for the map
  const feasibilityForActiveShip: Record<string, any> = {};
  if (matrixData?.matrix) {
    Object.entries(matrixData.matrix).forEach(([pName, ships]) => {
      feasibilityForActiveShip[pName] = ships[activeShipClass];
    });
  }

  return (
    <div className="space-y-4">
      {/* Port Limits Operational Safety Notice */}
      <div className="flex items-center justify-between p-2.5 rounded-sm bg-[#12171E]/90 border border-[#E08E39]/40 text-[#E08E39] text-xs font-mono shadow-sm">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#E08E39]" />
          <span>
            <strong className="text-white">OPERATIONAL NOTICE:</strong> Port parameters subject to seasonal siltation & tidal conditions (UKC margin: 0.60m applied). Verify with official harbour master notices.
          </span>
        </div>
        <span className="hidden md:inline text-[11px] text-[#E08E39] font-mono">UKC = 0.60 m</span>
      </div>

      {/* Main Grid: Interactive Radar Map + Selected Port Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Geographic Radar Map */}
        <div className="lg:col-span-5 space-y-3">
          <PortMap
            selectedPort={port}
            onSelectPort={setPort}
            feasibilityByPort={feasibilityForActiveShip}
            activeShipClass={activeShipClass}
          />

          {/* Ship Class Switcher for Radar Map */}
          <div className="terminal-card p-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Filter Screening by Vessel Class
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Capesize', 'Panamax', 'Supramax', 'Handysize'] as ShipClass[]).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setActiveShipClass(sc)}
                  className={`py-1 px-1.5 rounded-sm text-xs font-mono transition-colors border ${
                    activeShipClass === sc
                      ? 'bg-[#E08E39] text-[#101418] border-[#E08E39] font-bold shadow-sm'
                      : 'bg-[#182029] text-slate-400 hover:text-white border-[rgba(255,255,255,0.06)] hover:border-slate-500'
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Port Technical Specifications & Vessel Classes */}
        <div className="lg:col-span-7 space-y-4">
          {portFeasibility && (
            <div className="terminal-card">
              <div className="terminal-header">
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#E08E39]" />
                  PORT FACILITY LIMITS — <strong className="text-white uppercase">{port}</strong>
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  SOURCE: {portFeasibility.port.source}
                </span>
              </div>

              {/* Physical Spec Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-4">
                <div className="p-2.5 rounded-sm bg-[#12171E] border border-[rgba(255,255,255,0.06)] font-mono">
                  <span className="text-slate-500 text-[10px] block uppercase">Max Draft</span>
                  <span className="text-base font-bold text-white num-mono">{portFeasibility.port.max_draft.toFixed(1)} m</span>
                  <span className="text-[10px] text-slate-400 block num-mono">Eff: {(portFeasibility.port.max_draft - 0.6).toFixed(1)}m (UKC)</span>
                </div>

                <div className="p-2.5 rounded-sm bg-[#12171E] border border-[rgba(255,255,255,0.06)] font-mono">
                  <span className="text-slate-500 text-[10px] block uppercase">Max LOA</span>
                  <span className="text-base font-bold text-white num-mono">{portFeasibility.port.max_loa.toFixed(0)} m</span>
                  <span className="text-[10px] text-slate-400 block">Berth limit</span>
                </div>

                <div className="p-2.5 rounded-sm bg-[#12171E] border border-[rgba(255,255,255,0.06)] font-mono">
                  <span className="text-slate-500 text-[10px] block uppercase">Max Beam</span>
                  <span className="text-base font-bold text-white num-mono">{portFeasibility.port.max_beam.toFixed(0)} m</span>
                  <span className="text-[10px] text-slate-400 block">Crane reach</span>
                </div>

                <div className="p-2.5 rounded-sm bg-[#12171E] border border-[rgba(255,255,255,0.06)] font-mono">
                  <span className="text-slate-500 text-[10px] block uppercase">Discharge TPD</span>
                  <span className="text-base font-bold text-[#E08E39] num-mono">{portFeasibility.port.discharge_tpd.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block">Tonnes / Day</span>
                </div>
              </div>

              {/* Vessel Feasibility Breakdown for this Port */}
              <div className="text-[11px] font-mono uppercase text-slate-400 mb-2 border-b border-[rgba(255,255,255,0.06)] pb-1">
                Vessel Suitability at {port} for {(cargoT).toLocaleString()} t Parcel
              </div>

              <div className="space-y-1.5">
                {portFeasibility.ships.map((s) => {
                  return (
                    <div
                      key={s.ship}
                      className={`p-2.5 rounded-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono ${
                        s.status === 'Full'
                          ? 'bg-[#12171E] border-emerald-500/40'
                          : s.status === 'Part-load'
                          ? 'bg-[#12171E] border-[#E08E39]/40'
                          : 'bg-[#12171E] border-rose-500/40'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{s.ship}</span>
                          <span className="text-slate-400 text-[11px]">
                            ({(s.dwt).toLocaleString()} DWT)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{s.reason}</div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 block uppercase">Max Lift</span>
                          <span className="font-bold text-white num-mono">{(s.usable_load).toLocaleString()} t</span>
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 block uppercase">Voyages</span>
                          <span className="font-bold text-[#E08E39] num-mono">{s.voyages}</span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border ${
                            s.status === 'Full'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                              : s.status === 'Part-load'
                              ? 'bg-[#E08E39]/15 text-[#E08E39] border-[#E08E39]/40'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive 7 Ports x 4 Vessel Classes Feasibility Matrix */}
      <div className="terminal-card">
        <div className="terminal-header">
          <span className="flex items-center gap-1.5 font-mono text-xs">
            <Layers className="w-3.5 h-3.5 text-[#E08E39]" />
            EAST COAST PORT SCREENING MATRIX (7 PORTS × 4 CLASSES)
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            PARCEL: {(cargoT).toLocaleString()} TONNES
          </span>
        </div>

        {matrixData && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)] text-slate-400 text-[10px] uppercase">
                  <th className="py-2 px-3">Discharge Port</th>
                  <th className="py-2 px-3">Max Draft</th>
                  <th className="py-2 px-3 text-center">Handysize (35k)</th>
                  <th className="py-2 px-3 text-center">Supramax (58k)</th>
                  <th className="py-2 px-3 text-center">Panamax (82k)</th>
                  <th className="py-2 px-3 text-center">Capesize (170k)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {Object.entries(matrixData.matrix).map(([pName, ships]) => {
                  const isSelected = pName === port;
                  return (
                    <tr
                      key={pName}
                      onClick={() => setPort(pName as PortName)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#E08E39]/15 text-white font-bold' : 'hover:bg-[#182029]/60 text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3 flex items-center gap-2">
                        {isSelected ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E08E39] shadow-sm shadow-[#E08E39] shrink-0"></span>
                        ) : (
                          <span className="w-1.5 h-1.5 bg-transparent shrink-0"></span>
                        )}
                        <span>{pName}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-400 num-mono">
                        {pName === 'Paradip' ? '16.5m' : pName === 'Visakhapatnam' ? '15.5m' : pName === 'Haldia' ? '9.0m' : pName === 'Gangavaram' ? '18.0m' : pName === 'Dhamra' ? '17.5m' : pName === 'Gopalpur' ? '12.0m' : '13.0m'}
                      </td>
                      {(['Handysize', 'Supramax', 'Panamax', 'Capesize'] as ShipClass[]).map((sc) => {
                        const s = ships[sc];
                        return (
                          <td key={sc} className="py-2 px-3 text-center">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-bold border ${
                                s.status === 'Full'
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                                  : s.status === 'Part-load'
                                  ? 'bg-[#E08E39]/15 text-[#E08E39] border-[#E08E39]/40'
                                  : 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                              }`}
                            >
                              {s.status === 'Full' ? 'FULL' : s.status === 'Part-load' ? `PART ${(s.utilisation * 100).toFixed(0)}%` : 'BLOCKED'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
