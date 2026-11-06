"""Core service layer bridging FreightIQ analytical models with FastAPI."""
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd

from freightiq.config import SHIPS, HORIZONS, ORIGINS, CLASSES, RESULTS_DIR
from freightiq.datagen import load_market
from freightiq.forecast import build_features, Forecaster
from freightiq.ports import load_ports, screen, screen_all
from freightiq.decision import evaluate
from backend.schemas import (
    PortDetail, ShipFeasibility, PortFeasibilityResponse, PortsMatrixResponse,
    HistoryPoint, ForecastHorizonPoint, ForecastResponse,
    DecisionRequest, DecisionResponse, DecisionOption, DecisionDrivers,
    ReplayRequest, ReplayResponse,
    BacktestSummaryResponse, SensitivityRow, DecisionLogItem,
    MetadataResponse
)

# Global in-memory cache
_MARKET_CACHE = None
_FEAT_CACHE = None
_MODEL_CACHE: Dict[str, Forecaster] = {}
_PORTS_CACHE = None


def get_market_and_features():
    global _MARKET_CACHE, _FEAT_CACHE
    if _MARKET_CACHE is None or _FEAT_CACHE is None:
        _MARKET_CACHE = load_market()
        _FEAT_CACHE = build_features(_MARKET_CACHE)
    return _MARKET_CACHE, _FEAT_CACHE


def get_ports_dict() -> Dict[str, dict]:
    global _PORTS_CACHE
    if _PORTS_CACHE is None:
        _PORTS_CACHE = load_ports()
    return _PORTS_CACHE


def get_walkforward_checkpoint(asof_ts: pd.Timestamp) -> pd.Timestamp:
    market, _ = get_market_and_features()
    dates = list(market["rates"].index)
    start = int(len(dates) * 0.55)
    retrain_every = 26
    checkpoints = [dates[i] for i in range(start, len(dates) - HORIZONS - 1, retrain_every)]
    valid = [c for c in checkpoints if c <= asof_ts]
    return valid[-1] if valid else asof_ts


def get_trained_model(asof_str: str) -> Forecaster:
    global _MODEL_CACHE
    asof_ts = pd.Timestamp(asof_str)
    ckpt = get_walkforward_checkpoint(asof_ts)
    ckpt_key = str(ckpt.date())
    if ckpt_key not in _MODEL_CACHE:
        _, feat = get_market_and_features()
        forecaster = Forecaster().fit(feat, ckpt)
        _MODEL_CACHE[ckpt_key] = forecaster
    return _MODEL_CACHE[ckpt_key]


def get_system_metadata() -> MetadataResponse:
    market, feat = get_market_and_features()
    ports = get_ports_dict()
    latest_ts = feat["date"].max()
    all_dates = [str(d.date()) for d in sorted(market["rates"].index)]

    demo_presets = [
        {
            "id": "win_2023_08_27",
            "date": "2023-08-27",
            "origin": "Australia",
            "port": "Paradip",
            "title": "2023-08-27 — Demonstrated Win (+$2.94/t saving)",
            "type": "win"
        },
        {
            "id": "loss_2023_07_02",
            "date": "2023-07-02",
            "origin": "Australia",
            "port": "Visakhapatnam",
            "title": "2023-07-02 — Honest Loss (-$1.61/t)",
            "type": "loss"
        }
    ]

    return MetadataResponse(
        origins=ORIGINS,
        ship_classes=CLASSES,
        ports=list(ports.keys()),
        data_source=market["source"],
        latest_date=str(latest_ts.date()),
        available_dates=all_dates,
        horizons=HORIZONS,
        demo_presets=demo_presets
    )


