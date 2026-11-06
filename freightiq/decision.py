"""Decision engine: expected + worst-case cost of booking now vs waiting k weeks, per feasible ship class."""
import numpy as np
from .config import SHIPS, Z80, HORIZONS
from .ports import screen_all

N_SIM = 4000


def sample_two_piece(q10, q50, q90, n, rng):
    """Skewed distribution that matches the forecast 10/50/90 quantiles."""
    z = rng.standard_normal(n)
    lo, hi = max(q50 - q10, 1e-6) / Z80, max(q90 - q50, 1e-6) / Z80
    return np.maximum(q50 + np.where(z < 0, lo * z, hi * z), 0.5)


def evaluate(port, cargo_t, fc_by_class, now_by_class, congestion_z, window_weeks,
             wait_cost_pt_week=0.05, risk_aversion=0.3, margin_pct=1.0, dem_mult=1.0, seed=11):
    """fc_by_class[class] -> array [HORIZONS,3] ($/t). now_by_class[class] -> current $/t.
    Returns dict with the recommendation and the full option table."""
    rng = np.random.default_rng(seed)
    wait_days = port["base_wait_days"] * float(np.exp(0.5 * congestion_z))
    window = int(min(max(window_weeks, 0), HORIZONS))
    rows, screened = [], screen_all(port, cargo_t)
    for sc in screened:
        if not sc["feasible"]:
            continue
        c = sc["ship"]
        load = sc["usable_load"]
        part = SHIPS[c]["dwt"] / load                            # part-load penalty on $/t
        dem_pt = wait_days * SHIPS[c]["demurrage"] * dem_mult / load
        for k in range(0, window + 1):
            if k == 0:
                fr = np.full(N_SIM, now_by_class[c])
            else:
                q10, q50, q90 = fc_by_class[c][k - 1]
                fr = sample_two_piece(q10, q50, q90, N_SIM, rng)
            total = fr * part + dem_pt + wait_cost_pt_week * k
            mean, p90 = float(total.mean()), float(np.quantile(total, 0.9))
            rows.append(dict(ship=c, wait_weeks=k, freight_pt=float(np.mean(fr) * part), demurrage_pt=dem_pt,
                             waiting_pt=wait_cost_pt_week * k, expected_pt=mean, worst_pt=p90,
                             score=mean + risk_aversion * (p90 - mean), voyages=sc["voyages"], load=load))
    if not rows:
        return dict(feasible=False, screened=screened, options=[], reason="No ship class is feasible at this port")
    now_rows = [r for r in rows if r["wait_weeks"] == 0]
    best_now = min(now_rows, key=lambda r: r["score"])
    best = min(rows, key=lambda r: r["score"])
    if best["wait_weeks"] > 0 and best["score"] > best_now["score"] * (1 - margin_pct / 100):
        best = best_now                                           # saving too small to justify waiting
    action = "BOOK NOW" if best["wait_weeks"] == 0 else f"WAIT {best['wait_weeks']} WEEK(S)"
    ref = next(r for r in rows if r["ship"] == best["ship"] and r["wait_weeks"] == 0)
    return dict(feasible=True, action=action, best=best, book_now_same_ship=ref, best_now=best_now,
                options=rows, screened=screened, wait_days=wait_days,
                saving_pt=ref["expected_pt"] - best["expected_pt"],
                saving_total=(ref["expected_pt"] - best["expected_pt"]) * cargo_t,
                worst_delta_pt=best["worst_pt"] - ref["worst_pt"],
                vs_cheapest_now_pt=best_now["expected_pt"] - best["expected_pt"])
