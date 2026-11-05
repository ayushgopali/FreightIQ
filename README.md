# 🚢 FreightIQ: Forecast-Driven Chartering Decision Engine

**Book the ship now, or wait?** One workflow gives East Coast coal importers a forecast range, port feasibility, and worst-case cost.

NOVEX Hackathon 2026 · Logistics & Supply Chain (AI-based Decision Support) · Team Code Hunters

[Live demo](#) · [Demo video](#) · [Slides](#)



---

## The problem

Importers charter bulk carriers in a volatile freight market. Book too early and you may overpay if rates fall. Wait too long and you may get hit by a spike, port congestion, or a vessel that can't berth at your port. Today this call is usually made on gut feel and a single-point rate quote.

## What FreightIQ does

| Question | How FreightIQ answers it |
|---|---|
| Where are freight rates heading? | Quantile gradient boosting gives a **P10 / P50 / P90 range**, not a single number |
| Can the forecast be trusted? | **Conformal calibration** plus a **naive-baseline gate**: the model must beat a naive forecast before it is used |
| Can this vessel actually call at my port? | **Hard-limit port screening** (draft, LOA, DWT, etc.) from `data/ports.json` |
| What's the downside? | **Monte Carlo cost simulation**: expected cost and **P90 (worst-case) cost** for *book now* vs *wait k weeks* |
| Would this have worked historically? | **Walk-forward backtest** with no look-ahead, plus a time-machine replay in the UI |

## Quick start

```bash
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py
```

Optional:

```bash
python run_backtest.py     # ~1 min, regenerates results/
python -m pytest tests     # run the test suite
```

## How it works

```
 rates / congestion / coal prices
              │
              ▼
   ┌─────────────────────┐
   │ forecast.py         │  quantile GBM → conformal calibration → baseline gate
   └─────────┬───────────┘
             ▼
   ┌─────────────────────┐      ┌──────────────────┐
   │ decision.py         │◄─────│ ports.py         │  hard-limit feasibility filter
   │ book-now vs wait-k  │      │ data/ports.json  │
   │ E[cost], P90 cost   │      └──────────────────┘
   └─────────┬───────────┘
             ▼
   app.py (Streamlit + Plotly, 5 tabs)  ·  backtest.py (walk-forward validation)
```

**Decision rule:** [state it here in one or two sentences, e.g. "Recommend *wait k weeks* only if its expected cost is lower than booking now AND its P90 cost does not exceed book-now P90 by more than X%."]

## Project structure

| Path | Purpose |
|---|---|
| `app.py` | Streamlit + Plotly dashboard (5 tabs, time-machine replay) |
| `freightiq/forecast.py` | Quantile gradient boosting, conformal calibration, naive-baseline gate |
| `freightiq/ports.py` + `data/ports.json` | Port screening (hard limits); add ports as data, not code |
| `freightiq/decision.py` | Cost simulation: expected and P90 cost for book-now vs wait-k-weeks |
| `freightiq/backtest.py` | Walk-forward backtest, no look-ahead |
| `freightiq/datagen.py` | Synthetic data generator + loader for real CSVs |
| `results/` | Backtest summary, per-decision log, sensitivity sweep |
| `tests/` | Unit tests |

## Results

> ⚠️ Numbers below are from **[synthetic / real]** data. Update after running `python run_backtest.py` on real rates.

| Metric | Value |
|---|---|
| Backtest period | [e.g. 2019-01 → 2025-12] |
| Forecast error vs naive baseline | [e.g. −X% MAE] |
| P10–P90 interval coverage (target 80%) | [X%] |
| Avg. cost vs always-book-now | [±X $/t] |
| Avg. worst-case (P90) cost vs always-book-now | [±X $/t] |

Full details: `results/` (summary, per-decision log, sensitivity sweep).

## Using real data

The bundled data is **synthetic**. To use real data, add files under `data/real/`:

| File | Required | Columns |
|---|---|---|
| `rates.csv` | ✅ | `date, origin, cls, usd_per_t` |
| `congestion.csv` | optional | [add your columns] |
| `coal.csv` | optional | [add your columns] |

Then run `python run_backtest.py` and quote only those numbers.

**Public proxies you can export as CSV:** Baltic Dry / Capesize / Panamax / Supramax index history (convert index points to $/t with a stated scaling), and Indonesian coal benchmark prices.

## Adding a port

Ports are data, not code. Add an entry to `data/ports.json`:

```json
{
  "name": "[Port name]",
  "max_draft_m": 0.0,
  "max_loa_m": 0.0,
  "max_dwt": 0,
  "verified": false
}
```

Match the field names to your existing schema. Set `"verified": true` only after checking against the port authority's published limits.

## Known limitations

- Port limits in `data/ports.json` are **indicative** until marked verified.
- Forecasts are only as good as the input data. Synthetic data demonstrates the pipeline, not market performance.
- [Model does not capture: sudden geopolitical shocks, weather events, bunker price swings, etc. Edit to match reality.]
- Cost simulation assumes [e.g. demurrage rate, fixed cargo size]. See `freightiq/decision.py`.
- This is decision support, not financial or chartering advice.

## Pre-presentation checklist

- [ ] Verified every port limit against the port authority site, then set `"verified": true`
- [ ] Replaced synthetic data with `data/real/rates.csv`
- [ ] Re-ran `python run_backtest.py` and updated the Results table
- [ ] Committed `results/` (needed for the Backtest tab on Streamlit Cloud)
- [ ] Tests pass: `python -m pytest tests`
- [ ] Added screenshot and demo link at the top of this README

## Deploy (free)

1. Push this folder to GitHub.
2. Go to Streamlit Community Cloud → **New app** → select `app.py`.
3. Commit `results/` so the Backtest tab works.

## Roadmap

- [e.g. Live Baltic index ingestion]
- [e.g. Multi-leg / multi-cargo planning]
- [e.g. Bunker cost and fuel-price sensitivity]

## Team

**Code Hunters**: [names / roles]

## License

[MIT / Apache-2.0 / etc.]
