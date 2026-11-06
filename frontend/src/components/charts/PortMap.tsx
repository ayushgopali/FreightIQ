import React from 'react';
import { PortName, ShipFeasibility, Origin } from '../../types';

interface PortMapProps {
  selectedPort: PortName;
  onSelectPort: (port: PortName) => void;
  feasibilityByPort?: Record<string, ShipFeasibility>;
  activeShipClass?: string;
  origin?: Origin;
}

interface PortGeo {
  name: PortName;
  lat: number;
  lon: number;
  state: string;
}

const PORTS_GEO: PortGeo[] = [
  { name: 'Haldia', lat: 22.0256, lon: 88.0863, state: 'West Bengal' },
  { name: 'Sagar-Sandheads', lat: 21.6500, lon: 88.0500, state: 'West Bengal' },
  { name: 'Dhamra', lat: 20.8033, lon: 86.9739, state: 'Odisha' },
  { name: 'Paradip', lat: 20.2644, lon: 86.6698, state: 'Odisha' },
  { name: 'Gopalpur', lat: 19.3039, lon: 84.9669, state: 'Odisha' },
  { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, state: 'Andhra Pradesh' },
  { name: 'Gangavaram', lat: 17.6186, lon: 83.2384, state: 'Andhra Pradesh' },
];

