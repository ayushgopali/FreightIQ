import React, { useState, useEffect } from 'react';
import {
  Navigation2,
  AlertTriangle,
  Download,
  Activity,
  Layers,
  ArrowRight,
  ShieldAlert,
  Ship,
  Anchor,
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Scale,
  Compass
} from 'lucide-react';
import { api } from '../api/client';
import {
  DecisionRequest,
  DecisionResponse,
  Origin,
  PortName,
  ShipClass,
  DecisionOption
} from '../types';
import { CostTradeoffChart } from '../components/charts/CostTradeoffChart';

interface CharteringDecisionProps {
  origin: Origin;
  setOrigin: (o: Origin) => void;
  port: PortName;
  setPort: (p: PortName) => void;
  cargoT: number;
  setCargoT: (c: number) => void;
}

export const CharteringDecision: React.FC<CharteringDecisionProps> = ({
  origin,
  setOrigin,
  port,
  setPort,
  cargoT,
  setCargoT,
}) => {
  // Operational Parameters
  const [windowWeeks, setWindowWeeks] = useState<number>(6);
  const [riskAversion, setRiskAversion] = useState<number>(0.3);
  const [waitCost, setWaitCost] = useState<number>(0.05);
  const [marginPct, setMarginPct] = useState<number>(1.0);
  const [demMult, setDemMult] = useState<number>(1.0);

  const [decision, setDecision] = useState<DecisionResponse | null>(null);
  const [isAnalysing, setIsAnalysing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipTab, setSelectedShipTab] = useState<string | null>(null);

  const executeAnalysis = async () => {
    setIsAnalysing(true);
    setError(null);
    try {
      const req: DecisionRequest = {
        origin,
        port_name: port,
        cargo_t: cargoT,
        window_weeks: windowWeeks,
        wait_cost_pt_week: waitCost,
        risk_aversion: riskAversion,
        margin_pct: marginPct,
        dem_mult: demMult,
      };
      const res = await api.analyseDecision(req);
      setDecision(res);
      if (res.recommended_ship) {
        setSelectedShipTab(res.recommended_ship);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute decision analysis');
    } finally {
      setIsAnalysing(false);
    }
  };

  useEffect(() => {
    executeAnalysis();
  }, [origin, port, cargoT, windowWeeks, riskAversion, waitCost, marginPct, demMult]);

  const activeShip = selectedShipTab || decision?.recommended_ship || 'Capesize';
  const filteredOptions = decision?.options.filter(o => o.ship === activeShip) || [];
  const spotOption = filteredOptions.find(o => o.wait_weeks === 0) || filteredOptions[0];
  const optimalOption = filteredOptions.find(o => o.wait_weeks === decision?.recommended_wait_weeks) || spotOption;

  const downloadMemo = () => {
    if (!decision) return;
    const memo = `================================================================================
FREIGHTIQ MARITIME CHARTERING DECISION MEMORANDUM & FIXTURE RECAP
NOVEX Hackathon 2026 · AI-Based Decision Support System
================================================================================
Timestamp:               ${new Date().toISOString()}
Valuation Date:          ${decision.asof_date}
Corridor:                ${origin} to ${port}
Cargo:                   ${cargoT.toLocaleString()} MT Bulk Coal (Thermal/Coking)
Laycan Flexibility:      ${windowWeeks} week(s)

--------------------------------------------------------------------------------
RECOMMENDED FIXTURE ADVICE:  ${decision.action}
--------------------------------------------------------------------------------
Selected Class:          ${decision.recommended_ship || 'N/A'}
Wait Horizon:            ${decision.recommended_wait_weeks || 0} week(s)
Expected Landed Cost:    $${decision.expected_pt?.toFixed(2)} / MT
Worst-Case (P90) Cost:   $${decision.worst_pt?.toFixed(2)} / MT
Spot Baseline (Week 0):  $${decision.book_now_expected_pt?.toFixed(2)} / MT
Net Saving vs Spot:      $${decision.expected_saving_pt?.toFixed(2)} / MT ($${decision.expected_saving_total?.toLocaleString()})

COST BREAKDOWN:
  - Ocean Freight:       $${optimalOption?.freight_pt.toFixed(2)} / MT
  - Anchorage Demurrage: $${optimalOption?.demurrage_pt.toFixed(2)} / MT
  - Laycan Delay Cost:   $${optimalOption?.waiting_pt.toFixed(2)} / MT

QUANTITATIVE DRIVERS:
  - 4-Week Freight Trend:   ${decision.drivers ? (decision.drivers.mom4_pct >= 0 ? '+' : '') + decision.drivers.mom4_pct + '%' : 'N/A'}
  - 52-Week Mean Deviation: ${decision.drivers ? (decision.drivers.dev52_pct >= 0 ? '+' : '') + decision.drivers.dev52_pct + '%' : 'N/A'}
  - Median Forecast Delta:  ${decision.drivers ? (decision.drivers.forecast_median_chg_pct >= 0 ? '+' : '') + decision.drivers.forecast_median_chg_pct + '%' : 'N/A'}
  - Berth Queue Wait:       ${decision.drivers?.congestion_pct}th percentile (~${decision.wait_days?.toFixed(1)} days)

RISK CONTROLS:
  - Downside Weight (λ):    ${riskAversion}
  - Delay Cost Penalty:     $${waitCost} / MT / week
  - Margin Threshold:       ${marginPct}%
  - Demurrage Multiplier:   ${demMult}x

Data Provenance:         ${decision.data_source} benchmark
Prepared by FreightIQ Maritime Decision Engine. Probabilistic Decision Support.
================================================================================`;

    const blob = new Blob([memo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FreightIQ_Fixture_Recap_${origin}_${port}_${cargoT}MT.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Fixture Order Specification Sheet */}
      <div className="terminal-card bg-navy-900 border-navy-700/80 p-5">
        <div className="terminal-header">
          <span className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-ocean-400" />
            Chartering Order Specification & Risk Tolerance Controls
          </span>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>Algorithm: Monte Carlo N=4,000</span>
            <span>·</span>
            <span className="text-emerald-400 font-medium">Asymmetric Two-Piece</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Load Port Region</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value as Origin)}
              className="w-full bg-[#12171E] border border-[rgba(255,255,255,0.08)] rounded-sm px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-[#E08E39]"
            >
              <option value="South Africa">South Africa (Richards Bay)</option>
              <option value="Australia">Australia (Gladstone / Hay Point)</option>
              <option value="Indonesia">Indonesia (Kalimantan)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Discharge Port</label>
            <select
              value={port}
              onChange={(e) => setPort(e.target.value as PortName)}
              className="w-full bg-[#12171E] border border-[rgba(255,255,255,0.08)] rounded-sm px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-[#E08E39]"
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

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Cargo Parcel (MT)</label>
            <input
              type="number"
              value={cargoT}
              min={20000}
              max={600000}
              step={10000}
              onChange={(e) => setCargoT(Number(e.target.value))}
              className="w-full bg-[#12171E] border border-[rgba(255,255,255,0.08)] rounded-sm px-2.5 py-1.5 text-xs font-mono font-semibold text-white focus:outline-none focus:border-[#E08E39]"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono uppercase text-slate-400 mb-1">
              <span>Laycan Window</span>
              <span className="text-[#E08E39] font-bold">{windowWeeks}w</span>
            </div>
            <input
              type="range"
              min={0}
              max={8}
              value={windowWeeks}
              onChange={(e) => setWindowWeeks(Number(e.target.value))}
              className="w-full accent-[#E08E39] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-0.5">
              <span>Spot (0w)</span>
              <span>8 Weeks</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono uppercase text-slate-400 mb-1">
              <span>Downside Risk (λ)</span>
              <span className="text-[#E08E39] font-bold">{riskAversion}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={riskAversion}
              onChange={(e) => setRiskAversion(Number(e.target.value))}
              className="w-full accent-[#E08E39] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-0.5">
              <span>Risk Neutral</span>
              <span>Conservative</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Delay Cost ($/t/wk)</label>
            <input
              type="number"
              step={0.01}
              min={0}
              max={1}
              value={waitCost}
              onChange={(e) => setWaitCost(Number(e.target.value))}
              className="w-full bg-[#12171E] border border-[rgba(255,255,255,0.08)] rounded-sm px-2.5 py-1.5 text-xs font-mono font-semibold text-white focus:outline-none focus:border-[#E08E39]"
            />
          </div>
        </div>

        {/* Operational Guardrails Row */}
        <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-6 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500">Min Saving Margin:</span>
              <strong className="text-white font-semibold">{marginPct}%</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500">Demurrage Multiplier:</span>
              <strong className="text-white font-semibold">{demMult}x</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500">Under-Keel Clearance:</span>
              <strong className="text-white font-semibold">0.60 m</strong>
            </span>
          </div>

          <button
            onClick={executeAnalysis}
            disabled={isAnalysing}
            className="tactile-btn text-xs py-2 px-4 flex items-center gap-2 font-mono uppercase tracking-wider"
          >
            {isAnalysing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#101418] border-t-transparent rounded-full animate-spin"></div>
                <span>Executing Simulation...</span>
              </>
            ) : (
              <>
                <Navigation2 className="w-3.5 h-3.5" />
                <span>Re-Simulate Fixture Scenarios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {decision && !decision.feasible && (
        <div className="terminal-card bg-rose-500/5 border-rose-500/30 text-center py-12 space-y-3">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
            NO FEASIBLE VESSEL CLASS FOR SPECIFIED CARGO
          </h3>
          <p className="text-xs text-slate-450 max-w-xl mx-auto leading-relaxed">
            {decision.reason || 'All vessel classes exceed berth LOA, crane beam, or maximum draft constraints at this port. Adjust parcel size or examine the Port Intelligence matrix.'}
          </p>
        </div>
      )}

      {decision && decision.feasible && (
        <>
          {/* Central Chartering Advisory Panel */}
          <div className="terminal-card p-5 space-y-5">
            {/* Header: Action Badge & Decision Memo Export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.06)] gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 block mb-1">
                  COMMERCIAL CHARTERING RECOMMENDATION
                </span>
                <div className="flex items-center gap-3">
                  <div
                    className={`text-2xl sm:text-3xl font-black font-mono tracking-tight px-3.5 py-1 rounded-sm border ${
                      decision.action === 'BOOK NOW'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                        : 'bg-[#E08E39]/15 text-[#E08E39] border-[#E08E39]/50 shadow-sm shadow-[#E08E39]/20'
                    }`}
                  >
                    {decision.action}
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    <div>Class: <strong className="text-white font-semibold">{decision.recommended_ship}</strong></div>
                    <div className="text-slate-400 text-[11px]">
                      Timing: {decision.recommended_wait_weeks === 0 ? 'Spot Booking Today' : `Defer fixture by ~${decision.recommended_wait_weeks} weeks`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={downloadMemo}
                  className="tactile-pill text-xs px-3.5 py-2 flex items-center gap-2 font-mono text-slate-200 hover:text-white"
                >
                  <Download className="w-3.5 h-3.5 text-[#E08E39]" />
                  <span>Download Fixture Recap (.txt)</span>
                </button>
              </div>
            </div>

            {/* Side-by-Side Comparative Matrix: Spot vs Recommended Trajectory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Book Spot Now */}
              <div className="p-4 rounded-sm bg-[#12171E]/90 border border-[rgba(255,255,255,0.06)] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-2">
                  <span className="font-bold text-slate-300 uppercase text-[11px] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Option A: Fix Spot Today (Week 0)
                  </span>
                  <span className="text-[10px] text-slate-500">Immediate Certainty</span>
                </div>

                <div className="space-y-1.5 text-slate-400 text-[11px]">
                  <div className="flex justify-between">
                    <span>Base Freight:</span>
                    <span className="text-white">${spotOption?.freight_pt.toFixed(2)}/t</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Demurrage Risk Allowance:</span>
                    <span className="text-white">${spotOption?.demurrage_pt.toFixed(2)}/t</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supply Delay Penalty:</span>
                    <span className="text-white">$0.00/t</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Expected Landed Cost</span>
                    <span className="text-xl font-bold text-white font-mono">
                      ${decision.book_now_expected_pt?.toFixed(2)}
                      <span className="text-xs font-normal text-slate-400 ml-1">/t</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase">Voyage Outflow</span>
                    <span className="text-xs font-bold text-slate-300">
                      ${((decision.book_now_expected_pt || 0) * cargoT).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Option B: Optimal Strategy */}
              <div
                className={`p-4 rounded-sm border space-y-3 font-mono text-xs ${
                  decision.action === 'BOOK NOW'
                    ? 'bg-[#12171E]/90 border-[rgba(255,255,255,0.06)]'
                    : 'bg-[#E08E39]/5 border-[#E08E39]/40 shadow-sm shadow-[#E08E39]/10'
                }`}
              >
                <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-2">
                  <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#E08E39]" />
                    Option B: FreightIQ Strategy ({decision.recommended_wait_weeks === 0 ? 'Fix Spot' : `Wait ${decision.recommended_wait_weeks}w`})
                  </span>
                  <span className="text-[10px] text-[#E08E39] font-bold">Risk-Calibrated Edge</span>
                </div>

                <div className="space-y-1.5 text-slate-400 text-[11px]">
                  <div className="flex justify-between">
                    <span>Expected Freight:</span>
                    <span className="text-white">${optimalOption?.freight_pt.toFixed(2)}/t</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Demurrage Risk Allowance:</span>
                    <span className="text-white">${optimalOption?.demurrage_pt.toFixed(2)}/t</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supply Delay Penalty:</span>
                    <span className="text-white">${optimalOption?.waiting_pt.toFixed(2)}/t</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Expected Landed Cost</span>
                    <span className="text-xl font-bold text-[#E08E39] font-mono">
                      ${decision.expected_pt?.toFixed(2)}
                      <span className="text-xs font-normal text-slate-400 ml-1">/t</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase">Projected Net Saving</span>
                    <span
                      className={`text-sm font-bold ${
                        (decision.expected_saving_pt || 0) > 0 ? 'text-[#22C55E]' : 'text-slate-400'
                      }`}
                    >
                      {(decision.expected_saving_pt || 0) > 0
                        ? `-$${decision.expected_saving_pt?.toFixed(2)}/t ($${decision.expected_saving_total?.toLocaleString()})`
                        : '$0.00 (Spot optimal)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Worst-Case Downside Risk Exposure Strip */}
            <div className="p-3.5 rounded-sm bg-[#12171E] border border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono gap-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-slate-300">
                  Worst-Case Downside Ceiling (90th Percentile Exposure):{' '}
                  <strong className="text-rose-400">${decision.worst_pt?.toFixed(2)}/t</strong>
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Formula: Risk Score = Mean + λ(P90 - Mean) · Default λ = 0.30
              </div>
            </div>
          </div>

          {/* Quantitative Market Drivers Decomposed */}
          <div className="terminal-card">
            <div className="terminal-header">
              <span className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#E08E39]" />
                Quantitative Market Drivers Explaining This Advice
              </span>
              <span className="font-mono text-[10px] text-slate-400">Direct Feature Attributions</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-sm bg-[#12171E] border border-[rgba(255,255,255,0.06)]">
                <span className="text-slate-500 text-[10px] block uppercase">Rate Trend Momentum (4w)</span>
                <span
                  className={`text-lg font-bold mt-1 block ${
                    (decision.drivers?.mom4_pct || 0) < 0 ? 'text-[#22C55E]' : 'text-slate-200'
                  }`}
                >
                  {decision.drivers?.mom4_pct !== undefined
                    ? `${decision.drivers.mom4_pct >= 0 ? '+' : ''}${decision.drivers.mom4_pct.toFixed(1)}%`
                    : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {(decision.drivers?.mom4_pct || 0) < 0 ? 'Softening freight environment' : 'Firming momentum'}
                </span>
              </div>

              <div className="p-3 rounded-sm bg-[#12171E] border border-[rgba(255,255,255,0.06)]">
                <span className="text-slate-500 text-[10px] block uppercase">Historical Mean Deviation (52w)</span>
                <span
                  className={`text-lg font-bold mt-1 block ${
                    (decision.drivers?.dev52_pct || 0) > 0 ? 'text-[#E08E39]' : 'text-slate-200'
                  }`}
                >
                  {decision.drivers?.dev52_pct !== undefined
                    ? `${decision.drivers.dev52_pct >= 0 ? '+' : ''}${decision.drivers.dev52_pct.toFixed(1)}%`
                    : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {(decision.drivers?.dev52_pct || 0) > 0 ? 'Elevated vs mean: reversion expected' : 'Below long-run average'}
                </span>
              </div>

              <div className="p-3 rounded-sm bg-[#12171E] border border-[rgba(255,255,255,0.06)]">
                <span className="text-slate-500 text-[10px] block uppercase">Median Forecast Trajectory</span>
                <span
                  className={`text-lg font-bold mt-1 block ${
                    (decision.drivers?.forecast_median_chg_pct || 0) < 0 ? 'text-[#22C55E]' : 'text-rose-400'
                  }`}
                >
                  {decision.drivers?.forecast_median_chg_pct !== undefined
                    ? `${decision.drivers.forecast_median_chg_pct >= 0 ? '+' : ''}${decision.drivers.forecast_median_chg_pct.toFixed(1)}%`
                    : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Over evaluated decision horizon</span>
              </div>

              <div className="p-3 rounded-sm bg-[#12171E] border border-[rgba(255,255,255,0.06)]">
                <span className="text-slate-500 text-[10px] block uppercase">Anchorage Congestion Queue</span>
                <span className="text-lg font-bold text-white mt-1 block">
                  {decision.drivers?.congestion_pct?.toFixed(0)}th percentile
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ~{decision.wait_days?.toFixed(1)} days queue at {port}
                </span>
              </div>
            </div>
          </div>

          {/* Trade-Off Curve Across Weeks & Detailed Options Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 terminal-card">
              <CostTradeoffChart
                options={filteredOptions}
                recommendedWeek={decision.recommended_wait_weeks || 0}
              />
            </div>

            <div className="lg:col-span-6 terminal-card overflow-hidden flex flex-col">
              <div className="terminal-header">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-bold">{activeShip}</span>
                  <span className="text-slate-500">· Simulated Options Matrix</span>
                </div>
                <div className="flex items-center space-x-1">
                  {(['Capesize', 'Panamax', 'Supramax', 'Handysize'] as ShipClass[]).map((sc) => {
                    const isFeasible = decision.screened.find(s => s.ship === sc)?.feasible;
                    if (!isFeasible) return null;
                    return (
                      <button
                        key={sc}
                        onClick={() => setSelectedShipTab(sc)}
                        className={`px-2 py-0.5 rounded-sm text-[10px] font-mono transition-colors ${
                          activeShip === sc
                            ? 'bg-[#E08E39] text-[#101418] font-bold shadow-sm'
                            : 'bg-[#182029] text-slate-400 hover:text-white border border-[rgba(255,255,255,0.06)]'
                        }`}
                      >
                        {sc}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.06)] text-slate-400 text-[10px] uppercase">
                      <th className="pb-2">Timing</th>
                      <th className="pb-2">Ocean Freight</th>
                      <th className="pb-2">Demurrage</th>
                      <th className="pb-2">Delay Cost</th>
                      <th className="pb-2 text-white">Expected $/t</th>
                      <th className="pb-2 text-rose-400">P90 Worst</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                    {filteredOptions.map((o) => {
                      const isOptimal = o.wait_weeks === decision.recommended_wait_weeks && activeShip === decision.recommended_ship;
                      return (
                        <tr
                          key={o.wait_weeks}
                          className={`transition-colors ${
                            isOptimal ? 'bg-[#E08E39]/10 font-bold text-[#E08E39]' : 'text-slate-300 hover:bg-[#182029]/60'
                          }`}
                        >
                          <td className="py-2 flex items-center gap-1.5">
                            {o.wait_weeks === 0 ? 'Spot (0w)' : `+${o.wait_weeks}w`}
                            {isOptimal && (
                              <span className="text-[9px] bg-[#22C55E]/20 text-[#22C55E] px-1 py-0.2 rounded-sm font-bold">
                                BEST
                              </span>
                            )}
                          </td>
                          <td className="py-2">${o.freight_pt.toFixed(2)}</td>
                          <td className="py-2 text-slate-400">${o.demurrage_pt.toFixed(2)}</td>
                          <td className="py-2 text-slate-400">${o.waiting_pt.toFixed(2)}</td>
                          <td className="py-2 text-white font-bold">${o.expected_pt.toFixed(2)}</td>
                          <td className="py-2 text-rose-400">${o.worst_pt.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="pt-2 text-[10px] text-slate-500 font-mono text-right">
                All-in landed cost = Ocean Freight + Demurrage + Delay Cost
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
