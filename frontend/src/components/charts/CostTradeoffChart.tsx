import React from 'react';
import { DecisionOption } from '../../types';

interface CostTradeoffChartProps {
  options: DecisionOption[];
  recommendedWeek: number;
}

export const CostTradeoffChart: React.FC<CostTradeoffChartProps> = ({ options, recommendedWeek }) => {
  if (!options || options.length === 0) return null;

  const width = 640;
  const height = 230;
  const padding = { top: 25, right: 25, bottom: 35, left: 50 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const expecteds = options.map((o) => o.expected_pt);
  const worsts = options.map((o) => o.worst_pt);

  const minCost = Math.floor(Math.min(...expecteds) * 0.95);
  const maxCost = Math.ceil(Math.max(...worsts) * 1.05);

  const getX = (waitWeeks: number) => padding.left + (waitWeeks / (options.length - 1)) * chartW;
  const getY = (cost: number) => padding.top + chartH - ((cost - minCost) / (maxCost - minCost)) * chartH;

  const expPoints = options.map((o) => `${getX(o.wait_weeks)},${getY(o.expected_pt)}`);
  const worstPoints = options.map((o) => `${getX(o.wait_weeks)},${getY(o.worst_pt)}`);

  const expPath = `M ${expPoints.join(' L ')}`;
  const worstPath = `M ${worstPoints.join(' L ')}`;

  const nowOption = options.find((o) => o.wait_weeks === 0) || options[0];
  const nowBaselineY = getY(nowOption.expected_pt);

  return (
    <div className="w-full font-mono select-none">
      <div className="flex items-center justify-between pb-2 text-xs border-b border-[#2B3544] mb-2">
        <span className="font-bold text-white uppercase text-[11px]">ALL-IN LANDED COST TRAJECTORY ($/MT)</span>
        <div className="flex items-center space-x-3 text-[10px]">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 bg-[#F59E0B]"></span>
            <span className="text-white">Expected Cost</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 border-t border-dashed border-[#EF4444]"></span>
            <span className="text-[#828E9E]">P90 Worst-Case</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 border-t border-dotted border-[#828E9E]"></span>
            <span className="text-[#828E9E]">Spot Baseline</span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-slate-400">
        <defs>
          <linearGradient id="tradeoffGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E08E39" stopOpacity="0.28" />
            <stop offset="65%" stopColor="#E08E39" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#E08E39" stopOpacity="0.0" />
          </linearGradient>
          <filter id="optimalGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Y Gridlines */}
        {[0, 0.5, 1].map((pct, i) => {
          const val = minCost + pct * (maxCost - minCost);
          const y = getY(val);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={padding.left - 6} y={y + 3.5} textAnchor="end" className="text-[9px] font-mono fill-[#828E9E]">
                ${val.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Book Now Baseline Reference */}
        <line
          x1={padding.left}
          y1={nowBaselineY}
          x2={width - padding.right}
          y2={nowBaselineY}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Area fill under expected curve */}
        <path
          d={`${expPath} L ${getX(options[options.length - 1].wait_weeks)},${padding.top + chartH} L ${getX(0)},${padding.top + chartH} Z`}
          fill="url(#tradeoffGrad)"
        />

        {/* P90 Worst Case Line */}
        <path d={worstPath} fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />

        {/* Expected Cost Line */}
        <path d={expPath} fill="none" stroke="#E08E39" strokeWidth="2.5" />

        {/* Data points & Recommended point */}
        {options.map((o) => {
          const x = getX(o.wait_weeks);
          const isRec = o.wait_weeks === recommendedWeek;
          return (
            <g key={o.wait_weeks}>
              {/* X label */}
              <text x={x} y={height - 10} textAnchor="middle" className="text-[9px] font-mono fill-[#828E9E]">
                {o.wait_weeks === 0 ? 'SPOT' : `+${o.wait_weeks}w`}
              </text>

              {/* Point on expected curve */}
              <circle
                cx={x}
                cy={getY(o.expected_pt)}
                r={isRec ? 4.5 : 3}
                fill={isRec ? '#22C55E' : '#E08E39'}
                stroke="#101418"
                strokeWidth="1.5"
                filter={isRec ? 'url(#optimalGlow)' : undefined}
              />

              {/* Point on worst curve */}
              <rect
                x={x - 2}
                y={getY(o.worst_pt) - 2}
                width={4}
                height={4}
                fill="#EF4444"
                opacity="0.8"
              />

              {/* Highlight badge for recommended week */}
              {isRec && (
                <g transform={`translate(${x}, ${getY(o.expected_pt) - 16})`}>
                  <rect x="-24" y="-12" width="48" height="15" rx="3" fill="#22C55E" />
                  <text x="0" y="-1" textAnchor="middle" className="text-[8.5px] font-bold font-mono fill-[#0B0E14]">
                    OPTIMAL
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
