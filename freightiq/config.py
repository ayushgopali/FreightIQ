"""Central configuration. Everything an importer or judge may want to tweak lives here or in data/*.json."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
RESULTS_DIR = ROOT / "results"

HORIZONS = 8                      # weeks ahead
QUANTILES = (0.10, 0.50, 0.90)    # 80% forecast range
Z80 = 1.2816                      # z-score of the 90th percentile

ORIGINS = ["Indonesia", "South Africa", "Australia"]
CLASSES = ["Handysize", "Supramax", "Panamax", "Capesize"]

# $/tonne long-run freight level per (origin, class). SYNTHETIC calibration, replace with real data.
BASE_RATE = {
    ("Indonesia", "Handysize"): 11.5, ("Indonesia", "Supramax"): 9.5,
    ("Indonesia", "Panamax"): 8.6,   ("Indonesia", "Capesize"): 8.0,
    ("South Africa", "Handysize"): 19.0, ("South Africa", "Supramax"): 15.5,
    ("South Africa", "Panamax"): 13.5,   ("South Africa", "Capesize"): 10.5,
    ("Australia", "Handysize"): 21.0, ("Australia", "Supramax"): 17.0,
    ("Australia", "Panamax"): 14.5,   ("Australia", "Capesize"): 11.8,
}

# Ship classes: dimensions in metres, DWT in tonnes, demurrage in USD/day (indicative market levels).
SHIPS = {
    "Handysize": dict(dwt=35000,  loa=180, beam=28.0, design_draft=10.0, light_draft=4.5, demurrage=9000),
    "Supramax":  dict(dwt=58000,  loa=190, beam=32.3, design_draft=12.8, light_draft=5.5, demurrage=13000),
    "Panamax":   dict(dwt=82000,  loa=229, beam=32.3, design_draft=14.5, light_draft=6.0, demurrage=17000),
    "Capesize":  dict(dwt=170000, loa=289, beam=45.0, design_draft=18.2, light_draft=7.0, demurrage=26000),
}

UKC_M = 0.6              # under-keel clearance safety margin applied to every port's max draft
MIN_LOAD_FRACTION = 0.55 # below this fraction of DWT a ship is treated as uneconomic at that port
