import React, { useState, useEffect } from 'react';
import {
  Ship,
  Anchor,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Compass,
  Radio,
  Clock,
  AlertTriangle,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { api } from '../api/client';
import { ForecastResponse, PortFeasibilityResponse, Origin, PortName, ShipClass } from '../types';
import { ForecastChart } from '../components/charts/ForecastChart';
import { PortMap } from '../components/charts/PortMap';
import { CorridorDrawer, CorridorRoute } from '../components/corridor/CorridorDrawer';

interface CommandCentreProps {
  origin: Origin;
  setOrigin: (o: Origin) => void;
  port: PortName;
  setPort: (p: PortName) => void;
  shipClass: ShipClass;
  setShipClass: (c: ShipClass) => void;
  cargoT: number;
  setCargoT: (c: number) => void;
  onNavigateToDecision: () => void;
}

export const CommandCentre: React.FC<CommandCentreProps> = ({
  origin,
  setOrigin,
  port,
  setPort,
  shipClass,
  setShipClass,
  cargoT,
  setCargoT,
  onNavigateToDecision,
}) => {
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [portData, setPortData] = useState<PortFeasibilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [fc, p] = await Promise.all([
          api.getForecast(origin, shipClass),
          api.getPortDetail(port, cargoT),
        ]);
        if (mounted) {
          setForecastData(fc);
          setPortData(p);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load command centre data');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [origin, port, shipClass, cargoT]);

  const currentRate = forecastData?.current_rate || 0;
  const p50_8w = forecastData?.forecast[forecastData.forecast.length - 1]?.p50 || 0;
  const p10_8w = forecastData?.forecast[forecastData.forecast.length - 1]?.p10 || 0;
  const p90_8w = forecastData?.forecast[forecastData.forecast.length - 1]?.p90 || 0;
  const totalExposure = currentRate * cargoT;
  const swingExample = 2.0 * cargoT; // $2/t swing exposure

  const activeShipFeasibility = portData?.ships.find((s) => s.ship === shipClass);

  const corridorTelemetry: Record<Origin, { distanceNm: number; steamingDays: number; loadTerminal: string }> = {
    'South Africa': { distanceNm: 4280, steamingDays: 14.3, loadTerminal: 'Richards Bay Coal Terminal (RBCT)' },
    'Australia': { distanceNm: 4790, steamingDays: 16.0, loadTerminal: 'Hay Point / Dalrymple Bay' },
    'Indonesia': { distanceNm: 2140, steamingDays: 7.1, loadTerminal: 'Taboneo Anchorage / Bunati' },
  };

  const tele = corridorTelemetry[origin];

  const handleSelectRoutePreset = (r: CorridorRoute) => {
    setOrigin(r.origin);
    setPort(r.port);
    setShipClass(r.shipClass);
    setCargoT(r.cargoT);
  };

  // Convert feasibility data for map
  const feasibilityMap: Record<string, any> = {};
  if (portData?.ships) {
    feasibilityMap[port] = activeShipFeasibility;
  }

  return (
    <div className="space-y-3 font-mono">
      {/* Top Active Voyage Status Bar (With subtle global map texture & warm amber typography) */}
      <div className="relative overflow-hidden bg-[#141920]/80 backdrop-blur-xl border border-white/[0.08] rounded-lg p-3 shadow-glass flex flex-wrap items-center justify-between gap-3">
        {/* Subtle dark global map / nautical grid background texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] flex items-center justify-end pr-8">
          <svg viewBox="0 0 600 120" className="w-[500px] h-full object-contain">
            <path d="M50,60 Q120,20 200,60 T350,50 T480,70" fill="none" stroke="#E08E39" strokeWidth="2" strokeDasharray="6 4" />
            <circle cx="200" cy="60" r="4" fill="#E08E39" />
            <circle cx="350" cy="50" r="4" fill="#E08E39" />
            <circle cx="480" cy="70" r="5" fill="#E08E39" />
            <path d="M20,30 L580,30 M20,60 L580,60 M20,90 L580,90" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
            <path d="M100,10 L100,110 M250,10 L250,110 M400,10 L400,110 M550,10 L550,110" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center space-x-3.5">
          <div className="flex items-center space-x-2.5">
            <span className="px-2 py-0.5 bg-[#E08E39]/15 text-[#E08E39] border border-[#E08E39]/30 rounded font-bold text-[10px] tracking-wider shadow-sm">
              ACTIVE VOYAGE
            </span>
            <span className="text-sm font-bold text-white tracking-wide">
              <span className="text-[#E08E39]">{origin.toUpperCase()}</span>{' '}
              <span className="text-[#8A96A6]">➔</span>{' '}
              <span className="text-[#E08E39]">{port.toUpperCase()}</span>
            </span>
          </div>
          <span className="text-white/10 hidden md:inline">|</span>
          <div className="hidden md:flex items-center space-x-2 text-[11px] text-[#8A96A6]">
            <span>VESSEL: <strong className="text-white">{shipClass}</strong></span>
            <span>·</span>
            <span>PARCEL: <strong className="text-white">{cargoT.toLocaleString()} MT</strong></span>
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-3 text-[10px]">
          <div className="flex items-center space-x-1.5 text-[#8A96A6] bg-[#101418]/60 px-2 py-1 rounded border border-white/5">
            <Compass className="w-3 h-3 text-[#38BDF8]" />
            <span>DISTANCE: <strong className="text-white">{tele.distanceNm.toLocaleString()} NM</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 text-[#8A96A6] bg-[#101418]/60 px-2 py-1 rounded border border-white/5">
            <Clock className="w-3 h-3 text-[#E08E39]" />
            <span>STEAMING: <strong className="text-[#E08E39]">~{tele.steamingDays} D</strong> (@ 12.5 KTS)</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[#8A96A6] bg-[#101418]/60 px-2 py-1 rounded border border-white/5 hidden sm:flex">
            <span>UKC MARGIN: <strong className="text-[#22C55E]">0.60 M PASS</strong></span>
          </div>
        </div>
      </div>

      {/* Main Multi-Panel Cockpit: Left Route Drawer + Center Analytical Workspace + Right Port Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column (3 Cols): Indian Coal Trade Lane Drawer */}
        <div className="lg:col-span-3 space-y-3">
          <div className="terminal-card p-3">
            <CorridorDrawer
              currentOrigin={origin}
              currentPort={port}
              currentShipClass={shipClass}
              onSelectRoute={handleSelectRoutePreset}
            />
          </div>

          {/* Quick Parameter Overrides Card (Tactile Inputs) */}
          <div className="terminal-card p-3 text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06] text-[10px] text-[#8A96A6]">
              <span className="font-bold text-white uppercase flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-[#E08E39]" />
                VOYAGE CONTROLS
              </span>
              <span>TUNING</span>
            </div>

            <div>
              <label className="text-[9.5px] uppercase text-[#8A96A6] block mb-1">DISCHARGE PORT</label>
              <select
                value={port}
                onChange={(e) => setPort(e.target.value as PortName)}
                className="w-full px-2.5 py-1.5 text-[11px]"
              >
                <option value="Paradip">Paradip Port (Odisha)</option>
                <option value="Visakhapatnam">Visakhapatnam (Andhra Pradesh)</option>
                <option value="Gangavaram">Gangavaram Port (Andhra Pradesh)</option>
                <option value="Gopalpur">Gopalpur Port (Odisha)</option>
                <option value="Dhamra">Dhamra Port (Odisha)</option>
                <option value="Sagar-Sandheads">Sagar-Sandheads (West Bengal)</option>
                <option value="Haldia">Haldia Dock Complex (West Bengal)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9.5px] uppercase text-[#8A96A6] block mb-1">VESSEL CLASS</label>
                <select
                  value={shipClass}
                  onChange={(e) => setShipClass(e.target.value as ShipClass)}
                  className="w-full px-2 py-1.5 text-[11px]"
                >
                  <option value="Capesize">Capesize (170k)</option>
                  <option value="Panamax">Panamax (82k)</option>
                  <option value="Supramax">Supramax (58k)</option>
                  <option value="Handysize">Handysize (35k)</option>
                </select>
              </div>

              <div>
                <label className="text-[9.5px] uppercase text-[#8A96A6] block mb-1">PARCEL (MT)</label>
                <input
                  type="number"
                  value={cargoT}
                  min={20000}
                  max={600000}
                  step={10000}
                  onChange={(e) => setCargoT(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center Column (6 Cols): Forward Freight Curve + Bay of Bengal Nautical Chart */}
        <div className="lg:col-span-6 space-y-3">
          {/* Forward Freight Curve Fan Chart */}
          <div className="terminal-card">
            <div className="terminal-header">
              <div>
                <span className="text-white font-bold block text-xs">
                  FORWARD FREIGHT RATE TRAJECTORY & PROBABILITY CONE
                </span>
                <span className="text-[9.5px] text-[#8A96A6] font-normal normal-case block mt-0.5">
                  Multi-horizon conformal quantile regression (P10 / P50 / P90) · 80% coverage
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[9.5px] bg-[#141920] px-2 py-0.5 rounded border border-white/[0.08] shadow-sm">
                <Radio className="w-2.5 h-2.5 text-[#22C55E]" />
                <span className="text-white font-medium">LIVE CQR CALIBRATED</span>
              </div>
            </div>

            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-2 text-[#8A96A6] text-xs">
                <div className="w-5 h-5 border-2 border-[#E08E39] border-t-transparent rounded-full animate-spin"></div>
                <span>Evaluating multi-horizon forward curve...</span>
              </div>
            ) : error ? (
              <div className="h-64 flex items-center justify-center text-[#EF4444] text-xs">
                {error}
              </div>
            ) : forecastData ? (
              <ForecastChart
                history={forecastData.history}
                forecast={forecastData.forecast}
                currentRate={forecastData.current_rate}
                shipClass={shipClass}
                origin={origin}
              />
            ) : null}
          </div>

          {/* Interactive Maritime Route Arc & Bay of Bengal Littoral Chart */}
          <div className="terminal-card">
            <PortMap
              selectedPort={port}
              onSelectPort={setPort}
              feasibilityByPort={feasibilityMap}
              activeShipClass={shipClass}
              origin={origin}
            />
          </div>
        </div>

        {/* Right Column (3 Cols): Port Performance, Risk Drivers & Decision Trigger */}
        <div className="lg:col-span-3 space-y-3">
          {/* Key Rates & Financial Outflow Card */}
          <div className="terminal-card p-3 text-xs space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06] text-[10px] text-[#8A96A6]">
              <span className="font-bold text-white uppercase">MARKET VALUATION</span>
              <span className="text-[#E08E39] font-bold">WEEK 0 SPOT</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="p-2.5 bg-[#12161D]/80 rounded-md border border-white/[0.06] shadow-sm">
                <span className="text-[9px] text-[#8A96A6] block uppercase">SPOT FREIGHT</span>
                <span className="text-base font-bold text-white num-mono">
                  ${currentRate.toFixed(2)}
                  <span className="text-[9px] text-[#8A96A6] font-normal ml-0.5">/t</span>
                </span>
              </div>

              <div className="p-2.5 bg-[#12161D]/80 rounded-md border border-white/[0.06] shadow-sm">
                <span className="text-[9px] text-[#8A96A6] block uppercase">P50 FORWARD</span>
                <span className="text-base font-bold text-[#E08E39] num-mono">
                  ${p50_8w.toFixed(2)}
                  <span className="text-[9px] text-[#8A96A6] font-normal ml-0.5">/t</span>
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-[#12161D]/80 rounded-md border border-white/[0.06] shadow-sm">
              <div className="flex justify-between items-center text-[9px] text-[#8A96A6]">
                <span>TOTAL FREIGHT OUTFLOW</span>
                <span>±$2/t SENSITIVITY</span>
              </div>
              <div className="text-lg font-bold text-white num-mono mt-0.5">
                ${totalExposure.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[9.5px] text-[#E08E39] num-mono mt-0.5">
                Margin Risk: ±${swingExample.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Destination Port Facility & Berthing Performance (MarineX Style) */}
          <div className="terminal-card p-3 text-xs space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06] text-[10px] text-[#8A96A6]">
              <span className="font-bold text-white uppercase flex items-center gap-1.5">
                <Anchor className="w-3 h-3 text-[#E08E39]" />
                PORT FACILITY LIMITS
              </span>
              <span className="text-[#E08E39] font-bold">{port}</span>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between p-2 bg-[#12161D]/80 rounded border border-white/[0.05]">
                <span className="text-[#8A96A6]">VESSEL SUITABILITY:</span>
                <span
                  className={`font-bold px-1.5 py-0.2 rounded border text-[9.5px] ${
                    activeShipFeasibility?.status === 'Full'
                      ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40'
                      : activeShipFeasibility?.status === 'Part-load'
                      ? 'bg-[#E08E39]/15 text-[#E08E39] border-[#E08E39]/40'
                      : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40'
                  }`}
                >
                  {activeShipFeasibility?.status || 'SCREENING'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#12161D]/80 rounded border border-white/[0.05]">
                <span className="text-[#8A96A6]">PERMISSIBLE DRAFT:</span>
                <span className="font-bold text-white num-mono">
                  {portData?.port.max_draft.toFixed(1)}m (Eff: {(portData?.port.max_draft ? portData.port.max_draft - 0.6 : 0).toFixed(1)}m)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#12161D]/80 rounded border border-white/[0.05]">
                <span className="text-[#8A96A6]">MAX USABLE LIFT:</span>
                <span className="font-bold text-white num-mono">
                  {activeShipFeasibility?.usable_load ? `${activeShipFeasibility.usable_load.toLocaleString()} MT` : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#12161D]/80 rounded border border-white/[0.05]">
                <span className="text-[#8A96A6]">ANCHOR QUEUE TIME:</span>
                <span className="font-bold text-[#E08E39] num-mono">
                  ~3.2 DAYS (MODERATE)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#12161D]/80 rounded border border-white/[0.05]">
                <span className="text-[#8A96A6]">DEMURRAGE RISK:</span>
                <span className="font-bold text-[#EF4444] num-mono">
                  $26,000 / DAY
                </span>
              </div>
            </div>
          </div>

          {/* Quantitative Risk Drivers Card */}
          <div className="terminal-card p-3 text-xs space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06] text-[10px] text-[#8A96A6]">
              <span className="font-bold text-white uppercase">MARKET SIGNALS</span>
              <span className="text-[#E08E39]">DRIVERS</span>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-[#8A96A6]">Rate Momentum:</span>
                <span className="text-[#22C55E] font-bold">Bearish (-$0.42/wk)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A96A6]">Mean Reversion Pull:</span>
                <span className="text-white font-bold">+$0.85 toward mean</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A96A6]">Congestion Index:</span>
                <span className="text-[#E08E39] font-bold">+0.41σ above baseline</span>
              </div>
            </div>
          </div>

          {/* Chartering Decision Hero Trigger Card (Warm Copper Glow) */}
          <div className="terminal-card bg-gradient-to-b from-[#1C232D] to-[#12171E] border border-[#E08E39]/40 p-3.5 text-xs space-y-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_24px_rgba(224,142,57,0.15)]">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-[#E08E39] uppercase tracking-wide">
                RECOMMENDED STRATEGY
              </span>
              <span className="text-[9px] bg-[#E08E39]/20 text-[#E08E39] px-2 py-0.5 rounded border border-[#E08E39]/40 font-bold">
                MONTE CARLO N=4,000
              </span>
            </div>

            <div className="text-xl font-bold font-mono text-white">
              WAIT 6 WEEKS
            </div>
            <div className="text-[11px] text-[#22C55E] font-bold font-mono">
              Expected Saving: +$440,000 (+ $2.94/t)
            </div>

            <p className="text-[10px] text-[#8A96A6] font-sans leading-tight">
              Risk-adjusted laycan optimization factors in freight distributions, port demurrage, and stockpile delay costs.
            </p>

            <button
              onClick={onNavigateToDecision}
              className="w-full mt-1 py-2.5 tactile-btn text-xs flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer"
            >
              <span>RUN CHARTERING SIMULATION</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