def get_port_feasibility(port_name: str, cargo_t: float) -> PortFeasibilityResponse:
    ports = get_ports_dict()
    if port_name not in ports:
        raise ValueError(f"Unknown port: {port_name}")
    raw_p = ports[port_name]
    port_detail = PortDetail(
        name=port_name,
        max_loa=raw_p["max_loa"],
        max_beam=raw_p["max_beam"],
        max_draft=raw_p["max_draft"],
        discharge_tpd=raw_p["discharge_tpd"],
        base_wait_days=raw_p["base_wait_days"],
        verified=raw_p.get("verified", False),
        source=raw_p.get("source", "port_authority"),
        lat=raw_p.get("lat"),
        lon=raw_p.get("lon"),
        state=raw_p.get("state")
    )
    screened = screen_all(raw_p, cargo_t)
    ships = []
    for sc in screened:
        c = sc["ship"]
        sp = SHIPS[c]
        if not sc["feasible"]:
            status = "Blocked"
        elif sc["utilisation"] < 0.999:
            status = "Part-load"
        else:
            status = "Full"
        ships.append(ShipFeasibility(
            ship=c,
            dwt=float(sp["dwt"]),
            feasible=sc["feasible"],
            status=status,
            utilisation=float(sc["utilisation"]),
            usable_load=float(sc["usable_load"]),
            voyages=int(sc["voyages"]),
            reason=sc["reason"]
        ))
    return PortFeasibilityResponse(port=port_detail, cargo_t=cargo_t, ships=ships)


def get_ports_matrix(cargo_t: float) -> PortsMatrixResponse:
    ports = get_ports_dict()
    matrix = {}
    for p_name, p_data in ports.items():
        matrix[p_name] = {}
        for c in CLASSES:
            sp = SHIPS[c]
            sc = screen(c, p_data, cargo_t)
            if not sc["feasible"]:
                status = "Blocked"
            elif sc["utilisation"] < 0.999:
                status = "Part-load"
            else:
                status = "Full"
            matrix[p_name][c] = ShipFeasibility(
                ship=c,
                dwt=float(sp["dwt"]),
                feasible=sc["feasible"],
                status=status,
                utilisation=float(sc["utilisation"]),
                usable_load=float(sc["usable_load"]),
                voyages=int(sc["voyages"]),
                reason=sc["reason"]
            )
    return PortsMatrixResponse(cargo_t=cargo_t, matrix=matrix)


def get_forecast_series(origin: str, ship_class: str, asof_date: Optional[str] = None) -> ForecastResponse:
    market, feat = get_market_and_features()
    rates = market["rates"]
    latest_ts = feat["date"].max()
    asof = pd.Timestamp(asof_date) if asof_date else latest_ts

    model = get_trained_model(str(asof.date()))
    now_rows = feat[feat["date"] == asof]
    if now_rows.empty:
        raise ValueError(f"No market data recorded for date {asof.date()}")

    idx = {(r.origin, r.cls): i for i, r in enumerate(now_rows.itertuples())}
    preds = model.predict(now_rows)
    pred_quantiles = preds[idx[(origin, ship_class)]]  # [HORIZONS, 3]

    current_rate = float(rates.loc[asof, (origin, ship_class)])

    # Past 52 weeks history up to asof
    hist_series = rates[(origin, ship_class)].loc[:asof].iloc[-52:]
    history = [
        HistoryPoint(date=str(d.date()), rate=float(val))
        for d, val in hist_series.items()
    ]

    forecast_pts = []
    for h in range(1, HORIZONS + 1):
        target_date = asof + pd.Timedelta(weeks=h)
        q10, q50, q90 = pred_quantiles[h - 1]
        forecast_pts.append(ForecastHorizonPoint(
            horizon_weeks=h,
            target_date=str(target_date.date()),
            p10=round(float(q10), 3),
            p50=round(float(q50), 3),
            p90=round(float(q90), 3)
        ))

    is_fallback = any(model.fallback.values())

    return ForecastResponse(
        origin=origin,
        ship_class=ship_class,
        asof_date=str(asof.date()),
        current_rate=round(current_rate, 3),
        history=history,
        forecast=forecast_pts,
        is_fallback=is_fallback,
        data_source=market["source"]
    )


