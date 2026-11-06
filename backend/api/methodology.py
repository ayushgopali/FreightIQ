"""Methodology documentation, mathematical formulations, and provenance."""
from fastapi import APIRouter

router = APIRouter(prefix="/methodology", tags=["Methodology"])


@router.get("")
def get_methodology():
    return {
        "title": "FreightIQ Mathematical & Algorithmic Architecture",
        "category": "Maritime Freight Intelligence & Risk-Adjusted Chartering Optimization",
        "pipeline": [
            {
                "step": 1,
                "name": "Feature Engineering & Market Representation",
                "description": "Constructs direct multi-horizon features from weekly freight rates, congestion index, and benchmark coal prices. Log-transformed momentum features (1, 4, 13 weeks), deviation from 52-week rolling average (mean-reversion pressure), harmonic Fourier seasonality (sin/cos of week of year), lagged port congestion, and 4-week coal price change.",
                "formula": "r_{t,h} = \\ln(\\text{rate}_{t+h}) - \\ln(\\text{rate}_t)"
            },
            {
                "step": 2,
                "name": "Quantile Gradient Boosting & Conformal Calibration",
                "description": "Direct multi-horizon HistGradientBoostingRegressor models trained independently per (horizon h ∈ [1,8], quantile q ∈ {0.10, 0.50, 0.90}). Conformalized Quantile Regression (CQR) on a held-out 52-week calibration window guarantees empirical coverage without distributional assumptions.",
                "formula": "Q_h = \\text{Quantile}_{1-\\alpha}\\left( \\max(\\hat{q}_{10} - y, y - \\hat{q}_{90}) \\right)"
            },
            {
                "step": 3,
                "name": "Naive Baseline Fallback Gate",
                "description": "For each horizon h, if the boosted median model does not outperform the naive persistence forecast (no-change) on the calibration window (MAE_model >= MAE_naive), the system automatically falls back to naive persistence with an empirical residual band.",
                "rule": "\\text{if } \\text{MAE}_{model}(h) \\ge \\text{MAE}_{naive}(h) \\implies \\text{Fallback to Naive}"
            },
            {
                "step": 4,
                "name": "Physical Port Constraint Screening",
                "description": "Hard boundary checks against destination port limits: max LOA, max beam, and max draft with an explicit Under-Keel Clearance margin (UKC = 0.6m). Ships exceeding draft limits are evaluated under part-load conditions, incurring a proportional deadweight penalty on freight per usable tonne.",
                "formula": "\\text{Load Fraction} = \\frac{(\\text{Max Draft} - \\text{UKC}) - \\text{Light Draft}}{\\text{Design Draft} - \\text{Light Draft}}"
            },
            {
                "step": 5,
                "name": "Monte Carlo Cost Simulation & Decision Rule",
                "description": "Simulates 4,000 draws from an asymmetric two-piece distribution matching calibrated quantiles (P10, P50, P90). Evaluates all-in landed cost per tonne combining ocean freight, congestion-dependent demurrage, and weekly waiting penalties across laycan windows.",
                "formula": "\\text{Cost/t} = \\text{Freight} \\times \\frac{\\text{DWT}}{\\text{Usable Load}} + \\frac{\\text{Wait Days} \\times \\text{Demurrage}}{\\text{Usable Load}} + \\text{Wait Cost} \\times k",
                "decision_rule": "\\text{Score} = \\mu + \\lambda(P_{90} - \\mu), \\quad \\text{Wait iff } \\text{Score}_{wait} < \\text{Score}_{now} \\times (1 - \\text{margin})"
            }
        ],
        "parameters": {
            "default_risk_aversion_lambda": 0.30,
            "default_wait_cost_pt_week": 0.05,
            "default_margin_pct": 1.0,
            "default_demurrage_multiplier": 1.0,
            "under_keel_clearance_ukc_m": 0.6,
            "min_load_fraction": 0.55
        },
        "provenance": {
            "current_data_source": "Synthetic stochastic market generator (Ornstein-Uhlenbeck with jump-diffusion and co-movement)",
            "purpose": "Pipeline verification, protocol validation, and zero-lookahead backtest benchmarking for NOVEX Hackathon 2026",
            "real_data_plug": "Drop rates.csv, congestion.csv, coal.csv into data/real/ for instant live activation with zero code modifications",
            "port_limits_status": "Indicative unverified placeholders flagged verified: false, requiring port authority sign-off"
        },
        "references": [
            "Baltic Exchange (balticexchange.com) — Standard Dry Bulk Route Definitions & Baltic Capesize/Panamax/Supramax Indices",
            "Ministry of Ports, Shipping and Waterways, Government of India (shipmin.gov.in)",
            "Indian Ports Association (ipa.nic.in)",
            "Romano, Patterson & Candès (2019), 'Conformalized Quantile Regression', NeurIPS",
            "Paradip Port Authority (paradipport.gov.in) & Visakhapatnam Port Authority (vizagport.com)"
        ]
    }