export const PortMap: React.FC<PortMapProps> = ({
  selectedPort,
  onSelectPort,
  feasibilityByPort = {},
  activeShipClass = 'Capesize',
  origin = 'South Africa',
}) => {
  // Geo bounding box for East Coast of India & Bay of Bengal Littoral Zone (Lat 16 to 23, Lon 81.5 to 89.5)
  const minLat = 16.0;
  const maxLat = 23.2;
  const minLon = 81.5;
  const maxLon = 89.5;

  const width = 440;
  const height = 380;
  const padding = 35;

  const getX = (lon: number) => padding + ((lon - minLon) / (maxLon - minLon)) * (width - 2 * padding);
  const getY = (lat: number) => height - padding - ((lat - minLat) / (maxLat - minLat)) * (height - 2 * padding);

  const selectedGeo = PORTS_GEO.find((p) => p.name === selectedPort) || PORTS_GEO[3];
  const destX = getX(selectedGeo.lon);
  const destY = getY(selectedGeo.lat);

  // Determine origin entry vector into Bay of Bengal
  let originEntryX = getX(82.0);
  let originEntryY = getY(16.2);
  let originLabel = 'FROM RICHARDS BAY (RBCT) via S.W. APPROACH';

  if (origin === 'Australia') {
    originEntryX = getX(86.5);
    originEntryY = getY(16.0);
    originLabel = 'FROM HAY POINT / GLADSTONE via SOUTHERN CORRIDOR';
  } else if (origin === 'Indonesia') {
    originEntryX = getX(89.2);
    originEntryY = getY(16.5);
    originLabel = 'FROM TABONEO via MALACCA STRAIT';
  }

  // Mid-point of route arc for ship waypoint
  const midX = (originEntryX + destX) / 2 + (origin === 'South Africa' ? 25 : origin === 'Australia' ? -15 : -25);
  const midY = (originEntryY + destY) / 2 + 15;

  return (
    <div className="relative w-full terminal-card p-3 font-mono select-none overflow-hidden">
      {/* Header telemetry */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-[10px]">
        <div>
          <span className="font-bold text-white uppercase tracking-wider">MARITIME RADAR & BERTH ENVELOPE</span>
          <span className="text-[#E08E39] ml-2 hidden sm:inline">[BAY OF BENGAL GRID]</span>
        </div>
        <div className="flex items-center space-x-3 text-[9px]">
          <span className="flex items-center gap-1 text-[#22C55E] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> FULL
          </span>
          <span className="flex items-center gap-1 text-[#E08E39] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E08E39]"></span> PART
          </span>
          <span className="flex items-center gap-1 text-[#EF4444] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span> BLOCKED
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto mt-1">
        <defs>
          {/* Glowing shipping route stroke gradient (Warm Amber & Copper) */}
          <linearGradient id="routeGlow" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#C77726" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#E08E39" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="1.0" />
          </linearGradient>
        </defs>

        {/* Lat/Lon Coordinate Grid Lines */}
        {[18, 20, 22].map((lat) => (
          <g key={lat}>
            <line x1={padding} y1={getY(lat)} x2={width - padding} y2={getY(lat)} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="2 2" strokeWidth="0.8" />
            <text x={padding - 5} y={getY(lat) + 3} textAnchor="end" className="text-[8px] font-mono fill-[#526071]">
              {lat}°N
            </text>
          </g>
        ))}
        {[83, 85, 87].map((lon) => (
          <g key={lon}>
            <line x1={getX(lon)} y1={padding} x2={getX(lon)} y2={height - padding} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="2 2" strokeWidth="0.8" />
            <text x={getX(lon)} y={height - padding + 12} textAnchor="middle" className="text-[8px] font-mono fill-[#526071]">
              {lon}°E
            </text>
          </g>
        ))}

        {/* Indian East Coast Littoral Baseline */}
        <path
          d={`M ${getX(82.0)},${getY(16.0)} Q ${getX(83.8)},${getY(18.2)} ${getX(86.2)},${getY(20.0)} T ${getX(88.4)},${getY(22.6)}`}
          fill="none"
          stroke="#3D4B60"
          strokeWidth="2.5"
        />

        {/* Inland Shading (Hinterland Indicator) */}
        <path
          d={`M ${getX(81.5)},${getY(16.0)} L ${getX(82.0)},${getY(16.0)} Q ${getX(83.8)},${getY(18.2)} ${getX(86.2)},${getY(20.0)} T ${getX(88.4)},${getY(22.6)} L ${getX(88.4)},${getY(23.2)} L ${getX(81.5)},${getY(23.2)} Z`}
          fill="#111827"
          opacity="0.35"
        />

        {/* Bathymetric Basin Text */}
        <text
          x={getX(86.2)}
          y={getY(18.0)}
          className="text-[11px] font-mono uppercase tracking-[0.25em] fill-white/[0.08] font-bold select-none"
        >
          BAY OF BENGAL
        </text>

        {/* Shipping Route Arc from Coal Basin to Discharge Port */}
        <path
          d={`M ${originEntryX},${originEntryY} Q ${midX},${midY} ${destX},${destY}`}
          fill="none"
          stroke="url(#routeGlow)"
          strokeWidth="2.8"
          strokeDasharray="5 2.5"
        />

        {/* Route Entry Vector Pulse */}
        <circle cx={originEntryX} cy={originEntryY} r="3.5" fill="#E08E39" />
        <text
          x={originEntryX + 6}
          y={originEntryY + 3}
          className="text-[8px] font-mono fill-[#E08E39] font-bold"
        >
          {origin.toUpperCase()} ROUTE INBOUND
        </text>

        {/* In-Transit Steaming Vessel Waypoint (Nav Dashboard style) */}
        <g transform={`translate(${midX}, ${midY})`}>
          <circle r="7" fill="#101418" stroke="#E08E39" strokeWidth="1.5" />
          <polygon points="-3,-2 3,0 -3,2" fill="#E08E39" />

          {/* Telemetry Tooltip on Waypoint */}
          <rect x="9" y="-14" width="140" height="25" rx="4" fill="#141920" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <text x="14" y="-3" className="text-[8px] font-mono fill-white font-bold">
            MV EN ROUTE · 12.5 KTS
          </text>
          <text x="14" y="7" className="text-[7.5px] font-mono fill-[#E08E39]">
            ETA DISCHARGE: INBOUND
          </text>
        </g>

        {/* Port Facility Nodes */}
        {PORTS_GEO.map((p) => {
          const x = getX(p.lon);
          const y = getY(p.lat);
          const isSelected = p.name === selectedPort;
          const feas = feasibilityByPort[p.name];
          let statusColor = '#38BDF8';
          if (feas) {
            if (feas.status === 'Full') statusColor = '#22C55E';
            else if (feas.status === 'Part-load') statusColor = '#E08E39';
            else if (feas.status === 'Blocked') statusColor = '#EF4444';
          }

          return (
            <g
              key={p.name}
              className="cursor-pointer group"
              onClick={() => onSelectPort(p.name)}
            >
              {/* Target Scope Ring for Selected Port */}
              {isSelected && (
                <>
                  <rect x={x - 9} y={y - 9} width="18" height="18" rx="3" fill="none" stroke="#E08E39" strokeWidth="1.2" strokeDasharray="2 2" />
                  <line x1={x - 14} y1={y} x2={x + 14} y2={y} stroke="#E08E39" strokeWidth="0.8" opacity="0.6" />
                  <line x1={x} y1={y - 14} x2={x} y2={y + 14} stroke="#E08E39" strokeWidth="0.8" opacity="0.6" />
                </>
              )}

              {/* Port Rectangular Marker */}
              <rect
                x={x - 4}
                y={y - 4}
                width={8}
                height={8}
                rx="2"
                fill={statusColor}
                stroke="#101418"
                strokeWidth="1.5"
              />

              {/* Port Label with Feasibility Badge */}
              <text
                x={x + 9}
                y={y + 3}
                className={`text-[9.5px] font-mono transition-all ${
                  isSelected ? 'fill-white font-bold text-[10px]' : 'fill-[#8A96A6] group-hover:fill-white'
                }`}
              >
                {p.name.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Bottom Telemetry Strip */}
      <div className="mt-1 pt-1.5 border-t border-white/[0.06] text-[9px] text-[#8A96A6] flex flex-wrap justify-between font-mono gap-1">
        <span>DESTINATION: <strong className="text-[#E08E39]">{selectedPort.toUpperCase()}</strong></span>
        <span>EVALUATED: <strong className="text-white">{activeShipClass.toUpperCase()}</strong></span>
        <span className="text-[#E08E39]">{originLabel}</span>
      </div>
    </div>
  );
};

