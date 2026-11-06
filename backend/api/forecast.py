"""Probabilistic freight rate forecasting endpoints."""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.schemas import ForecastRequest, ForecastResponse
from backend.services import get_forecast_series

router = APIRouter(prefix="/forecast", tags=["Forecast"])


@router.post("", response_model=ForecastResponse)
def post_forecast(req: ForecastRequest):
    try:
        return get_forecast_series(req.origin, req.ship_class, req.asof_date)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=ForecastResponse)
def get_forecast(
    origin: str = Query(default="South Africa"),
    ship_class: str = Query(default="Capesize"),
    asof_date: Optional[str] = Query(default=None)
):
    try:
        return get_forecast_series(origin, ship_class, asof_date)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
