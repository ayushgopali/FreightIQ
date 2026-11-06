# FreightIQ: Forecast-Driven Chartering Decision Engine for East Coast Bulk Imports
**NOVEX Hackathon 2026 · Final Round Project Report · Team Code Hunters**
*(Add member names, college and mentor details here.)*

## 1. Problem
Indian East Coast coal importers who hire ships on the spot market face volatile freight and port limits (draft, berth, cargo handling) that decide which ships can actually be used. A wrong booking means idle ship time, demurrage and unreliable supply. Today no simple tool says whether to **book now or wait**, or which ship class is both affordable and feasible for their port. At Capesize scale, a $2/t freight change is roughly $340,000 on one 170,000 t voyage.

## 2. Solution
A web dashboard that combines three steps per importer's actual cargo:
1. **Forecast** freight for each origin and ship class over 8 weeks, as an 80% *range*.
2. **Port screening** against length, beam and draft limits (with under-keel margin). Draft-limited ships are shown as part-loaded.
3. **Decision engine** that simulates all-in cost (freight + demurrage + waiting cost) for *book now* vs *wait k weeks*, reports expected and worst-case (P90) cost, and waits only if the risk-adjusted saving clears a minimum margin.

## 3. Architecture
Inputs (cargo, port, origin, laycan window) → data layer (rates, congestion, coal, `ports.json`) → forecaster → port screen → decision engine → Streamlit/Plotly dashboard. Ports and routes are data; adding one needs no code change.

## 4. Methodology
- **Forecasting.** Direct multi-horizon models, one per (horizon, quantile), predicting the log change in rate. Features: 1/4/13-week momentum, deviation from 52-week mean, seasonality (sin/cos of week), congestion, 4-week coal price change, origin and class ids. Learner: histogram gradient boosting with quantile loss (10/50/90).
- **Calibration.** Conformalized quantile regression on a held-out 52-week calibration window.
- **Gate.** Per horizon, if the boosted median does not beat the naive no-change forecast on the calibration window, the system falls back to naive with an empirical band.
- **Cost model.** Cost/t = freight × (DWT / usable load) + expected port wait × demurrage / usable load + waiting cost × weeks. Expected port wait scales with a congestion index.
- **Decision rule.** Score = mean + λ(P90 − mean), λ = risk aversion (default 0.3). Wait only if the best waiting option beats the best book-now option by more than a margin (default 1%).
- **Backtest.** Walk-forward replay; models retrained every 26 weeks using only data resolved by the decision date. A unit test poisons future data and verifies earlier forecasts are unchanged. Realised cost uses actual future rates, never forecasts.

## 5. Data (read this)
This build uses a **synthetic** weekly market (12 origin×class series, 2016–2026) with realistic structure: persistence, mean reversion, seasonality, jumps, lagged congestion, co-moving coal price. It is a stand-in, **not real market history**. Port limits in `data/ports.json` are **indicative placeholders** flagged `verified: false`. The loader accepts real CSVs (`data/real/`) with no code change; all headline numbers below must be regenerated on real data before being claimed as findings.

## 6. Results (synthetic data, test period 2021-12-19 to 2026-08-23, 738 decisions, 150,000 t cargo, 6-week window)
| Metric | Result |
|---|---|
| Median forecast error vs naive (MAE) | 10.8% lower |
| Coverage of 80% forecast range | 78.8% |
| Mean all-in cost: book-now baseline | $12.77/t |
| Mean all-in cost: FreightIQ | $12.70/t |
| Mean saving | $0.071/t (0.55%), about $10,600 per 150,000 t cargo |
| Decisions that beat baseline / worse than baseline | 6.2% / 3.9% |
| Decisions that chose to wait | 10.2% |
| Port-limit violations (FreightIQ) | 0 |

**Sensitivity to waiting cost** (full sweep, step 4 weeks): with no waiting cost and no margin, average saving is 1.41% (wins 16.9%, losses 9.9%); at $0.06/t/week and 1% margin it falls to 0.26%; at $0.12/t/week it is about 0.06%. The value of waiting depends on how costly delay is for the importer, which is why it is a user setting.

**Port screening.** Under the placeholder limits the cheapest class per tonne (Capesize) is blocked at Gopalpur, Sagar-Sandheads and Haldia and part-loaded at Visakhapatnam. At the two MVP ports a naive cheapest-rate booking produced no violations in the backtest, so the screening benefit shows mainly across the wider port set.

## 7. Limitations
- Results are on synthetic data; real-world performance is unproven until validated on licensed or public index history.
- Timing edge is modest; the decision engine evaluates each wait option on its own marginal forecast (a static plan, not a dynamic re-planning policy).
- Single congestion index; simplified demurrage; berth queues and tides are not modelled.
- Premium index feeds (Baltic Exchange, Signal Ocean, Kpler) were not accessible; public proxies are planned.

## 8. Impact and scalability
Economic (less overpayment and demurrage), operational (comparable, justifiable decisions), social (reliable coal supply), environmental (less idle waiting, indirect). Scale by adding ports and routes as data, more dry-bulk cargoes, contract advice, and subscription pilots with importers, steel and power producers, and brokers.

## 9. References
Baltic Exchange (balticexchange.com) · Ministry of Ports, Shipping & Waterways (shipmin.gov.in) · Indian Ports Association (ipa.nic.in) · Paradip Port (paradipport.gov.in) · Visakhapatnam Port (vizagport.com) · scikit-learn, Streamlit, Plotly documentation · Romano, Patterson & Candès (2019), *Conformalized Quantile Regression*.
