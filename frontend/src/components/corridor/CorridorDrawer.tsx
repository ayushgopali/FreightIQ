import React from 'react';
import { Origin, PortName, ShipClass } from '../../types';

export interface CorridorRoute {
  id: string;
  code: string;
  origin: Origin;
  port: PortName;
  shipClass: ShipClass;
  cargoT: number;
  spotRate: number;
  trendPct: number;
  sparkline: number[];
  distanceNm: number;
  steamingDays: number;
}

export const CORRIDOR_PRESETS: CorridorRoute[] = [
  {
    id: 'rbct-pdp',
    code: 'RBCT-1',
    origin: 'South Africa',
    port: 'Paradip',
    shipClass: 'Capesize',
    cargoT: 150000,
    spotRate: 14.20,
    trendPct: -2.4,
    sparkline: [15.1, 14.8, 14.9, 14.5, 14.3, 14.2],
    distanceNm: 4280,
    steamingDays: 14.3,
  },
  {
    id: 'hay-viz',
    code: 'HAY-1',
    origin: 'Australia',
    port: 'Visakhapatnam',
    shipClass: 'Capesize',
    cargoT: 150000,
    spotRate: 12.80,
    trendPct: +1.6,
    sparkline: [12.2, 12.3, 12.5, 12.4, 12.7, 12.8],
    distanceNm: 4790,
    steamingDays: 16.0,
  },
  {
    id: 'tab-hld',
    code: 'TAB-1',
    origin: 'Indonesia',
    port: 'Haldia',
    shipClass: 'Supramax',
    cargoT: 55000,
    spotRate: 9.40,
    trendPct: 0.0,
    sparkline: [9.3, 9.5, 9.4, 9.4, 9.3, 9.4],
    distanceNm: 2140,
    steamingDays: 7.1,
  },
  {
    id: 'new-gng',
    code: 'NEW-1',
    origin: 'Australia',
    port: 'Gangavaram',
    shipClass: 'Panamax',
    cargoT: 75000,
    spotRate: 13.50,
    trendPct: -1.8,
    sparkline: [14.1, 13.9, 13.8, 13.6, 13.7, 13.5],
    distanceNm: 4720,
    steamingDays: 15.7,
  },
  {
    id: 'rbct-dhm',
    code: 'RBCT-2',
    origin: 'South Africa',
    port: 'Dhamra',
    shipClass: 'Capesize',
    cargoT: 160000,
    spotRate: 14.10,
    trendPct: -2.1,
    sparkline: [14.9, 14.7, 14.5, 14.4, 14.2, 14.1],
    distanceNm: 4310,
    steamingDays: 14.4,
  },
  {
    id: 'tab-gop',
    code: 'TAB-2',
    origin: 'Indonesia',
    port: 'Gopalpur',
    shipClass: 'Supramax',
    cargoT: 50000,
    spotRate: 9.10,
    trendPct: +0.8,
    sparkline: [8.9, 9.0, 9.0, 9.1, 9.0, 9.1],
    distanceNm: 2110,
    steamingDays: 7.0,
  },
];

interface CorridorDrawerProps {
  currentOrigin: Origin;
  currentPort: PortName;
  currentShipClass: ShipClass;
  onSelectRoute: (route: CorridorRoute) => void;
}

export const CorridorDrawer: React.FC<CorridorDrawerProps> = ({
  currentOrigin,
  currentPort,
  currentShipClass,
  onSelectRoute,
}) => {
  return (
    <div className="w-full font-mono select-none">
      <div className="flex items-center justify-between pb-2 text-[10px] text-[#828E9E] border-b border-[#2B3544] mb-2">
        <span className="font-bold uppercase tracking-wider text-white">COAL TRADE CORRIDORS</span>
        <span>SPOT RATES & TREND</span>
      </div>

      <div className="space-y-1.5">
        {CORRIDOR_PRESETS.map((route) => {
          const isSelected =
            currentOrigin === route.origin &&
            currentPort === route.port &&
            currentShipClass === route.shipClass;

            // Render miniature SVG sparkline with translucent area gradient
            const minRate = Math.min(...route.sparkline);
            const maxRate = Math.max(...route.sparkline);
            const range = maxRate - minRate || 1;
            const svgW = 60;
            const svgH = 22;
            const pts = route.sparkline.map((val, idx) => {
              const x = (idx / (route.sparkline.length - 1)) * svgW;
              const y = svgH - ((val - minRate) / range) * (svgH - 6) - 3;
              return { x, y, str: `${x.toFixed(1)},${y.toFixed(1)}` };
            });
            const polylinePoints = pts.map(p => p.str).join(' ');
            const polygonPoints = `0,${svgH} ${polylinePoints} ${svgW},${svgH}`;

            const isPositive = route.trendPct > 0;
            const isNegative = route.trendPct < 0;

            return (
              <div
                key={route.id}
                onClick={() => onSelectRoute(route)}
                className={`p-2.5 rounded-md border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#E08E39]/15 via-[#18202A] to-[#12171E] border-[#E08E39]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_16px_rgba(224,142,57,0.18)]'
                    : 'bg-[#141920]/80 border-white/[0.06] hover:border-white/[0.14] hover:bg-[#18202A]/90'
                }`}
              >
                <div className="flex items-center justify-between pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded border ${
                      isSelected
                        ? 'bg-[#E08E39]/20 text-[#E08E39] border-[#E08E39]/40'
                        : 'bg-[#182028] text-[#8A96A6] border-white/5'
                    }`}>
                      {route.code}
                    </span>
                    <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-[#E08E39]' : 'text-white'}`}>
                      {route.origin} ➔ {route.port}
                    </span>
                  </div>
                  <span className="text-[9px] text-[#8A96A6] font-mono">
                    {route.shipClass}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <div>
                    <span className="text-xs font-bold text-white num-mono">
                      ${route.spotRate.toFixed(2)}
                    </span>
                    <span className="text-[9.5px] text-[#8A96A6] ml-1">/t</span>
                    <span className={`ml-1.5 text-[10px] font-bold ${
                      isNegative
                        ? 'text-[#22C55E]' // Freight drop is favorable for importer!
                        : isPositive
                        ? 'text-[#EF4444]'
                        : 'text-[#8A96A6]'
                    }`}>
                      {route.trendPct > 0 ? '+' : ''}{route.trendPct.toFixed(1)}%
                    </span>
                  </div>

                  {/* Sparkline with Translucent Area Fill */}
                  <svg width={svgW} height={svgH} className="overflow-visible">
                    <defs>
                      <linearGradient id={`sparkGrad-${route.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E08E39" stopOpacity={isSelected ? "0.45" : "0.22"} />
                        <stop offset="100%" stopColor="#E08E39" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points={polygonPoints}
                      fill={`url(#sparkGrad-${route.id})`}
                    />
                    <polyline
                      fill="none"
                      stroke={isSelected ? '#E08E39' : '#8A96A6'}
                      strokeWidth="1.5"
                      points={polylinePoints}
                    />
                    <circle
                      cx={pts[pts.length - 1].x}
                      cy={pts[pts.length - 1].y}
                      r="2"
                      fill={isSelected ? '#E08E39' : '#8A96A6'}
                      stroke="#101418"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
