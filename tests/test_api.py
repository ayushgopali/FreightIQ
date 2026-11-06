"""Integration tests for the FreightIQ FastAPI application."""
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_and_metadata():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"

    r = client.get("/api/metadata")
    assert r.status_code == 200
    data = r.json()
    assert "Paradip" in data["ports"]
    assert "Capesize" in data["ship_classes"]
    assert len(data["demo_presets"]) >= 2


def test_ports_endpoints():
    r = client.get("/api/ports")
    assert r.status_code == 200
    ports = r.json()["ports"]
    assert len(ports) == 7
    assert "Paradip" in ports and "Haldia" in ports

    # Haldia port feasibility: Capesize must be blocked
    r = client.get("/api/ports/Haldia?cargo_t=150000")
    assert r.status_code == 200
    haldia = r.json()
    cape = next(s for s in haldia["ships"] if s["ship"] == "Capesize")
    assert not cape["feasible"]
    assert cape["status"] == "Blocked"

    # Visakhapatnam: Capesize should be part-loaded
    r = client.get("/api/ports/Visakhapatnam?cargo_t=150000")
    assert r.status_code == 200
    vizag = r.json()
    cape_vizag = next(s for s in vizag["ships"] if s["ship"] == "Capesize")
    assert cape_vizag["feasible"]
    assert cape_vizag["status"] == "Part-load"


def test_forecast_endpoint():
    payload = {"origin": "South Africa", "ship_class": "Capesize"}
    r = client.post("/api/forecast", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["origin"] == "South Africa"
    assert len(data["forecast"]) == 8
    for pt in data["forecast"]:
        assert pt["p10"] <= pt["p50"] <= pt["p90"]


def test_decision_engine_endpoint():
    payload = {
        "origin": "South Africa",
        "port_name": "Paradip",
        "cargo_t": 150000,
        "window_weeks": 6,
        "wait_cost_pt_week": 0.05,
        "risk_aversion": 0.3,
        "margin_pct": 1.0
    }
    r = client.post("/api/decision/analyse", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["feasible"] is True
    assert res["action"].startswith(("BOOK NOW", "WAIT"))
    assert res["recommended_ship"] in ["Handysize", "Supramax", "Panamax", "Capesize"]
    assert res["drivers"] is not None
    assert "mom4_pct" in res["drivers"]


def test_replay_win_and_loss_cases():
    # 2023-08-27 Win Case
    r_win = client.post("/api/replay", json={
        "asof_date": "2023-08-27",
        "origin": "Australia",
        "port_name": "Paradip",
        "cargo_t": 150000,
        "window_weeks": 6
    })
    assert r_win.status_code == 200
    d_win = r_win.json()
    assert d_win["is_win"] is True
    assert d_win["realised_saving_pt"] > 0

    # 2023-07-02 Loss Case
    r_loss = client.post("/api/replay", json={
        "asof_date": "2023-07-02",
        "origin": "Australia",
        "port_name": "Visakhapatnam",
        "cargo_t": 150000,
        "window_weeks": 6
    })
    assert r_loss.status_code == 200
    d_loss = r_loss.json()
    assert d_loss["is_win"] is False
    assert d_loss["realised_saving_pt"] < 0


def test_backtest_and_methodology():
    r_bt = client.get("/api/backtest/summary")
    assert r_bt.status_code == 200
    bt = r_bt.json()
    assert bt["n_decisions"] == 738
    assert len(bt["sensitivity"]) > 0

    r_meth = client.get("/api/methodology")
    assert r_meth.status_code == 200
    meth = r_meth.json()
    assert len(meth["pipeline"]) == 5