def run_chartering_decision(req: DecisionRequest) -> DecisionResponse:
    market, feat = get_market_and_features()
    rates, cong = market["rates"], market["congestion"]
    ports = get_ports_dict()

    if req.port_name not in ports:
        raise ValueError(f"Port '{req.port_name}' not found.")
    port = ports[req.port_name]

    latest_ts = feat["date"].max()
    today = pd.Timestamp(req.asof_date) if req.asof_date else latest_ts

    model = get_trained_model(str(today.date()))
    now_rows = feat[feat["date"] == today]
    if now_rows.empty:
        raise ValueError(f"No features available for date {today.date()}")

    idx = {(r.origin, r.cls): i for i, r in enumerate(now_rows.itertuples())}
    preds = model.predict(now_rows)

    fc = {c: preds[idx[(req.origin, c)]] for c in SHIPS}
    now = {c: float(rates.loc[today, (req.origin, c)]) for c in SHIPS}
    cz = float(cong.loc[today])

    res = evaluate(
        port=port,
        cargo_t=req.cargo_t,
        fc_by_class=fc,
        now_by_class=now,
        congestion_z=cz,
        window_weeks=req.window_weeks,
        wait_cost_pt_week=req.wait_cost_pt_week,
        risk_aversion=req.risk_aversion,
        margin_pct=req.margin_pct,
        dem_mult=req.dem_mult
    )

    screened_list = []
    for sc in res["screened"]:
        c = sc["ship"]
        sp = SHIPS[c]
        if not sc["feasible"]:
            status = "Blocked"
        elif sc["utilisation"] < 0.999:
            status = "Part-load"
        else:
            status = "Full"
        screened_list.append(ShipFeasibility(
            ship=c,
            dwt=float(sp["dwt"]),
            feasible=sc["feasible"],
            status=status,
            utilisation=float(sc["utilisation"]),
            usable_load=float(sc["usable_load"]),
            voyages=int(sc["voyages"]),
            reason=sc["reason"]
        ))

    if not res["feasible"]:
        return DecisionResponse(
            feasible=False,
            action="NO FEASIBLE VESSEL",
            reason=res.get("reason", "No ship class can physically dock at this port with the given cargo."),
            screened=screened_list,
            data_source=market["source"],
            asof_date=str(today.date())
        )

    b = res["best"]
    ref = res["book_now_same_ship"]
    best_now = res["best_now"]

    options_list = [
        DecisionOption(
            ship=o["ship"],
            wait_weeks=o["wait_weeks"],
            freight_pt=round(o["freight_pt"], 2),
            demurrage_pt=round(o["demurrage_pt"], 2),
            waiting_pt=round(o["waiting_pt"], 2),
            expected_pt=round(o["expected_pt"], 2),
            worst_pt=round(o["worst_pt"], 2),
            score=round(o["score"], 2),
            voyages=o["voyages"],
            load=round(o["load"], 0)
        )
        for o in res["options"]
    ]

    # Calculate explainability drivers
    s_row = now_rows[(now_rows.origin == req.origin) & (now_rows.cls == b["ship"])].iloc[0]
    k = max(b["wait_weeks"], 4)
    exp_chg = float((fc[b["ship"]][k - 1, 1] / now[b["ship"]] - 1) * 100)
    cong_pct = float((cong <= cz).mean() * 100)

    drivers = DecisionDrivers(
        mom4_pct=round(float(s_row.mom4 * 100), 2),
        dev52_pct=round(float(s_row.dev52 * 100), 2),
        forecast_median_chg_pct=round(exp_chg, 2),
        congestion_pct=round(cong_pct, 1),
        wait_days=round(float(res["wait_days"]), 2)
    )

    return DecisionResponse(
        feasible=True,
        action=res["action"],
        reason="Optimal chartering trade-off based on calibrated freight forecast, demurrage, and waiting cost.",
        recommended_ship=b["ship"],
        recommended_wait_weeks=b["wait_weeks"],
        expected_pt=round(b["expected_pt"], 2),
        worst_pt=round(b["worst_pt"], 2),
        expected_saving_pt=round(res["saving_pt"], 2),
        expected_saving_total=round(res["saving_total"], 0),
        worst_delta_pt=round(res["worst_delta_pt"], 2),
        book_now_expected_pt=round(ref["expected_pt"], 2),
        book_now_worst_pt=round(ref["worst_pt"], 2),
        wait_days=round(res["wait_days"], 2),
        drivers=drivers,
        options=options_list,
        screened=screened_list,
        data_source=market["source"],
        asof_date=str(today.date())
    )


