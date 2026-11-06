"""Historical time-machine decision replay endpoints."""
from fastapi import APIRouter, HTTPException, Query
from backend.schemas import ReplayRequest, ReplayResponse
from backend.services import run_historical_replay

router = APIRouter(prefix="/replay", tags=["Historical Replay"])


@router.post("", response_model=ReplayResponse)
def execute_replay(req: ReplayRequest):
    try:
        return run_historical_replay(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/presets")
def get_presets():
    return {
        "presets": [
            {
                "id": "win_2023_08_27",
                "date": "2023-08-27",
                "origin": "Australia",
                "port_name": "Paradip",
                "cargo_t": 150000,
                "window_weeks": 6,
                "label": "2023-08-27 — Demonstrated Win (+$2.94/t saving)",
                "type": "win"
            },
            {
                "id": "loss_2023_07_02",
                "date": "2023-07-02",
                "origin": "Australia",
                "port_name": "Visakhapatnam",
                "cargo_t": 150000,
                "window_weeks": 6,
                "label": "2023-07-02 — Documented Loss (-$1.61/t)",
                "type": "loss"
            }
        ]
    }
