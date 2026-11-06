import numpy as np, pandas as pd
from freightiq.datagen import generate
from freightiq.forecast import build_features, Forecaster
from freightiq.ports import load_ports, screen
from freightiq.decision import evaluate

PORTS = load_ports()


def test_screen_hard_limits():
    assert not screen("Capesize", PORTS["Haldia"], 100_000)["feasible"]       # length + draft
    assert screen("Supramax", PORTS["Paradip"], 100_000)["feasible"]
    s = screen("Capesize", PORTS["Visakhapatnam"], 150_000)
    assert s["feasible"] and s["usable_load"] < 170_000                       # part-loaded by draft


def test_no_lookahead():
    """Changing FUTURE data must not change a forecast made earlier."""
    m = generate()
    feat = build_features(m)
    asof = sorted(feat["date"].unique())[int(0.7 * feat["date"].nunique())]
    p1 = Forecaster(max_iter=40).fit(feat, asof).predict(feat[feat["date"] == asof])
    m2 = generate()
    m2["rates"] = m2["rates"].copy()
    m2["rates"].loc[m2["rates"].index > asof] *= 3.0                          # poison the future
    feat2 = build_features(m2)
    p2 = Forecaster(max_iter=40).fit(feat2, asof).predict(feat2[feat2["date"] == asof])
    assert np.allclose(p1, p2, rtol=1e-9)


def test_quantiles_ordered_and_decision_shape():
    m = generate(); feat = build_features(m); d = feat["date"].max()
    fc = Forecaster(max_iter=40).fit(feat, d)
    rows = feat[feat["date"] == d]; p = fc.predict(rows)
    assert (p[:, :, 0] <= p[:, :, 1]).all() and (p[:, :, 1] <= p[:, :, 2]).all()
    idx = {(r.origin, r.cls): i for i, r in enumerate(rows.itertuples())}
    fcd = {c: p[idx[("Australia", c)]] for c in ["Handysize", "Supramax", "Panamax", "Capesize"]}
    now = {c: float(m["rates"].loc[d, ("Australia", c)]) for c in fcd}
    r = evaluate(PORTS["Paradip"], 150_000, fcd, now, 0.0, 6)
    assert r["feasible"] and r["action"].startswith(("BOOK", "WAIT")) and r["best"]["worst_pt"] >= r["best"]["expected_pt"] - 1e-9
    assert evaluate(PORTS["Haldia"], 150_000, fcd, now, 0.0, 6)["best"]["ship"] in ("Handysize", "Supramax")