def run_historical_replay(req: ReplayRequest) -> ReplayResponse:
    market, feat = get_market_and_features()
    rates, cong = market["rates"], market["congestion"]
    all_dates = list(rates.index)
    ports = get_ports_dict()
    port = ports[req.port_name]

    today = pd.Timestamp(req.asof_date)
    if today not in rates.index:
        raise ValueError(f"Date {req.asof_date} not in market records.")

    today_idx = all_dates.index(today)
    if today_idx + req.window_weeks >= len(all_dates):
        raise ValueError(f"Not enough future periods after {req.asof_date} to evaluate a {req.window_weeks}-week window.")

    # 1. Run decision as of that past date
    dec_req = DecisionRequest(
        origin=req.origin,
        port_name=req.port_name,
        cargo_t=req.cargo_t,
        window_weeks=req.window_weeks,
        wait_cost_pt_week=req.wait_cost_pt_week,
        risk_aversion=req.risk_aversion,
        margin_pct=req.margin_pct,
        dem_mult=req.dem_mult,
        asof_date=req.asof_date
    )
    decision = run_chartering_decision(dec_req)

    # 2. In hindsight calculation (realised cost using ACTUAL future rates)
    b_ship = decision.recommended_ship
    b_wait = decision.recommended_wait_weeks
    sc = screen(b_ship, port, req.cargo_t)
    load = sc["usable_load"]
    part_penalty = SHIPS[b_ship]["dwt"] / load

    def calc_realised(kk: int) -> float:
        dd = all_dates[today_idx + kk]
        fr = float(rates.loc[dd, (req.origin, b_ship)]) * part_penalty
        wd = port["base_wait_days"] * float(np.exp(0.5 * float(cong.loc[dd])))
        dem = wd * SHIPS[b_ship]["demurrage"] * req.dem_mult / load
        wait = req.wait_cost_pt_week * kk
        return fr + dem + wait

    cost_book_now = calc_realised(0)
    cost_following_advice = calc_realised(b_wait)
    gain_pt = cost_book_now - cost_following_advice
    gain_total = gain_pt * req.cargo_t

    actual_series = []
    for kk in range(req.window_weeks + 1):
        dd = all_dates[today_idx + kk]
        actual_series.append(HistoryPoint(
            date=str(dd.date()),
            rate=round(float(rates.loc[dd, (req.origin, b_ship)]), 3)
        ))

    hist_series = rates[(req.origin, b_ship)].loc[:today].iloc[-52:]
    history_pts = [
        HistoryPoint(date=str(d.date()), rate=round(float(val), 3))
        for d, val in hist_series.items()
    ]

    preset_info = None
    if req.asof_date == "2023-08-27":
        preset_info = "Demonstrated Win Case (2023-08-27): Model detected sharp mean-reversion drop ahead, recommending WAIT and capturing substantial market savings."
    elif req.asof_date == "2023-07-02":
        preset_info = "Documented Loss Case (2023-07-02): Genuine real-world market fluctuation where waiting resulted in slightly higher spot freight, demonstrating strict absence of lookahead bias."

    return ReplayResponse(
        decision=decision,
        actual_cost_book_now_pt=round(cost_book_now, 2),
        actual_cost_following_advice_pt=round(cost_following_advice, 2),
        realised_saving_pt=round(gain_pt, 2),
        realised_saving_total=round(gain_total, 0),
        history_series=history_pts,
        actual_future_series=actual_series,
        is_win=bool(gain_pt > 0),
        preset_info=preset_info
    )


