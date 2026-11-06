"""Synthetic weekly market data (freight, congestion, coal price).

IMPORTANT: this is a stand-in so the pipeline runs end to end offline. It has realistic *structure*
(persistent, mean-reverting, seasonal, jumpy) but it is NOT real market history. Drop real CSVs into
data/real/ (see README) and `load_market()` will use them instead.
"""
import numpy as np
import pandas as pd
from .config import ORIGINS, CLASSES, BASE_RATE, DATA_DIR


def _ou(n, phi, sigma, rng, jumps=None):
    x = np.zeros(n)
    for t in range(1, n):
        x[t] = phi * x[t - 1] + sigma * rng.standard_normal()
        if jumps is not None:
            x[t] += jumps[t]
    return x


def generate(seed=7, start="2016-01-03", end="2026-11-01") -> dict:
    rng = np.random.default_rng(seed)
    dates = pd.date_range(start, end, freq="W-SUN")
    n = len(dates)
    woy = dates.isocalendar().week.to_numpy().astype(float)
    season = 0.07 * np.sin(2 * np.pi * (woy - 14) / 52) + 0.03 * np.sin(4 * np.pi * (woy - 6) / 52)

    jump = np.where(rng.random(n) < 0.015, rng.choice([-1, 1], n) * rng.uniform(0.12, 0.28, n), 0.0)
    market = _ou(n, 0.95, 0.045, rng, jump)
    cong = 0.6 * np.roll(market, 1) + _ou(n, 0.8, 0.12, rng)            # congestion lags the market
    coal = np.log(110) + 0.5 * market + _ou(n, 0.97, 0.03, rng)         # coal price co-moves with freight

    cols, data = [], []
    ocomp = {o: _ou(n, 0.9, 0.015, rng) for o in ORIGINS}
    ccomp = {c: _ou(n, 0.85, 0.02, rng) for c in CLASSES}
    for o in ORIGINS:
        for c in CLASSES:
            lvl = np.log(BASE_RATE[(o, c)]) + season + market + ocomp[o] + ccomp[c]
            cols.append((o, c))
            data.append(np.exp(lvl))
    rates = pd.DataFrame(np.column_stack(data), index=dates, columns=pd.MultiIndex.from_tuples(cols, names=["origin", "cls"]))
    cong_s = pd.Series(cong, index=dates, name="congestion_z")
    coal_s = pd.Series(np.exp(coal), index=dates, name="coal_usd_t")
    return dict(rates=rates.round(3), congestion=cong_s, coal=coal_s, source="synthetic")


def load_market() -> dict:
    """Use real CSVs from data/real/ if present, else synthetic data.

    Expected files (weekly or any frequency; resampled to weeks):
      rates.csv      date,origin,cls,usd_per_t
      congestion.csv date,congestion_z      (optional; z-score of port waiting time)
      coal.csv       date,coal_usd_t        (optional)
    """
    real = DATA_DIR / "real" / "rates.csv"
    if not real.exists():
        return generate()
    r = pd.read_csv(real, parse_dates=["date"])
    wide = r.pivot_table(index="date", columns=["origin", "cls"], values="usd_per_t").resample("W-SUN").last().ffill()
    idx = wide.index

    def _opt(name, col, default):
        p = DATA_DIR / "real" / name
        if p.exists():
            return pd.read_csv(p, parse_dates=["date"]).set_index("date")[col].resample("W-SUN").last().reindex(idx).ffill().bfill()
        return pd.Series(default, index=idx, name=col)

    return dict(rates=wide, congestion=_opt("congestion.csv", "congestion_z", 0.0),
                coal=_opt("coal.csv", "coal_usd_t", 100.0), source="real")
