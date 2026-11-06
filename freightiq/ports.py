"""Port screening: hard constraints (dimensions, draft) -> only feasible ships are shown."""
import json
from .config import DATA_DIR, SHIPS, UKC_M, MIN_LOAD_FRACTION


def load_ports():
    with open(DATA_DIR / "ports.json") as f:
        return json.load(f)["ports"]


def screen(ship_name: str, port: dict, cargo_t: float) -> dict:
    """Return feasibility + the cargo this ship can actually lift to/from this port."""
    s = SHIPS[ship_name]
    out = dict(ship=ship_name, feasible=True, reason="OK", usable_load=float(s["dwt"]),
               utilisation=1.0, voyages=1)
    if s["loa"] > port["max_loa"]:
        out.update(feasible=False, reason=f"Length {s['loa']} m exceeds port limit {port['max_loa']} m", usable_load=0.0, utilisation=0.0, voyages=0)
        return out
    if s["beam"] > port["max_beam"]:
        out.update(feasible=False, reason=f"Beam {s['beam']} m exceeds port limit {port['max_beam']} m", usable_load=0.0, utilisation=0.0, voyages=0)
        return out
    usable_draft = port["max_draft"] - UKC_M
    frac = (usable_draft - s["light_draft"]) / (s["design_draft"] - s["light_draft"])
    frac = max(0.0, min(1.0, frac))
    load = s["dwt"] * frac
    out["usable_load"] = load
    out["utilisation"] = frac
    if frac < MIN_LOAD_FRACTION:
        out.update(feasible=False, reason=f"Draft limit {port['max_draft']} m allows only {frac:.0%} of DWT (min {MIN_LOAD_FRACTION:.0%})")
        return out
    if frac < 0.999:
        out["reason"] = f"Part-loaded to {frac:.0%} of DWT by draft limit (freight per tonne rises)"
    out["voyages"] = int(-(-cargo_t // load)) if load > 0 else 0
    return out


def screen_all(port: dict, cargo_t: float) -> list[dict]:
    return [screen(c, port, cargo_t) for c in SHIPS]
