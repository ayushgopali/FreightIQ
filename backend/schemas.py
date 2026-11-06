"""Pydantic schemas for the FreightIQ API."""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class PortDetail(BaseModel):
    name: str
    max_loa: float
    max_beam: float
    max_draft: float
    discharge_tpd: float
    base_wait_days: float
    verified: bool
    source: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    state: Optional[str] = None


class ShipFeasibility(BaseModel):
    ship: str
    dwt: float
    feasible: bool
    status: str  # "Full", "Part-load", "Blocked"
    utilisation: float
    usable_load: float
    voyages: int
    reason: str


class PortFeasibilityResponse(BaseModel):
    port: PortDetail
    cargo_t: float
    ships: List[ShipFeasibility]


class PortsMatrixResponse(BaseModel):
    cargo_t: float
    matrix: Dict[str, Dict[str, ShipFeasibility]]


class HistoryPoint(BaseModel):
    date: str
    rate: float


class ForecastHorizonPoint(BaseModel):
    horizon_weeks: int
    target_date: str
    p10: float
    p50: float
    p90: float


class ForecastRequest(BaseModel):
    origin: str
    ship_class: str
    asof_date: Optional[str] = None


class ForecastResponse(BaseModel):
    origin: str
    ship_class: str
    asof_date: str
    current_rate: float
    history: List[HistoryPoint]
    forecast: List[ForecastHorizonPoint]
    is_fallback: bool
    data_source: str


class DecisionRequest(BaseModel):
    origin: str = "South Africa"
    port_name: str = "Paradip"
    cargo_t: float = Field(default=150000.0, ge=1000.0, le=1000000.0)
    window_weeks: int = Field(default=6, ge=0, le=8)
    wait_cost_pt_week: float = Field(default=0.05, ge=0.0, le=2.0)
    risk_aversion: float = Field(default=0.3, ge=0.0, le=1.0)
    margin_pct: float = Field(default=1.0, ge=0.0, le=10.0)
    dem_mult: float = Field(default=1.0, ge=0.1, le=5.0)
    asof_date: Optional[str] = None


class DecisionOption(BaseModel):
    ship: str
    wait_weeks: int
    freight_pt: float
    demurrage_pt: float
    waiting_pt: float
    expected_pt: float
    worst_pt: float
    score: float
    voyages: int
    load: float


class DecisionDrivers(BaseModel):
    mom4_pct: float
    dev52_pct: float
    forecast_median_chg_pct: float
    congestion_pct: float
    wait_days: float


class DecisionResponse(BaseModel):
    feasible: bool
    action: str  # "BOOK NOW" or "WAIT k WEEK(S)"
    reason: Optional[str] = None
    recommended_ship: Optional[str] = None
    recommended_wait_weeks: Optional[int] = None
    expected_pt: Optional[float] = None
    worst_pt: Optional[float] = None
    expected_saving_pt: Optional[float] = None
    expected_saving_total: Optional[float] = None
    worst_delta_pt: Optional[float] = None
    book_now_expected_pt: Optional[float] = None
    book_now_worst_pt: Optional[float] = None
    wait_days: Optional[float] = None
    drivers: Optional[DecisionDrivers] = None
    options: List[DecisionOption] = []
    screened: List[ShipFeasibility] = []
    data_source: str
    asof_date: str


class ReplayRequest(BaseModel):
    asof_date: str
    origin: str = "Australia"
    port_name: str = "Paradip"
    cargo_t: float = 150000.0
    window_weeks: int = 6
    wait_cost_pt_week: float = 0.05
    risk_aversion: float = 0.3
    margin_pct: float = 1.0
    dem_mult: float = 1.0


class ReplayResponse(BaseModel):
    decision: DecisionResponse
    actual_cost_book_now_pt: float
    actual_cost_following_advice_pt: float
    realised_saving_pt: float
    realised_saving_total: float
    history_series: List[HistoryPoint] = []
    actual_future_series: List[HistoryPoint]
    is_win: bool
    preset_info: Optional[str] = None


class SensitivityRow(BaseModel):
    wait_cost_pt_wk: float
    margin_pct: float
    saving_pct: float
    saving_pt: float
    win: float
    loss: float
    waited: float
    p5: float


class DecisionLogItem(BaseModel):
    date: str
    port: str
    origin: str
    iq_ship: str
    iq_wait: int
    base_ship: str
    cost_iq: float
    cost_base: float
    naive_ship: str
    naive_violation: bool
    pred_worst: float
    saving_pt: float


class BacktestSummaryResponse(BaseModel):
    data_source: str
    n_decisions: int
    cargo_t: float
    window_weeks: int
    test_period: List[str]
    mean_cost_base_pt: float
    mean_cost_iq_pt: float
    mean_saving_pt: float
    saving_pct: float
    win_rate_pct: float
    loss_rate_pct: float
    waited_pct: float
    avg_saving_total_usd: float
    worst_decile_saving_pt: float
    p5_cost_diff_pt: float
    port_violations_iq: int
    port_violations_naive: int
    naive_violation_pct: float
    mae_model_vs_naive_by_h: Dict[str, List[float]]
    mae_improvement_pct: float
    coverage80_by_h: Dict[str, float]
    coverage80_overall: float
    by_port: Dict[str, float]
    by_origin: Dict[str, float]
    sensitivity: List[SensitivityRow]
    recent_decisions: List[DecisionLogItem]


class MetadataResponse(BaseModel):
    origins: List[str]
    ship_classes: List[str]
    ports: List[str]
    data_source: str
    latest_date: str
    available_dates: List[str]
    horizons: int
    demo_presets: List[Dict[str, str]]
