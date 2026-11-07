import React from 'react';
import { OVERLAY_COORDINATES } from '@/config/portFocus';
import { fmtRate } from '@/lib/api';

interface PortDataOverlaysProps {
  activeBeat: number;
  beatProgress: number; // 0 to 1 inside current beat
  decision?: any;
}

export const PortDataOverlays: React.FC<PortDataOverlaysProps> = ({
  activeBeat,
  beatProgress,
  decision,
}) => {
  // Beat 2: Forecast cone fans out across the water in front of bulk carrier
  const isBeat2 = activeBeat === 2;

  // Beat 4: Lime waterline draft line along the bulk carrier hull
  const isBeat4 = activeBeat === 4;

  if (!isBeat2 && !isBeat4) {
    return null;
  }

  // Opening animation progress for forecast cone [0..1]
  const coneOpenT = isBeat2 ? Math.min(1.0, Math.max(0.0, (beatProgress - 0.10) / 0.45)) : 0;
  const easedConeT = coneOpenT < 0.5 ? 2 * coneOpenT * coneOpenT : 1 - Math.pow(-2 * coneOpenT + 2, 2) / 2;

  // Draft line drawing progress [0..1]
  const draftDrawT = isBeat4 ? Math.min(1.0, Math.max(0.0, (beatProgress - 0.15) / 0.45)) : 0;

  // Coordinates from portFocus.ts
  const { forecastCone, waterlineDraft } = OVERLAY_COORDINATES;

  // Animate cone opening from median line to top/bottom fan edges
  const [ox, oy] = forecastCone.origin;
  const [txFinal, tyFinal] = forecastCone.topFinal;
  const [mx, my] = forecastCone.medianFinal;
  const [bxFinal, byFinal] = forecastCone.bottomFinal;

  const currentTopX = mx + (txFinal - mx) * easedConeT;
  const currentTopY = my + (tyFinal - my) * easedConeT;
  const currentBottomX = mx + (bxFinal - mx) * easedConeT;
  const currentBottomY = my + (byFinal - my) * easedConeT;

  const currentMedianLen = Math.hypot(mx - ox, my - oy);
  const medianDrawX = ox + (mx - ox) * Math.min(1.0, easedConeT * 1.25);
  const medianDrawY = oy + (my - oy) * Math.min(1.0, easedConeT * 1.25);

  const [cx, cy] = forecastCone.chosenWeekNode;

  // Draft line drawing
  const draftCurrentXEnd = waterlineDraft.xStart + (waterlineDraft.xEnd - waterlineDraft.xStart) * draftDrawT;
  const draftCurrentYEnd = waterlineDraft.yStart + (waterlineDraft.yEnd - waterlineDraft.yStart) * draftDrawT;

  const expectedCost = decision?.expected_cost_usd_per_t ?? 12.10;
  const p90Cost = decision?.p90_cost_usd_per_t ?? 13.90;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cobalt Forecast Cone Gradient */}
          <linearGradient id="cobaltConeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1558C9" stopOpacity="0.45" />
            <stop offset="55%" stopColor="#2F7BFF" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#1558C9" stopOpacity="0.08" />
          </linearGradient>

          {/* Lime Glow Filter */}
          <filter id="limeGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.45" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Cobalt Glow Filter */}
          <filter id="cobaltGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ========================================================= */}
        {/* BEAT 2: COBALT FORECAST CONE OPENING OVER WATER           */}
        {/* ========================================================= */}
        {isBeat2 && (
          <g className="transition-opacity duration-300" style={{ opacity: Math.min(1.0, beatProgress * 3.5) }}>
            {/* Cone Fill Polygon */}
            {easedConeT > 0.05 && (
              <polygon
                points={`${ox},${oy} ${currentTopX},${currentTopY} ${mx},${my} ${currentBottomX},${currentBottomY}`}
                fill="url(#cobaltConeGrad)"
                stroke="#2F7BFF"
                strokeWidth="0.18"
                strokeDasharray="0.6 0.6"
                opacity={0.85}
              />
            )}

            {/* Median Trajectory Line */}
            <line
              x1={ox}
              y1={oy}
              x2={medianDrawX}
              y2={medianDrawY}
              stroke="#2F7BFF"
              strokeWidth="0.32"
              filter="url(#cobaltGlowFilter)"
            />

            {/* Chosen Week 2 Decision Node */}
            {easedConeT > 0.45 && (
              <g transform={`translate(${cx}, ${cy})`}>
                {/* Glowing Outer Dot */}
                <circle r="0.95" fill="#D4FF24" filter="url(#limeGlowFilter)" />
                <circle r="0.35" fill="#0B0F1A" />

                {/* Thin Leader Line and Callout Badge */}
                <line x1="0" y1="0" x2="2.5" y2="-3.2" stroke="#D4FF24" strokeWidth="0.15" />
                <line x1="2.5" y1="-3.2" x2="11.5" y2="-3.2" stroke="#D4FF24" strokeWidth="0.15" />

                {/* Data Tag */}
                <rect
                  x="2.5"
                  y="-5.4"
                  width="12.0"
                  height="2.0"
                  fill="rgba(11, 15, 26, 0.94)"
                  stroke="#D4FF24"
                  strokeWidth="0.12"
                  rx="0.3"
                />
                <text
                  x="3.2"
                  y="-4.0"
                  fill="#D4FF24"
                  fontSize="0.95"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                >
                  RECOM: WAIT +2W
                </text>

                {/* Expected & P90 Subtitle */}
                <text
                  x="2.5"
                  y="-1.8"
                  fill="#F4F7FB"
                  fontSize="0.82"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  {fmtRate(expectedCost)} · P90 {fmtRate(p90Cost)}
                </text>
              </g>
            )}

            {/* "Synthetic data demo" Label */}
            {easedConeT > 0.6 && (
              <text
                x={ox + 0.5}
                y={oy + 2.5}
                fill="#A3ADBF"
                fontSize="0.8"
                fontFamily="JetBrains Mono, monospace"
                opacity={0.85}
              >
                Synthetic data demo · Forward Quantiles
              </text>
            )}
          </g>
        )}

        {/* ========================================================= */}
        {/* BEAT 4: WATERLINE DRAFT LIMIT LINE DRAWN ALONG BULK HULL  */}
        {/* ========================================================= */}
        {isBeat4 && (
          <g className="transition-opacity duration-300" style={{ opacity: Math.min(1.0, beatProgress * 3.5) }}>
            {/* Waterline Draft Line */}
            <line
              x1={waterlineDraft.xStart}
              y1={waterlineDraft.yStart}
              x2={draftCurrentXEnd}
              y2={draftCurrentYEnd}
              stroke="#D4FF24"
              strokeWidth="0.3"
              filter="url(#limeGlowFilter)"
            />

            {/* Leader Line and "Port draft limit" Badge */}
            {draftDrawT > 0.4 && (
              <g transform={`translate(${waterlineDraft.labelX}, ${waterlineDraft.labelY})`}>
                <line x1="0" y1="-3.2" x2="1.8" y2="0" stroke="#D4FF24" strokeWidth="0.15" />
                <line x1="1.8" y1="0" x2="16.5" y2="0" stroke="#D4FF24" strokeWidth="0.15" />

                <rect
                  x="1.8"
                  y="0.3"
                  width="16.8"
                  height="2.4"
                  fill="rgba(11, 15, 26, 0.94)"
                  stroke="#D4FF24"
                  strokeWidth="0.14"
                  rx="0.35"
                />
                <text
                  x="2.6"
                  y="1.95"
                  fill="#D4FF24"
                  fontSize="0.95"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                >
                  Port draft limit: 16.5m
                </text>
                <text
                  x="1.8"
                  y="4.2"
                  fill="#8DB4F5"
                  fontSize="0.8"
                  fontFamily="Inter, sans-serif"
                >
                  Paradip bulk terminal envelope · Cape compliant
                </text>
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};

export default PortDataOverlays;
