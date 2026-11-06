"""Backtest analytics and validation evidence endpoints."""
from fastapi import APIRouter, HTTPException
from backend.schemas import BacktestSummaryResponse
from backend.services import get_backtest_analytics

router = APIRouter(prefix="/backtest", tags=["Backtest & Analytics"])


@router.get("/summary", response_model=BacktestSummaryResponse)
def get_summary():
    try:
        return get_backtest_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/horizons")
def get_horizons():
    data = get_backtest_analytics()
    return {
        "mae_by_horizon": data.mae_model_vs_naive_by_h,
        "coverage80_by_horizon": data.coverage80_by_h,
        "overall_improvement_pct": data.mae_improvement_pct,
        "overall_coverage": data.coverage80_overall
    }


@router.get("/sensitivity")
def get_sensitivity():
    data = get_backtest_analytics()
    return {"sensitivity": data.sensitivity}
