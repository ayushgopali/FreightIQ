import React from 'react';

interface HorizonMaeChartProps {
  maeByHorizon: Record<string, [number, number]>; // [model_mae, naive_mae]
}

export const HorizonMaeChart: React.FC<HorizonMaeChartProps> = ({ maeByHorizon }) => {
  if (!maeByHorizon || Object.keys(maeByHorizon).length === 0) return null;

  const width = 640;
  const height = 220;
  const padding = { top: 25, right: 20, bottom: 35, left: 50 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const horizons = Object.keys(maeByHorizon).sort((a, b) => Number(a) - Number(b));
  const maxVal = Math.max(...horizons.flatMap((h) => maeByHorizon[h])) * 1.15;

  const getY = (val: number) => padding.top + chartH - (val / maxVal) * chartH;

  const groupWidth = chartW / horizons.length;
  const barWidth = groupWidth * 0.35;

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between pb-2 text-xs border-b border-border-terminal mb-3">
        <span className="font-mono text-xs uppercase tracking-wider text-slate-300">
          FORECAST ERROR DYNAMICS BY HORIZON (OUT-OF-SAMPLE WALK-FORWARD)
        </span>
        <div className="flex items-center space-x-3 text-[10px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#4A5568] rounded-sm"></span>
            <span className="text-slate-400">NAIVE (NO CHANGE)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#E08E39] rounded-sm shadow-sm shadow-[#E08E39]/30"></span>
            <span className="text-[#E08E39] font-bold">FREIGHTIQ MODEL</span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-slate-400">
        {/* Y-axis Gridlines */}
        {[0, 0.5, 1.0, 1.5, 2.0].map((val, i) => {
          if (val > maxVal) return null;
          const y = getY(val);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-500">
                ${val.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Horizon Groups */}
        {horizons.map((h, i) => {
          const [modelMae, naiveMae] = maeByHorizon[h];
          const groupX = padding.left + i * groupWidth;
          const naiveX = groupX + groupWidth * 0.12;
          const modelX = naiveX + barWidth + 3;

          const naiveH = chartH - (getY(naiveMae) - padding.top);
          const modelH = chartH - (getY(modelMae) - padding.top);

          return (
            <g key={h}>
              {/* Naive Bar */}
              <rect
                x={naiveX}
                y={getY(naiveMae)}
                width={barWidth}
                height={naiveH}
                fill="#3A4454"
                rx="2"
                opacity="0.85"
              />
              <text
                x={naiveX + barWidth / 2}
                y={getY(naiveMae) - 4}
                textAnchor="middle"
                className="text-[9px] font-mono fill-slate-400"
              >
                {naiveMae.toFixed(2)}
              </text>

              {/* Model Bar */}
              <rect
                x={modelX}
                y={getY(modelMae)}
                width={barWidth}
                height={modelH}
                fill="#E08E39"
                rx="2"
              />
              <text
                x={modelX + barWidth / 2}
                y={getY(modelMae) - 4}
                textAnchor="middle"
                className="text-[9px] font-mono font-bold fill-amber-300"
              >
                {modelMae.toFixed(2)}
              </text>

              {/* Horizon label */}
              <text
                x={groupX + groupWidth / 2}
                y={height - 10}
                textAnchor="middle"
                className="text-[10px] font-mono fill-slate-400 font-bold"
              >
                T+{h}W
              </text>
            </g>
          );
        })}
      </svg>
      <div className="text-[10px] text-slate-500 text-center font-mono mt-1 border-t border-border-terminal/40 pt-1">
        Units: Mean Absolute Error ($/tonne) · Evaluated over 738 walk-forward decisions (2021–2026)
      </div>
    </div>
  );
};
