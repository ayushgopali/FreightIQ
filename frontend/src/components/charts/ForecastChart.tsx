import React, { useState } from 'react';
import { HistoryPoint, ForecastHorizonPoint } from '../../types';

interface ForecastChartProps {
  history: HistoryPoint[];
  forecast: ForecastHorizonPoint[];
  currentRate: number;
  actualFuture?: HistoryPoint[];
  recommendedWeek?: number;
  shipClass: string;
  origin: string;
  unit?: string;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  history,
  forecast,
  currentRate,
  actualFuture,
  recommendedWeek,
  shipClass,
  origin,
  unit = '$/MT',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!history || history.length === 0 || !forecast || forecast.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-[#828E9E] font-mono text-xs">
        [AWAITING FORWARD FREIGHT CURVE DATA...]
      </div>
    );
  }

  // Dimensions
  const width = 860;
  const height = 290;
  const padding = { top: 25, right: 35, bottom: 35, left: 55 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Determine scale bounds
  const histValues = history.map((d) => d.rate);
  const p10Values = forecast.map((d) => d.p10);
  const p90Values = forecast.map((d) => d.p90);
  const actualValues = actualFuture ? actualFuture.map((d) => d.rate) : [];

  const allRates = [...histValues, ...p10Values, ...p90Values, ...actualValues, currentRate];
  const minRate = Math.max(0, Math.floor(Math.min(...allRates) * 0.90));
  const maxRate = Math.ceil(Math.max(...allRates) * 1.08);

  // Time points mapping
  const totalPoints = history.length + forecast.length;
  const getX = (index: number) => padding.left + (index / (totalPoints - 1)) * chartW;
  const getY = (val: number) => padding.top + chartH - ((val - minRate) / (maxRate - minRate)) * chartH;

  // History path with area fill
  const histPoints = history.map((d, i) => `${getX(i).toFixed(1)},${getY(d.rate).toFixed(1)}`);
  const histPath = `M ${histPoints.join(' L ')}`;
  const histAreaPath = `M ${getX(0).toFixed(1)},${(padding.top + chartH).toFixed(1)} L ${histPoints.join(' L ')} L ${getX(history.length - 1).toFixed(1)},${(padding.top + chartH).toFixed(1)} Z`;

  // Forecast path (anchored at last history point)
  const lastHistIdx = history.length - 1;
  const lastHistX = getX(lastHistIdx);
  const lastHistY = getY(currentRate);

  const p50Points = [`${lastHistX.toFixed(1)},${lastHistY.toFixed(1)}`];
  const p10Points = [`${lastHistX.toFixed(1)},${lastHistY.toFixed(1)}`];
  const p90Points = [`${lastHistX.toFixed(1)},${lastHistY.toFixed(1)}`];

  forecast.forEach((f, i) => {
    const x = getX(lastHistIdx + 1 + i);
    p50Points.push(`${x.toFixed(1)},${getY(f.p50).toFixed(1)}`);
    p10Points.push(`${x.toFixed(1)},${getY(f.p10).toFixed(1)}`);
    p90Points.push(`${x.toFixed(1)},${getY(f.p90).toFixed(1)}`);
  });

  const p50Path = `M ${p50Points.join(' L ')}`;

  // Shaded 80% band (P10 forward, P90 backward)
  const bandPoints = [...p10Points, ...p90Points.reverse()];
  const bandPath = `M ${bandPoints.join(' L ')} Z`;

  // Under-P50 subtle area glow
  const p50AreaPoints = [`${lastHistX.toFixed(1)},${(padding.top + chartH).toFixed(1)}`, ...p50Points, `${getX(totalPoints - 1).toFixed(1)},${(padding.top + chartH).toFixed(1)}`];
  const p50AreaPath = `M ${p50AreaPoints.join(' L ')} Z`;

  // Actual future path (if replay)
  let actualPath = '';
  if (actualFuture && actualFuture.length > 0) {
    const actPoints = actualFuture.map((d, i) => `${getX(lastHistIdx + i).toFixed(1)},${getY(d.rate).toFixed(1)}`);
    actualPath = `M ${actPoints.join(' L ')}`;
  }

  // Gridlines
  const yTicksCount = 5;
  const yTicks = Array.from({ length: yTicksCount }, (_, i) => {
    const val = minRate + (i / (yTicksCount - 1)) * (maxRate - minRate);
    return { val: Math.round(val * 10) / 10, y: getY(val) };
  });

  // Handle active hover data
  let activeHoverData: any = null;
  if (hoverIndex !== null) {
    if (hoverIndex < history.length) {
      const pt = history[hoverIndex];
      activeHoverData = {
        title: `HISTORICAL RECORD [${pt.date}]`,
        rate: pt.rate,
        type: 'history',
        x: getX(hoverIndex),
        y: getY(pt.rate),
      };
    } else {
      const fIdx = hoverIndex - history.length;
      if (fIdx < forecast.length) {
        const f = forecast[fIdx];
        activeHoverData = {
          title: `PROJECTION: +${f.horizon_weeks} WEEKS [${f.target_date}]`,
          p10: f.p10,
          p50: f.p50,
          p90: f.p90,
          type: 'forecast',
          x: getX(hoverIndex),
          y: getY(f.p50),
        };
      }
    }
  }

  return (
    <div className="relative w-full overflow-hidden select-none font-mono">
      {/* Freightos-Style Legend Strip */}
      <div className="flex flex-wrap items-center justify-between pb-2 text-[10px] border-b border-white/[0.06] mb-2 gap-2">
        <div className="flex items-center space-x-2 text-[#8A96A6]">
          <span className="font-bold text-white uppercase">{shipClass}</span>
          <span>·</span>
          <span>FORWARD FREIGHT CURVE ({unit})</span>
        </div>
        <div className="flex items-center space-x-3 text-[10px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-1.5 bg-[#475364] rounded-xs"></span>
            <span className="text-[#8A96A6]">History (52w)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-1.5 bg-[#E08E39]/30 border border-[#E08E39] rounded-xs"></span>
            <span className="text-[#E08E39]">80% CQR Ribbon</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-[#E08E39]"></span>
            <span className="text-white font-bold">P50 Forward</span>
          </div>
          {actualFuture && (
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-[#22C55E]"></span>
              <span className="text-[#22C55E]">Realised Outturn</span>
            </div>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          {/* Warm Amber & Copper Multi-Stop Area Gradients */}
          <linearGradient id="historyAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8A96A6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#8A96A6" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id="pBandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E08E39" stopOpacity="0.32" />
            <stop offset="60%" stopColor="#C77726" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#101418" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id="p50GlowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E08E39" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#E08E39" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y-Axis Gridlines & Ticks */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={tick.y}
              x2={width - padding.right}
              y2={tick.y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={tick.y + 3.5}
              textAnchor="end"
              className="text-[9px] font-mono fill-[#6B7A90]"
            >
              ${tick.val.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Valuation Date Transition Hairline */}
        <line
          x1={lastHistX}
          y1={padding.top}
          x2={lastHistX}
          y2={padding.top + chartH}
          stroke="#E08E39"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text
          x={lastHistX}
          y={padding.top - 6}
          textAnchor="middle"
          className="text-[9px] font-mono fill-[#E08E39] font-bold"
        >
          VALUATION DATE (SPOT)
        </text>

        {/* Shaded Area Gradients with rich depth */}
        <path d={histAreaPath} fill="url(#historyAreaGrad)" />
        <path d={bandPath} fill="url(#pBandGrad)" />
        <path d={p50AreaPath} fill="url(#p50GlowGrad)" />

        {/* Confidence Ribbons Envelopes */}
        <path d={p10Points.join(' L ')} fill="none" stroke="#E08E39" strokeWidth="1" strokeOpacity="0.5" />
        <path d={p90Points.join(' L ')} fill="none" stroke="#E08E39" strokeWidth="1" strokeOpacity="0.5" />

        {/* 52-Week History Curve */}
        <path d={histPath} fill="none" stroke="#8A96A6" strokeWidth="1.8" />

        {/* Median P50 Forward Freight Curve */}
        <path
          d={p50Path}
          fill="none"
          stroke="#E08E39"
          strokeWidth="2.5"
          strokeDasharray="5 2.5"
        />

        {/* Realised Outcome Line (Replay Audit) */}
        {actualPath && (
          <path d={actualPath} fill="none" stroke="#22C55E" strokeWidth="2.5" />
        )}

        {/* Spot Rate Anchor Node */}
        <circle cx={lastHistX} cy={lastHistY} r="4.5" fill="#E08E39" stroke="#101418" strokeWidth="1.5" />

        {/* Recommended Laycan Target Marker */}
        {recommendedWeek !== undefined && recommendedWeek > 0 && recommendedWeek <= forecast.length && (
          <g transform={`translate(${getX(lastHistIdx + recommendedWeek)}, ${getY(forecast[recommendedWeek - 1].p50)})`}>
            <circle r="7" fill="none" stroke="#E08E39" strokeWidth="1.5" />
            <circle r="3.5" fill="#E08E39" />
            <line x1="0" y1="-15" x2="0" y2="-7" stroke="#E08E39" strokeWidth="1" />
            <rect x="-26" y="-30" width="52" height="15" rx="3" fill="#12171E" stroke="#E08E39" strokeWidth="1" />
            <text x="0" y="-20" textAnchor="middle" className="text-[8.5px] font-mono fill-[#E08E39] font-bold">
              OPTIMAL
            </text>
          </g>
        )}

        {/* X-Axis Horizon Indicators */}
        {forecast.map((f, i) => {
          const x = getX(lastHistIdx + 1 + i);
          return (
            <g key={i}>
              <line x1={x} y1={padding.top + chartH} x2={x} y2={padding.top + chartH + 4} stroke="rgba(255, 255, 255, 0.1)" />
              <text
                x={x}
                y={padding.top + chartH + 15}
                textAnchor="middle"
                className="text-[9px] font-mono fill-[#8A96A6]"
              >
                +W{f.horizon_weeks}
              </text>
            </g>
          );
        })}

        {/* Vertical Crosshair Line on Hover */}
        {activeHoverData && (
          <g pointerEvents="none">
            <line
              x1={activeHoverData.x}
              y1={padding.top}
              x2={activeHoverData.x}
              y2={padding.top + chartH}
              stroke="#E08E39"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.9"
            />
            <circle cx={activeHoverData.x} cy={activeHoverData.y} r="4.5" fill="#E08E39" stroke="#101418" strokeWidth="1.5" />
          </g>
        )}

        {/* Full-width transparent hover tracking sectors */}
        {Array.from({ length: totalPoints }).map((_, idx) => {
          const x = getX(idx);
          const colW = chartW / totalPoints;
          return (
            <rect
              key={idx}
              x={x - colW / 2}
              y={padding.top}
              width={colW}
              height={chartH}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoverIndex(idx)}
            />
          );
        })}
      </svg>

      {/* Floating Institutional Glassmorphic Crosshair Telemetry Card */}
      {activeHoverData && (
        <div
          className="absolute z-30 pointer-events-none bg-[#141920]/90 backdrop-blur-xl border border-white/10 rounded-md p-3 text-xs shadow-glass space-y-1.5"
          style={{
            top: 28,
            right: 25,
            minWidth: 210,
          }}
        >
          <div className="font-mono font-bold text-white border-b border-white/[0.08] pb-1 text-[10.5px]">
            {activeHoverData.title}
          </div>
          {activeHoverData.type === 'history' ? (
            <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
              <span className="text-[#8A96A6]">Realised Freight:</span>
              <span className="font-bold text-white">${activeHoverData.rate.toFixed(2)}/t</span>
            </div>
          ) : (
            <div className="space-y-1 pt-0.5 text-[10px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#EF4444]">P90 (Worst-Case):</span>
                <span className="font-bold text-white">${activeHoverData.p90.toFixed(2)}/t</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#E08E39] font-bold">P50 (Median):</span>
                <span className="font-bold text-[#E08E39]">${activeHoverData.p50.toFixed(2)}/t</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#22C55E]">P10 (Best-Case):</span>
                <span className="font-bold text-white">${activeHoverData.p10.toFixed(2)}/t</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

