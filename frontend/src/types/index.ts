export type ShipClass = "Handysize" | "Supramax" | "Panamax" | "Capesize";
export type Origin = "Indonesia" | "South Africa" | "Australia";
export type PortName = "Paradip" | "Visakhapatnam" | "Gangavaram" | "Gopalpur" | "Dhamra" | "Sagar-Sandheads" | "Haldia";

export interface PortDetail {
  name: PortName;
  max_loa: number;
  max_beam: number;
  max_draft: number;
  discharge_tpd: number;
  base_wait_days: number;
  verified: boolean;
  source: string;
  lat?: number;
  lon?: number;
  state?: string;
}

export interface ShipFeasibility {
  ship: ShipClass;
  dwt: number;
  feasible: boolean;
  status: "Full" | "Part-load" | "Blocked";
  utilisation: number;
  usable_load: number;
  voyages: number;
  reason: string;
}

export interface PortFeasibilityResponse {
  port: PortDetail;
  cargo_t: number;
  ships: ShipFeasibility[];
}

export interface PortsMatrixResponse {
  cargo_t: number;
  matrix: Record<string, Record<ShipClass, ShipFeasibility>>;
}

export interface HistoryPoint {
  date: string;
  rate: number;
}

export interface ForecastHorizonPoint {
  horizon_weeks: number;
  target_date: string;
  p10: number;
  p50: number;
  p90: number;
}

export interface ForecastResponse {
  origin: Origin;
  ship_class: ShipClass;
  asof_date: string;
  current_rate: number;
  history: HistoryPoint[];
  forecast: ForecastHorizonPoint[];
  is_fallback: boolean;
  data_source: string;
}

export interface DecisionOption {
  ship: ShipClass;
  wait_weeks: number;
  freight_pt: number;
  demurrage_pt: number;
  waiting_pt: number;
  expected_pt: number;
  worst_pt: number;
  score: number;
  voyages: number;
  load: number;
}

export interface DecisionDrivers {
  mom4_pct: number;
  dev52_pct: number;
  forecast_median_chg_pct: number;
  congestion_pct: number;
  wait_days: number;
}

export interface DecisionResponse {
  feasible: boolean;
  action: string;
  reason?: string;
  recommended_ship?: ShipClass;
  recommended_wait_weeks?: number;
  expected_pt?: number;
  worst_pt?: number;
  expected_saving_pt?: number;
  expected_saving_total?: number;
  worst_delta_pt?: number;
  book_now_expected_pt?: number;
  book_now_worst_pt?: number;
  wait_days?: number;
  drivers?: DecisionDrivers;
  options: DecisionOption[];
  screened: ShipFeasibility[];
  data_source: string;
  asof_date: string;
}

export interface DecisionRequest {
  origin: Origin;
  port_name: PortName;
  cargo_t: number;
  window_weeks: number;
  wait_cost_pt_week: number;
  risk_aversion: number;
  margin_pct: number;
  dem_mult: number;
  asof_date?: string;
}

export interface ReplayRequest {
  asof_date: string;
  origin: Origin;
  port_name: PortName;
  cargo_t: number;
  window_weeks: number;
  wait_cost_pt_week: number;
  risk_aversion: number;
  margin_pct: number;
  dem_mult: number;
}

export interface ReplayResponse {
  decision: DecisionResponse;
  actual_cost_book_now_pt: number;
  actual_cost_following_advice_pt: number;
  realised_saving_pt: number;
  realised_saving_total: number;
  history_series?: HistoryPoint[];
  actual_future_series: HistoryPoint[];
  is_win: boolean;
  preset_info?: string;
}

export interface SensitivityRow {
  wait_cost_pt_wk: number;
  margin_pct: number;
  saving_pct: number;
  saving_pt: number;
  win: number;
  loss: number;
  waited: number;
  p5: number;
}

export interface DecisionLogItem {
  date: string;
  port: string;
  origin: string;
  iq_ship: string;
  iq_wait: number;
  base_ship: string;
  cost_iq: number;
  cost_base: number;
  naive_ship: string;
  naive_violation: boolean;
  pred_worst: number;
  saving_pt: number;
}

export interface BacktestSummaryResponse {
  data_source: string;
  n_decisions: number;
  cargo_t: number;
  window_weeks: number;
  test_period: [string, string];
  mean_cost_base_pt: number;
  mean_cost_iq_pt: number;
  mean_saving_pt: number;
  saving_pct: number;
  win_rate_pct: number;
  loss_rate_pct: number;
  waited_pct: number;
  avg_saving_total_usd: number;
  worst_decile_saving_pt: number;
  p5_cost_diff_pt: number;
  port_violations_iq: number;
  port_violations_naive: number;
  naive_violation_pct: number;
  mae_model_vs_naive_by_h: Record<string, [number, number]>;
  mae_improvement_pct: number;
  coverage80_by_h: Record<string, number>;
  coverage80_overall: number;
  by_port: Record<string, number>;
  by_origin: Record<string, number>;
  sensitivity: SensitivityRow[];
  recent_decisions: DecisionLogItem[];
}

export interface MetadataResponse {
  origins: Origin[];
  ship_classes: ShipClass[];
  ports: PortName[];
  data_source: string;
  latest_date: string;
  available_dates: string[];
  horizons: number;
  demo_presets: Array<{
    id: string;
    date: string;
    origin: Origin;
    port: PortName;
    title: string;
    type: "win" | "loss";
  }>;
}
