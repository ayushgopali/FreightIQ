"""Walk-forward backtest. At each decision date the model sees ONLY data known on that date.

Compared policies (same cargo, same port limits, same laycan window):
  A. Spot baseline      : book NOW on the cheapest feasible class by current expected cost.
  B. FreightIQ          : forecast + port screen + book/wait decision (class AND timing).
  C. Naive unconstrained: book now on the cheapest $/t class ignoring port limits (counts violations).
Realised cost uses ACTUAL future rates and congestion, never forecasts.
"""
import json
import numpy as np
import pandas as pd
from .config import HORIZONS, RESULTS_DIR, SHIPS, ORIGINS, CLASSES
from .datagen import load_market
from .forecast import build_features, Forecaster
from .decision import evaluate
from .ports import load_ports, screen

PORTS_MVP = ["Paradip", "Visakhapatnam"]


def run(retrain_every=26, first_test_frac=0.55, window_weeks=6, cargo_t=150_000, step=2,
        wait_cost=0.05, risk_aversion=0.3, margin_pct=1.0, verbose=True):
    market = load_market()
    rates, cong = market["rates"], market["congestion"]
    feat = build_features(market)
    dates = list(rates.index)
    start = int(len(dates) * first_test_frac)
    end = len(dates) - HORIZONS - 1
    ports = load_ports()
    pos = {d: i for i, d in enumerate(dates)}

    rows, fc_err, cover = [], [], []
    model, trained_at = None, -10**9
    for i in range(start, end, step):
        d = dates[i]
        if model is None or i - trained_at >= retrain_every:
            model = Forecaster().fit(feat, d)
            trained_at = i
            if verbose:
                print(f"  retrained at {d.date()}  (naive-fallback horizons: {[h for h, v in model.fallback.items() if v]})", flush=True)
        today = feat[feat["date"] == d]
        preds = model.predict(today)
        key = {(r.origin, r.cls): j for j, r in enumerate(today.itertuples())}
        # forecast accuracy vs realised + vs naive (all series, all horizons)
        for (o, c), j in key.items():
            for h in range(1, HORIZONS + 1):
                actual = rates.loc[dates[i + h], (o, c)]
                lo, md, hi = preds[j, h - 1]
                now = rates.loc[d, (o, c)]
                fc_err.append((h, abs(md - actual), abs(now - actual)))
                cover.append((h, lo <= actual <= hi, hi - lo))
        for pname in PORTS_MVP:
            port = ports[pname]
            for o in ORIGINS:
                fc = {c: preds[key[(o, c)]] for c in CLASSES}
                now = {c: float(rates.loc[d, (o, c)]) for c in CLASSES}
                cz = float(cong.loc[d])
                res = evaluate(port, cargo_t, fc, now, cz, window_weeks, wait_cost, risk_aversion, margin_pct)
                if not res["feasible"]:
                    continue

                def realised(ship, k):
                    sc = screen(ship, port, cargo_t)
                    load = sc["usable_load"]
                    dd = dates[i + k]
                    fr = float(rates.loc[dd, (o, ship)]) * SHIPS[ship]["dwt"] / load
                    wd = port["base_wait_days"] * float(np.exp(0.5 * float(cong.loc[dd])))
                    return fr + wd * SHIPS[ship]["demurrage"] / load + wait_cost * k

                b = res["best"]
                cost_iq = realised(b["ship"], b["wait_weeks"])
                a = res["best_now"]
                cost_base = realised(a["ship"], 0)
                # unconstrained naive: cheapest raw $/t, ignore feasibility
                naive_ship = min(CLASSES, key=lambda c: now[c])
                naive_ok = screen(naive_ship, port, cargo_t)["feasible"]
                rows.append(dict(date=d, port=pname, origin=o, iq_ship=b["ship"], iq_wait=b["wait_weeks"],
                                 base_ship=a["ship"], cost_iq=cost_iq, cost_base=cost_base,
                                 naive_ship=naive_ship, naive_violation=not naive_ok,
                                 pred_worst=b["worst_pt"]))
    df = pd.DataFrame(rows)
    fe = pd.DataFrame(fc_err, columns=["h", "mae_model", "mae_naive"])
    cv = pd.DataFrame(cover, columns=["h", "hit", "width"])
    df["saving_pt"] = df["cost_base"] - df["cost_iq"]
    summary = dict(
        data_source=market["source"], n_decisions=int(len(df)), cargo_t=cargo_t, window_weeks=window_weeks,
        test_period=[str(df["date"].min().date()), str(df["date"].max().date())],
        mean_cost_base_pt=float(df["cost_base"].mean()), mean_cost_iq_pt=float(df["cost_iq"].mean()),
        mean_saving_pt=float(df["saving_pt"].mean()),
        saving_pct=float(100 * df["saving_pt"].mean() / df["cost_base"].mean()),
        win_rate_pct=float(100 * (df["saving_pt"] > 1e-9).mean()),
        loss_rate_pct=float(100 * (df["saving_pt"] < -1e-9).mean()),
        waited_pct=float(100 * (df["iq_wait"] > 0).mean()),
        avg_saving_total_usd=float(df["saving_pt"].mean() * cargo_t),
        worst_decile_saving_pt=float(df["saving_pt"].quantile(0.10)),
        p5_cost_diff_pt=float(df["saving_pt"].quantile(0.05)),
        port_violations_iq=0, port_violations_naive=int(df["naive_violation"].sum()),
        naive_violation_pct=float(100 * df["naive_violation"].mean()),
        mae_model_vs_naive_by_h={int(h): [float(g.mae_model.mean()), float(g.mae_naive.mean())] for h, g in fe.groupby("h")},
        mae_improvement_pct=float(100 * (1 - fe.mae_model.mean() / fe.mae_naive.mean())),
        coverage80_by_h={int(h): float(g.hit.mean()) for h, g in cv.groupby("h")},
        coverage80_overall=float(cv.hit.mean()),
        by_port={p: float(g.saving_pt.mean()) for p, g in df.groupby("port")},
        by_origin={o: float(g.saving_pt.mean()) for o, g in df.groupby("origin")},
    )
    RESULTS_DIR.mkdir(exist_ok=True)
    df.to_csv(RESULTS_DIR / "backtest_decisions.csv", index=False)
    (RESULTS_DIR / "backtest_summary.json").write_text(json.dumps(summary, indent=2))
    return summary, df


if __name__ == "__main__":
    s, _ = run()
    print(json.dumps({k: v for k, v in s.items() if not isinstance(v, dict)}, indent=2))