def get_backtest_analytics() -> BacktestSummaryResponse:
    summary_path = RESULTS_DIR / "backtest_summary.json"
    sens_path = RESULTS_DIR / "sensitivity.csv"
    dec_path = RESULTS_DIR / "backtest_decisions.csv"

    if not summary_path.exists():
        raise FileNotFoundError(f"Missing backtest summary at {summary_path}")

    with open(summary_path, "r") as f:
        summary_raw = json.load(f)

    sens_rows = []
    if sens_path.exists():
        df_sens = pd.read_csv(sens_path)
        for _, r in df_sens.iterrows():
            sens_rows.append(SensitivityRow(
                wait_cost_pt_wk=float(r["wait_cost_pt_wk"]),
                margin_pct=float(r["margin_pct"]),
                saving_pct=float(r["saving_pct"]),
                saving_pt=float(r["saving_pt"]),
                win=float(r["win"]),
                loss=float(r["loss"]),
                waited=float(r["waited"]),
                p5=float(r["p5"])
            ))

    dec_items = []
    if dec_path.exists():
        df_dec = pd.read_csv(dec_path)
        # Sample recent decisions
        for _, r in df_dec.tail(25).iterrows():
            dec_items.append(DecisionLogItem(
                date=str(r["date"]),
                port=str(r["port"]),
                origin=str(r["origin"]),
                iq_ship=str(r["iq_ship"]),
                iq_wait=int(r["iq_wait"]),
                base_ship=str(r["base_ship"]),
                cost_iq=round(float(r["cost_iq"]), 2),
                cost_base=round(float(r["cost_base"]), 2),
                naive_ship=str(r["naive_ship"]),
                naive_violation=bool(r["naive_violation"]),
                pred_worst=round(float(r["pred_worst"]), 2),
                saving_pt=round(float(r["saving_pt"]), 3)
            ))

    return BacktestSummaryResponse(
        data_source=summary_raw["data_source"],
        n_decisions=summary_raw["n_decisions"],
        cargo_t=summary_raw["cargo_t"],
        window_weeks=summary_raw["window_weeks"],
        test_period=summary_raw["test_period"],
        mean_cost_base_pt=round(summary_raw["mean_cost_base_pt"], 2),
        mean_cost_iq_pt=round(summary_raw["mean_cost_iq_pt"], 2),
        mean_saving_pt=round(summary_raw["mean_saving_pt"], 3),
        saving_pct=round(summary_raw["saving_pct"], 2),
        win_rate_pct=round(summary_raw["win_rate_pct"], 1),
        loss_rate_pct=round(summary_raw["loss_rate_pct"], 1),
        waited_pct=round(summary_raw["waited_pct"], 1),
        avg_saving_total_usd=round(summary_raw["avg_saving_total_usd"], 0),
        worst_decile_saving_pt=round(summary_raw["worst_decile_saving_pt"], 2),
        p5_cost_diff_pt=round(summary_raw["p5_cost_diff_pt"], 2),
        port_violations_iq=summary_raw["port_violations_iq"],
        port_violations_naive=summary_raw["port_violations_naive"],
        naive_violation_pct=summary_raw["naive_violation_pct"],
        mae_model_vs_naive_by_h=summary_raw["mae_model_vs_naive_by_h"],
        mae_improvement_pct=round(summary_raw["mae_improvement_pct"], 1),
        coverage80_by_h=summary_raw["coverage80_by_h"],
        coverage80_overall=round(summary_raw["coverage80_overall"], 3),
        by_port=summary_raw["by_port"],
        by_origin=summary_raw["by_origin"],
        sensitivity=sens_rows,
        recent_decisions=dec_items
    )
