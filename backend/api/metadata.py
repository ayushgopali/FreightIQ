"""System metadata and health check endpoints."""
from fastapi import APIRouter
from freightiq.config import SHIPS, ORIGINS, CLASSES
from backend.schemas import MetadataResponse
from backend.services import get_system_metadata, get_market_and_features

router = APIRouter(tags=["Metadata"])


@router.get("/health")
def get_health():
    market, _ = get_market_and_features()
    return {
        "status": "healthy",
        "service": "FreightIQ Maritime Decision Intelligence Engine",
        "version": "1.0.0",
        "data_source": market["source"]
    }


@router.get("/metadata", response_model=MetadataResponse)
def get_metadata():
    return get_system_metadata()


@router.get("/origins")
def get_origins():
    return {"origins": ORIGINS}


@router.get("/vessel-classes")
def get_vessel_classes():
    return {"vessel_classes": SHIPS}
