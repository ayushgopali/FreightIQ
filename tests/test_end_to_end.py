"""Comprehensive End-to-End Verification of the 5 NOVEX Live Demonstration Stages."""
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_stage_1_command_centre():
    """Stage 1: Command Centre overview and forecast uncertainty fan."""
    r_meta = client.get("/api/metadata")
    assert r_meta.status_code == 200
    meta = r_meta.json()
    assert "South Africa" in meta["origins"]
    assert "Paradip" in meta["ports"]

    r_fc = client.post("/api/forecast", json={"origin": "South Africa", "ship_class": "Capesize"})
    assert r_fc.status_code == 200
    fc = r_fc.json()
    assert len(fc["history"]) == 52
    assert len(fc["forecast"]) == 8
    # Verify quantile ordering
    for pt in fc["forecast"]:
        assert pt["p10"] <= pt["p50"] <= pt["p90"]


def test_stage_2_chartering_decision():
    """Stage 2: South Africa -> Paradip 150,000 t Chartering Decision Evaluation."""
    payload = {
        "origin": "South Africa",
        "port_name": "Paradip",
        "cargo_t": 150000,
        "window_weeks": 6,
        "wait_cost_pt_week": 0.05,
        "risk_aversion": 0.3,
        "margin_pct": 1.0,
        "dem_mult": 1.0
    }
    r = client.post("/api/decision/analyse", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["feasible"] is True
    assert res["action"] in ["BOOK NOW", "WAIT 1 WEEK(S)", "WAIT 2 WEEK(S)", "WAIT 3 WEEK(S)",
                             "WAIT 4 WEEK(S)", "WAIT 5 WEEK(S)", "WAIT 6 WEEK(S)"]
    assert res["expected_pt"] > 0
    assert res["worst_pt"] >= res["expected_pt"]
    assert res["drivers"] is not None
    assert "mom4_pct" in res["drivers"]
    assert "congestion_pct" in res["drivers"]


def test_stage_3_port_feasibility():
    """Stage 3: Port physical screening across all 7 East Coast ports."""
    r_mat = client.get("/api/ports/matrix?cargo_t=150000")
    assert r_mat.status_code == 200
    mat = r_mat.json()["matrix"]
    assert len(mat) == 7

    # Haldia must block Capesize due to length (200m limit vs 289m) and draft (9m limit vs 18.2m)
    assert mat["Haldia"]["Capesize"]["status"] == "Blocked"
    assert not mat["Haldia"]["Capesize"]["feasible"]

    # Visakhapatnam allows Capesize but part-loaded (~71% utilization)
    assert mat["Visakhapatnam"]["Capesize"]["status"] == "Part-load"
    assert mat["Visakhapatnam"]["Capesize"]["feasible"]
    assert 0.65 <= mat["Visakhapatnam"]["Capesize"]["utilisation"] <= 0.75

    # Paradip allows Handysize, Supramax, Panamax at Full load
    assert mat["Paradip"]["Panamax"]["status"] == "Full"
    assert mat["Paradip"]["Supramax"]["status"] == "Full"


def test_stage_4_historical_replay():
    """Stage 4: Time Machine Hindsight Verification on Win and Loss Presets."""
    # 2023-08-27 Demonstrated Win (Paradip, Australia)
    r_win = client.post("/api/replay", json={
        "asof_date": "2023-08-27",
        "origin": "Australia",
        "port_name": "Paradip",
        "cargo_t": 150000,
        "window_weeks": 6
    })
    assert r_win.status_code == 200
    win_data = r_win.json()
    assert win_data["is_win"] is True
    assert win_data["realised_saving_pt"] > 0
    assert win_data["decision"]["recommended_wait_weeks"] > 0

    # 2023-07-02 Documented Honest Loss (Visakhapatnam, Australia)
    r_loss = client.post("/api/replay", json={
        "asof_date": "2023-07-02",
        "origin": "Australia",
        "port_name": "Visakhapatnam",
        "cargo_t": 150000,
        "window_weeks": 6
    })
    assert r_loss.status_code == 200
    loss_data = r_loss.json()
    assert loss_data["is_win"] is False
    assert loss_data["realised_saving_pt"] < 0


def test_stage_5_backtest_analytics():
    """Stage 5: Backtest evidence on 738 decisions."""
    r = client.get("/api/backtest/summary")
    assert r.status_code == 200
    bt = r.json()
    assert bt["n_decisions"] == 738
    assert bt["port_violations_iq"] == 0
    assert bt["mae_improvement_pct"] >= 10.0
    assert 0.75 <= bt["coverage80_overall"] <= 0.82
    assert len(bt["sensitivity"]) == 8
