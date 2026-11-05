# FreightIQ: Forecast-Driven Chartering Decision Engine
NOVEX Hackathon 2026 · Logistics & Supply Chain (AI-based Decision Support) · Team Code Hunters

Answers one question for East Coast coal importers: **book the ship now, or wait?**
Forecast range + port feasibility + worst-case cost, in one workflow.

## Run it (3 commands)
```bash
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py
```
Optional: `python run_backtest.py` (about 1 min) regenerates `results/`; `python -m pytest tests` runs the tests.

## Structure
| Path | Purpose |
|---|---|
| `app.py` | Streamlit + Plotly dashboard (5 tabs, time-machine replay) |
| `freightiq/forecast.py` | Quantile gradient boosting, conformal calibration, naive-baseline gate |
| `freightiq/ports.py` + `data/ports.json` | Port screening (hard limits); add ports as data, not code |
| `freightiq/decision.py` | Cost simulation: expected and P90 cost for book-now vs wait-k-weeks |
| `freightiq/backtest.py` | Walk-forward backtest, no look-ahead |
| `freightiq/datagen.py` | Synthetic data + loader for real CSVs |
| `results/` | Backtest summary, per-decision log, sensitivity sweep |

## Before you present: 2 things you MUST do
1. **Replace placeholder port limits.** `data/ports.json` values are indicative. Check each against the port authority sites, then set `"verified": true`.
2. **Swap in real freight data.** The bundled data is SYNTHETIC. Put `data/real/rates.csv` (`date,origin,cls,usd_per_t`; optional `congestion.csv`, `coal.csv`), run `python run_backtest.py`, and quote only those numbers.
   Public proxies you can export as CSV: Baltic Dry / Capesize / Panamax / Supramax index history (convert index points to $/t with a stated scaling), Indonesian coal benchmark prices.

## Deploy (free)
Push this folder to GitHub, then Streamlit Community Cloud → New app → `app.py`. Commit `results/` so the Backtest tab works.
