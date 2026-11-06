import React, { useRef, useState } from "react";

// SVG forecast band chart: history line + P10–P90 corridor + P50 median.
export default function ForecastChart({
  history = [],
  forecast = [],
  height = 300,
}) {
  const W = 820;
  const H = height;
  const PAD = { l: 44, r: 14, t: 18, b: 26 };
  const ref = useRef(null);
  const [hover, setHover] = useState(null);

  const hist = history.slice(-40);
  const fc = forecast;
  const all = [...hist.map((h) => h.rate), ...fc.flatMap((f) => [f.p10, f.p90])];

  if (all.length < 2) {
    return <div className="h-[300px]" data-testid="forecast-chart-container" />;
  }

  const minV = Math.min(...all) * 0.97;
  const maxV = Math.max(...all) * 1.03;
  const total = hist.length + fc.length;

  const x = (i) => PAD.l + (i / (total - 1)) * (W - PAD.l - PAD.r);
  const y = (v) => PAD.t + (1 - (v - minV) / (maxV - minV)) * (H - PAD.t - PAD.b);

  const histPath = hist
    .map((h, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(h.rate).toFixed(1)}`)
    .join(" ");

  const fStart = hist.length - 1;
  const p50Path = fc
    .map(
      (f, i) =>
        `${i === 0 ? "M" : "L"}${x(fStart + 1 + i).toFixed(1)},${y(f.p50).toFixed(1)}`
    )
    .join(" ");

  const bandTop = fc
    .map(
      (f, i) =>
        `${i === 0 ? "M" : "L"}${x(fStart + 1 + i).toFixed(1)},${y(f.p90).toFixed(1)}`
    )
    .join(" ");

  const bandBottom = fc
    .slice()
    .reverse()
    .map(
      (f, i) =>
        `L${x(fStart + fc.length - i).toFixed(1)},${y(f.p10).toFixed(1)}`
    )
    .join(" ");

  const bandPath = `${bandTop} ${bandBottom} Z`;
  const gridVals = [0.25, 0.5, 0.75].map((q) => minV + (maxV - minV) * q);

  const onMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * (total - 1));
    setHover(Math.max(0, Math.min(total - 1, i)));
  };

  const rowAt = (i) => {
    if (i < hist.length) {
      return {
        date: hist[i].date,
        p10: hist[i].rate,
        p50: hist[i].rate,
        p90: hist[i].rate,
        future: false,
      };
    }
    const f = fc[i - hist.length];
    return { ...f, future: true };
  };

  return (
    <div data-testid="forecast-chart-container" className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto cursor-crosshair"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {gridVals.map((v) => (
          <g key={v}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y(v)}
              y2={y(v)}
              stroke="rgba(148,163,184,0.1)"
              strokeDasharray="3 5"
            />
            <text
              x={PAD.l - 8}
              y={y(v) + 3}
              textAnchor="end"
              fontSize="10"
              fill="#64748B"
              fontFamily="JetBrains Mono"
            >
              {v.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Forecast Band */}
        <path d={bandPath} fill="rgba(0,240,255,0.10)" stroke="none" />
        <path
          d={bandTop}
          fill="none"
          stroke="rgba(0,240,255,0.5)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <path
          d={bandBottom}
          fill="none"
          stroke="rgba(0,240,255,0.5)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Historical line */}
        <path d={histPath} fill="none" stroke="#94A3B8" strokeWidth="1.6" />

        {/* P50 median line */}
        <path d={p50Path} fill="none" stroke="#FFB800" strokeWidth="2" />

        {/* Hover marker */}
        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke="rgba(255,184,0,0.55)"
              strokeWidth="1"
            />
            <circle
              cx={x(hover)}
              cy={y(rowAt(hover).p50)}
              r="3.5"
              fill="#FFB800"
            />
          </g>
        )}

        {/* Vertical divider between history and forecast */}
        <line
          x1={x(fStart)}
          x2={x(fStart)}
          y1={PAD.t}
          y2={H - PAD.b}
          stroke="rgba(241,245,249,0.25)"
          strokeDasharray="2 4"
        />
        <text
          x={x(fStart) + 5}
          y={PAD.t + 10}
          fontSize="9"
          fill="#64748B"
          fontFamily="JetBrains Mono"
          letterSpacing="2"
        >
          FORECAST →
        </text>
      </svg>

      {/* Floating Hover Tooltip */}
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 rounded-md border border-white/10 bg-ink-800/95 px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-200 backdrop-blur shadow-lg z-10"
          style={{
            left: `${(x(hover) / W) * 100}%`,
            transform: hover > total * 0.7 ? "translateX(-105%)" : "translateX(8px)",
          }}
        >
          <div className="text-dim">{rowAt(hover).date}</div>
          {rowAt(hover).future ? (
            <div className="tabular">
              <span className="text-radar">
                P10 {rowAt(hover).p10?.toFixed(2)}
              </span>{" "}
              · P50 {rowAt(hover).p50?.toFixed(2)} ·{" "}
              <span className="text-beacon">
                P90 {rowAt(hover).p90?.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="tabular">
              spot {rowAt(hover).p50?.toFixed(2)} $/t
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 flex items-center gap-5 font-mono text-[10px] tracking-[0.16em] text-dim uppercase">
        <span className="flex items-center gap-2">
          <span className="inline-block h-[2px] w-5 bg-fog" /> Spot history
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-[2px] w-5 bg-beacon" /> P50 forecast
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-5 bg-radar/15 border border-dashed border-radar/50" />{" "}
          80% range
        </span>
      </div>
    </div>
  );
}
