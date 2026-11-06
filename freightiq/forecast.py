"""Forecast range per (origin, ship class): quantile gradient boosting + conformal calibration.

- Direct multi-horizon: one model per (horizon, quantile) predicting log(rate[t+h]) - log(rate[t]).
- Conformalized quantile regression (CQR) on a held-out calibration window so the 80% band is honest.
- Gate: per horizon, if the boosted median does not beat the naive (no-change) forecast on the
  calibration window, we fall back to naive median with an empirical-residual band.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from .config import HORIZONS, QUANTILES, ORIGINS, CLASSES

FEATS = ["mom1", "mom4", "mom13", "dev52", "sin", "cos", "cong", "coal_chg4", "oid", "cid"]


def build_features(market: dict) -> pd.DataFrame:
    rates, cong, coal = market["rates"], market["congestion"], market["coal"]
    lr = np.log(rates)
    woy = rates.index.isocalendar().week.to_numpy().astype(float)
    base = pd.DataFrame({"sin": np.sin(2 * np.pi * woy / 52), "cos": np.cos(2 * np.pi * woy / 52),
                         "cong": cong.values, "coal_chg4": np.log(coal).diff(4).values}, index=rates.index)
    frames = []
    for (o, c) in rates.columns:
        s = lr[(o, c)]
        f = base.copy()
        f["mom1"], f["mom4"], f["mom13"] = s.diff(1), s.diff(4), s.diff(13)
        f["dev52"] = s - s.rolling(52, min_periods=26).mean()
        f["oid"], f["cid"] = ORIGINS.index(o), CLASSES.index(c)
        f["origin"], f["cls"], f["lr0"] = o, c, s
        for h in range(1, HORIZONS + 1):
            f[f"y{h}"] = s.shift(-h) - s
        frames.append(f)
    out = pd.concat(frames).rename_axis("date").reset_index()
    return out.dropna(subset=FEATS).reset_index(drop=True)


class Forecaster:
    def __init__(self, cal_weeks=52, max_iter=140):
        self.cal_weeks, self.max_iter = cal_weeks, max_iter
        self.models, self.Q, self.fallback, self.emp = {}, {}, {}, {}
        self.upto = None

    def fit(self, feat: pd.DataFrame, upto: pd.Timestamp):
        """Fit using only information available on `upto` (targets must have resolved by then)."""
        self.upto = pd.Timestamp(upto)
        for h in range(1, HORIZONS + 1):
            resolved = feat[(feat["date"] + pd.Timedelta(weeks=h) <= self.upto) & feat[f"y{h}"].notna()]
            cal_start = self.upto - pd.Timedelta(weeks=self.cal_weeks)
            tr = resolved[resolved["date"] + pd.Timedelta(weeks=h) <= cal_start]
            cal = resolved[resolved["date"] + pd.Timedelta(weeks=h) > cal_start]
            for q in QUANTILES:
                m = HistGradientBoostingRegressor(loss="quantile", quantile=q, max_iter=self.max_iter,
                                                  learning_rate=0.05, max_depth=3, min_samples_leaf=40,
                                                  l2_regularization=1.0, random_state=0)
                m.fit(tr[FEATS], tr[f"y{h}"])
                self.models[(h, q)] = m
            # gate vs naive on the calibration window
            med = self.models[(h, 0.5)].predict(cal[FEATS])
            mae_m, mae_n = np.mean(np.abs(cal[f"y{h}"] - med)), np.mean(np.abs(cal[f"y{h}"]))
            self.fallback[h] = bool(mae_m >= mae_n)
            self.emp[h] = tuple(np.quantile(tr[f"y{h}"], [QUANTILES[0], QUANTILES[2]]))
            lo, md, hi = self._raw(h, cal)
            y = cal[f"y{h}"].to_numpy()
            score = np.maximum(lo - y, y - hi)
            n = len(score)
            self.Q[h] = float(np.quantile(score, min(1.0, (1 - 0.2) * (1 + 1 / n))))
        return self

    def _raw(self, h, X):
        if self.fallback.get(h):
            lo, hi = self.emp[h]
            n = len(X)
            return np.full(n, lo), np.zeros(n), np.full(n, hi)
        p = np.sort(np.column_stack([self.models[(h, q)].predict(X[FEATS]) for q in QUANTILES]), axis=1)
        return p[:, 0], p[:, 1], p[:, 2]

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Returns array [n_rows, HORIZONS, 3] of $/t (q10, q50, q90)."""
        out = np.zeros((len(X), HORIZONS, 3))
        lr0 = X["lr0"].to_numpy()
        for h in range(1, HORIZONS + 1):
            lo, md, hi = self._raw(h, X)
            lo, hi = lo - self.Q[h], hi + self.Q[h]          # conformal widening (can also narrow)
            for j, v in enumerate((lo, md, hi)):
                out[:, h - 1, j] = np.exp(lr0 + v)
        out[:, :, 0] = np.minimum(out[:, :, 0], out[:, :, 1])
        out[:, :, 2] = np.maximum(out[:, :, 2], out[:, :, 1])
        return out
