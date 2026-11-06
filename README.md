# 🚢 FreightIQ: Forecast-Driven Chartering Decision Engine
### NOVEX Hackathon 2026 · Final Round | Logistics & Supply Chain (AI-Based Decision Support)
**Team Code Hunters** · *Target Region: Indian East Coast Bulk Ports (Coal Imports)*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19_TypeScript-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![scikit-learn](https://img.shields.io/badge/ML-Quantile_GBM_+_CQR-F7931E?style=flat&logo=scikit-learn)](https://scikit-learn.org/)
[![Tests](https://img.shields.io/badge/Tests-14_Passed-success?style=flat&logo=pytest)](https://docs.pytest.org/)

---

## 📌 Executive Summary

**Book the vessel now, or wait?** 

At Capesize scale ($150,000–170,000\text{ tonnes}$), a spot freight rate swing of just **$2.00/t** shifts voyage cost by **$340,000**. Yet, coal importers, steel mills, and power generation utilities across India's East Coast currently make multimillion-dollar chartering decisions using manual spreadsheets, broker phone calls, and point-estimate quotes.

**FreightIQ** is an institutional-grade, forecast-driven chartering decision platform designed specifically for dry-bulk imports into Indian East Coast ports (**Paradip, Visakhapatnam, Gangavaram, Gopalpur, Dhamra, Sagar Island, and Haldia**). It unites probabilistic machine-learning forecasts, physical port draft restrictions, and risk-adjusted Monte Carlo cost optimization into an explainable, zero-lookahead decision engine.

---

## 🎯 The Core Problem

1. **Spot Rate Volatility**: Chartering a vessel too early locks in high costs if the market softens; waiting too long risks freight spikes and severe waiting demurrage.
2. **Physical Port Restrictions**: A vessel class that appears cheaper on paper (e.g., Capesize at $\$10.50/\text{t}$) is frequently unusable or severely restricted due to draft, beam, or LOA limits at shallow berths, forcing expensive part-loading penalties or lighterage.
3. **Point Estimates vs. Risk**: Standard forecasts give a single number that obscures downside risk. FreightIQ models the complete uncertainty distribution ($P_{10}$, $P_{50}$, $P_{90}$) and verifies every wait recommendation against risk tolerance.

---

## ⚡ Quick Start: Running the Full Platform

### Option 1: Single-Command Full-Stack Launch (Windows)
Double-click `start_fullstack.bat` or run in PowerShell:
```powershell
.\start_fullstack.bat
```
This automatically starts:
- **FastAPI Analytical Engine**: `http://127.0.0.1:8000` (API Docs: `/docs`)
- **React Institutional Terminal**: `http://localhost:5173`

---

### Option 2: Manual Startup (Separate Terminals)

#### 1. Backend Server (FastAPI)
```bash
# From repository root
python -m venv .venv
.\.venv\Scripts\activate      # Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python run_server.py
```
*Backend runs on `http://127.0.0.1:8000`.*

#### 2. Frontend Development Server (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

### Option 3: Automated Test Suite Verification
Run all 14 unit, API, and end-to-end integration tests:
```bash
python -m pytest tests
```
*All tests verify zero lookahead leakage, port draft boundaries, conformal coverage, and API contracts.*

---

## 🖥️ System Architecture & Dual-Surface Platform

FreightIQ is engineered with a **dual-surface architecture**: an institutional landing page providing transparency and an interactive decision console.

```
                            [ User Input / Voyage Specification ]
                                              │
                                              ▼
                    ┌──────────────────────────────────────────────────┐
                    │            FastAPI Analytical Layer              │
                    │         (backend/api/console_api.py)             │
                    └─────────┬──────────────────────────────┬─────────┘
                              │                              │
                              ▼                              ▼
                 ┌───────────────────────────┐  ┌───────────────────────────┐
                 │     Forecaster Engine     │  │   Physical Port Screen    │
                 │ (HistGradientBoosting +   │  │   (Draft, LOA, Beam, UKC) │
                 │      CQR Calibration)     │  │      (data/ports.json)    │
                 └────────────┬──────────────┘  └─────────────┬─────────────┘
                              │                              │
                              └──────────────┬───────────────┘
                                             ▼
                             ┌───────────────────────────────┐
                             │       Decision Engine         │
                             │  (All-in Cost Simulation +    │
                             │   Risk-Averse Optimization)   │
                             └───────────────┬───────────────┘
                                             ▼
                             ┌───────────────────────────────┐
                             │   React Institutional UI      │
                             │   - Decide Panel              │
                             │   - Port Feasibility Matrix   │
                             │   - Backtest Analytics        │
                             │   - Advice Time Machine       │
                             └───────────────────────────────┘
```

---

## 🔬 How FreightIQ Works

### 1. Probabilistic Multi-Horizon Forecasting (`freightiq/forecast.py`)
- **Direct Multi-Horizon Models**: Independent gradient-boosted quantile regressors for horizons $h \in \{1, \dots, 8\}$ weeks ahead.
- **Quantile Loss**: Direct estimation of $P_{10}$ (optimistic), $P_{50}$ (median), and $P_{90}$ (pessimistic / risk ceiling).
- **Engineered Features**:
  - $1$-, $4$-, and $13$-week rate momentum ($\Delta \log \text{rate}$).
  - $52$-week mean reversion deviation ($(\text{rate} - \mu_{52}) / \sigma_{52}$).
  - Multi-frequency annual seasonality ($\sin/\cos$ harmonic transforms of week).
  - Port congestion pressure index ($Z$-score) and Newcastle/Kalimantan coal price momentum.

### 2. Conformal Calibration (CQR) & Naive Baseline Gate
- **Conformal Calibration**: Residuals on a held-out rolling calibration window calibrate prediction bands to achieve an empirical 80% coverage rate (**78.8% measured**).
- **Automated Fallback Gate**: If the gradient-boosted model fails to beat a simple naive no-change forecast on the calibration window, it automatically falls back to an empirical persistence distribution.

### 3. Hard-Limit Port Feasibility Screening (`freightiq/ports.py`)
- **Strict Geometric Constraints**: Tests candidate vessels against berth LOA, channel beam, and maximum dredged draft.
- **Under-Keel Clearance (UKC)**: Mandates a **0.60 m** safety clearance margin below the hull.
- **Draft-Limiting Physics**: Vessels calling at draft-restricted ports (e.g., Capesize at Visakhapatnam) are automatically downgraded to **Part-loaded**, computing the exact usable deadweight tonnage ($DWT_{\text{usable}}$). Vessels failing beam or LOA limits are **Blocked**.

### 4. Risk-Adjusted Decision Rule (`freightiq/decision.py`)
All-in voyage cost per tonne for waiting $k$ weeks:
$$\text{Cost}_k = \text{Freight}_k \times \frac{DWT}{DWT_{\text{usable}}} + \text{Demurrage}_k + (\text{Wait Cost} \times k)$$

A **`WAIT k WEEKS`** recommendation is issued **if and only if**:
1. $\text{Expected Cost}_k < \text{Book Now Cost}$
2. $\text{Risk Score}_k \le \text{Book Now Score}$, where $\text{Score} = \mathbb{E}[\text{Cost}] + \lambda (P_{90} - \mathbb{E}[\text{Cost}])$, with risk aversion parameter $\lambda = 0.30$.
3. The expected net saving exceeds the required safety margin (default **1.0%**).

---

## 🎬 Live Demonstrations & Judge Walkthrough Guide

Use this structured 4-step demonstration flow during live hackathon presentations:

### Demo 1: The Chartering Decision Engine (`/console` → Decide Tab)
- **Scenario**: Voyage of $150,000\text{ t}$ from **Richards Bay (South Africa)** to **Paradip**.
- **What to Demonstrate**:
  1. Show the interactive 8-week probabilistic fan chart: emphasize the **$P_{10}–P_{90}$ corridor** rather than a naive point estimate.
  2. Point to the **Verdict Card**: dynamic recommendation (`BOOK NOW` or `WAIT`), clearing threshold percentage, and estimated net dollar savings.
  3. Inspect the **Book-Now vs. Wait Options Matrix**: compare all-in costs across weeks 0 to 6 with demurrage and waiting penalties accounted for.
  4. Review **Driver Attributions**: transparent display of the dominant market factors driving the verdict (4-week momentum, 52-week deviation, port congestion).

### Demo 2: Port Feasibility Matrix (`/console` → Port Screen Tab)
- **Scenario**: Testing ship classes across the Indian East Coast.
- **What to Demonstrate**:
  1. Switch cargo to $150,000\text{ t}$ and observe the live classification across all 7 ports:
     - **Paradip / Dhamra**: Fully Feasible for Capesize.
     - **Visakhapatnam**: Draft-limited to $81\%$ of usable load (part-loaded warning with penalty).
     - **Haldia / Sagar / Gopalpur**: Blocked due to shallow draft ($9.0\text{ m}$) or LOA limits.
  2. *Takeaway for Judges*: *"The theoretically cheapest ship class per tonne is frequently the one that physically cannot dock at the destination berth."*

### Demo 3: Zero-Lookahead Advice Time Machine (`/console` → Time Machine Tab)
- **Scenario**: Proving honest algorithmic performance without hindsight bias.
- **What to Demonstrate**:
  1. Click the **2023-08-27** preset (Paradip, Australia):
     - The engine is frozen using only data available on that exact date.
     - Model advises `WAIT 6 WEEKS`.
     - The realized market path reveals spot rates plunged, saving **+$2.94/t** ($+\$441,000$ on the voyage) — **Documented Win**.
  2. Click the **2023-07-02** preset (Visakhapatnam, Australia):
     - Model advises `WAIT`.
     - Market rate unexpectedly rose from $\$13.80$ to $\$15.41/\text{t}$, yielding a **-$1.61/t$ loss** — **Documented Honest Loss**.
  3. *Takeaway for Judges*: *"We don't cherry-pick. Real trading systems experience losing calls, and FreightIQ measures and displays them with complete transparency."*

### Demo 4: 738-Decision Walk-Forward Backtest (`/console` → Backtest Tab)
- **Scenario**: Reviewing 5 years of walk-forward validation (2021–2026).
- **What to Demonstrate**:
  1. Display the **Equity Curve**: cumulative dollar savings across 738 simulated importer decisions.
  2. Review the **Sensitivity Sweep Table**: demonstrates how savings behave across waiting costs ($0.00 to $0.06/t/week).

---

## 📊 Backtested Results Summary

Evaluated on 738 walk-forward weekly chartering decisions (2021–2026) across East Coast import corridors:

| Key Performance Indicator | Measured Result | Benchmark Baseline | Interpretation |
|---|:---:|:---:|---|
| **Walk-Forward Decisions** | **738** | — | Evaluated strictly out-of-sample |
| **Forecast Error (MAE)** | **10.8% Lower** | Naive Persistence | Consistently outperforms naive baseline |
| **80% Band Coverage** | **78.8%** | 80.0% Target | Validated conformal calibration |
| **Port-Limit Violations** | **0** | Baseline: Unchecked | Zero draft or berth collisions |
| **Average Cost per Tonne** | **$12.70 / t** | $12.77 / t (Book-Now) | Net average savings on all cargo |
| **Average Saving per Voyage** | **+$10,600** | $0 (Book-Now) | Evaluated on standard 150,000 t cargo |
| **Decision Win / Loss Ratio** | **6.2% vs. 3.9%** | — | Wins outnumber losses 1.6 : 1 |
| **Decisions Advising Wait** | **10.2%** | — | Highly selective, risk-averse policy |

---

## 📂 Project Repository Structure

```
FreightIQ/
├── backend/                        # FastAPI Application & Analytical Endpoints
│   ├── api/
│   │   ├── console_api.py         # Unified High-Performance Console Router
│   │   ├── forecast.py            # Freight Rate Forecasting API
│   │   ├── decision.py            # Chartering Decision Engine API
│   │   ├── ports.py               # Port Screening & Matrix API
│   │   ├── replay.py              # Time Machine Historical Replay API
│   │   ├── backtest.py            # Backtest Analytics & Sensitivity API
│   │   └── metadata.py            # Fleet & Route Metadata
│   ├── main.py                    # FastAPI Entrypoint & Middleware Configuration
│   ├── schemas.py                 # Pydantic Request & Response Data Models
│   └── services.py                # Core Service Bridge to Analytical Engine
│
├── freightiq/                      # Core Algorithmic & Mathematical Library
│   ├── config.py                  # Fleet Dimensions, Demurrage Rates, Port Constants
│   ├── datagen.py                 # Synthetic Market Generator & Real CSV Ingestion
│   ├── forecast.py                # Quantile Gradient Boosting & Conformal Calibration
│   ├── ports.py                   # Berth, Draft, LOA, and Beam Screening Logic
│   ├── decision.py                # Monte Carlo All-In Cost Optimization Model
│   └── backtest.py                # Walk-Forward Backtesting Harness (No Lookahead)
│
├── frontend/                       # React 19 + TypeScript + Vite Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── console/           # Console Panels (Decide, PortScreen, Backtest, TimeMachine)
│   │   │   ├── landing/           # Landing Page Sections (Hero, Marquee, Stakes, Bento, etc.)
│   │   │   ├── ForecastChart.jsx  # Interactive SVG Forecast Fan Chart Component
│   │   │   ├── Nav.jsx            # Sticky Navigation Header with Smooth-Scroll Anchors
│   │   │   └── Footer.jsx         # Institutional Footer & Metadata
│   │   ├── lib/
│   │   │   └── api.js             # Unified Axios Backend API Client
│   │   ├── pages/
│   │   │   ├── Landing.jsx        # Institutional Landing Page Route
│   │   │   └── Console.jsx        # 4-Panel Interactive Decision Console Route
│   │   ├── App.jsx                # Router & Lenis Smooth Scroll Setup
│   │   └── index.css              # Custom Maritime Design System & Color Tokens
│   └── vite.config.ts             # Vite Configuration & Backend Proxy Setup
│
├── data/
│   └── ports.json                 # Physical Port Constraints for 7 East Coast Ports
│
├── results/                        # Generated Backtest Artifacts & Verification CSVs
│   ├── backtest_decisions.csv     # 738-Decision Walk-Forward Replay Log
│   ├── backtest_summary.json      # Headline Metric Summaries
│   └── sensitivity.csv            # Cost-of-Waiting Sensitivity Sweep
│
├── tests/                         # Pytest Automated Test Suite
│   ├── test_api.py                # FastAPI Endpoint Integration Tests
│   ├── test_core.py               # Mathematical & Physical Constraint Tests
│   └── test_end_to_end.py         # Full Decision Pipeline Verification Tests
│
├── app.py                         # Streamlit Dashboard (Alternative Launcher)
├── run_server.py                  # FastAPI Server Launcher Script
├── start_fullstack.bat            # One-Click Full-Stack Windows Batch Launcher
├── requirements.txt               # Python Dependencies
└── README.md                      # Comprehensive Technical Documentation
```

---

## ⚖️ Judge Q&A & Technical Defense

**Q1: Is this real or synthetic market data?**
> **Answer**: The application demonstrates the complete mathematical pipeline using a calibrated synthetic market structured with realistic persistence, mean reversion, seasonality, and freight jumps. The data loader accepts real commercial CSV files (`rates.csv`, `congestion.csv`, `coal.csv`) without code modifications.

**Q2: Why are the percentage savings modest (~0.55%)?**
> **Answer**: Waiting alone provides a measured, realistic timing edge. The predominant commercial value lies in avoiding costly physical berthing violations, eliminating $340,000 demurrage spikes, and providing quantified P90 downside protection.

**Q3: How is look-ahead bias strictly prevented?**
> **Answer**: Models are retrained every 26 weeks using only data resolved prior to the decision date. An automated unit test intentionally attempts to poison future rate rows and verifies that historical forecasts remain completely unaffected.

---

## 👥 Team & License

- **Team**: Code Hunters (NOVEX Hackathon 2026 Finalists)
- **Track**: Logistics & Supply Chain — AI-Based Decision Support
- **License**: MIT License — Open for academic, research, and non-commercial maritime decision-support benchmarking.
