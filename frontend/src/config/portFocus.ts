/**
 * Port Night Image Focal Points, Camera Keyframes & Overlay Alignment
 * All coordinates are defined as percentages [0..100] from the top-left of the canvas.
 */

export interface CameraKeyframe {
  beat: number;
  pStart: number;
  pEnd: number;
  label: string;
  focus: [number, number]; // [x, y] in %
  focusEnd?: [number, number]; // Optional drift end [x, y] in %
  zoom: number;
  brightnessStart?: number;
  brightnessEnd?: number;
}

export const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  // Beat 0, p 0 to 0.12: focus (50,50), zoom 1.0, brightness fades from 0 to 0.35
  {
    beat: 0,
    pStart: 0.0,
    pEnd: 0.12,
    label: 'Darkness to Exposure',
    focus: [50, 50],
    zoom: 1.0,
    brightnessStart: 0.05,
    brightnessEnd: 0.35,
  },
  // Beat 1, p 0.12 to 0.30: focus (50,50), zoom 1.0, brightness 1
  {
    beat: 1,
    pStart: 0.12,
    pEnd: 0.30,
    label: 'Wide Establishing View',
    focus: [50, 50],
    zoom: 1.0,
    brightnessStart: 1.0,
    brightnessEnd: 1.0,
  },
  // Beat 2, p 0.30 to 0.48: focus (56,64), zoom 1.5 (bulk carrier and cranes)
  {
    beat: 2,
    pStart: 0.30,
    pEnd: 0.48,
    label: 'Capesize Bulk Carrier & Cranes',
    focus: [56, 64],
    zoom: 1.5,
    brightnessStart: 1.0,
    brightnessEnd: 1.0,
  },
  // Beat 3, p 0.48 to 0.66: focus (18,18), zoom 1.6 (moon and lighthouse beam)
  {
    beat: 3,
    pStart: 0.48,
    pEnd: 0.66,
    label: 'Moon & Lighthouse',
    focus: [18, 18],
    zoom: 1.6,
    brightnessStart: 1.0,
    brightnessEnd: 1.0,
  },
  // Beat 4, p 0.66 to 0.84: focus drifts along quay (50,62) to (68,66), zoom 1.4
  {
    beat: 4,
    pStart: 0.66,
    pEnd: 0.84,
    label: 'Quayside Operations Drift',
    focus: [50, 62],
    focusEnd: [68, 66],
    zoom: 1.4,
    brightnessStart: 1.0,
    brightnessEnd: 1.0,
  },
  // Beat 5, p 0.84 to 1.0: focus (82,46), zoom 1.4 (yard, gate, train)
  {
    beat: 5,
    pStart: 0.84,
    pEnd: 1.0,
    label: 'Intermodal Yard, Gate & Rail',
    focus: [82, 46],
    zoom: 1.4,
    brightnessStart: 1.0,
    brightnessEnd: 1.0,
  },
];

/**
 * Water basin polygon boundary (in percentage coordinates)
 * Used to restrict wave displacement and water reflection shimmer strictly to the water area.
 */
export const WATER_POLYGON_PCT: Array<[number, number]> = [
  [0, 42],
  [18, 42],
  [28, 38],
  [38, 46],
  [44, 53],
  [58, 62],
  [72, 75],
  [88, 88],
  [95, 96],
  [100, 100],
  [0, 100],
];

/**
 * Precise alignment coordinates for Data Overlays
 */
export const OVERLAY_COORDINATES = {
  // Beat 2: Forecast Cone in water basin directly in front of bulk carrier
  forecastCone: {
    origin: [18.0, 75.0] as [number, number],
    topFinal: [42.0, 68.0] as [number, number],
    medianFinal: [40.0, 76.0] as [number, number],
    bottomFinal: [36.0, 85.0] as [number, number],
    chosenWeekNode: [29.0, 75.5] as [number, number], // Week +2 node
  },
  // Beat 4: Bulk carrier waterline draft limit
  waterlineDraft: {
    xStart: 45.0,
    xEnd: 74.0,
    yStart: 56.0,
    yEnd: 78.5,
    labelX: 58.0,
    labelY: 70.0,
  },
  // Lighthouse beam origin
  lighthouse: {
    x: 9.7,
    y: 31.0,
  },
  // Tugboat wake
  tugWake: {
    x: 10.0,
    y: 72.0,
  },
};
