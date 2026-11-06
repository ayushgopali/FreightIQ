"""Chartering decision engine endpoints."""
from fastapi import APIRouter, HTTPException
from backend.schemas import DecisionRequest, DecisionResponse
from backend.services import run_chartering_decision

router = APIRouter(prefix="/decision", tags=["Decision"])


@router.post("/analyse", response_model=DecisionResponse)
def analyse_decision(req: DecisionRequest):
    try:
        return run_chartering_decision(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/default", response_model=DecisionResponse)
def get_default_decision():
    req = DecisionRequest(origin="South Africa", port_name="Paradip", cargo_t=150000, window_weeks=6)
    return run_chartering_decision(req)
