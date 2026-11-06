"""FreightIQ FastAPI Application Entrypoint."""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.metadata import router as metadata_router
from backend.api.ports import router as ports_router
from backend.api.forecast import router as forecast_router
from backend.api.decision import router as decision_router
from backend.api.replay import router as replay_router
from backend.api.backtest import router as backtest_router
from backend.api.methodology import router as methodology_router
from backend.api.console_api import router as console_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("freightiq.api")

app = FastAPI(
    title="FreightIQ API",
    description="Forecast-Driven Chartering Decision Support Platform for Indian East Coast Bulk Imports",
    version="1.0.0"
)

# Configure CORS for local development & staging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits Vite dev server and local clients
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(console_router, prefix="/api")
app.include_router(metadata_router, prefix="/api")
app.include_router(ports_router, prefix="/api")
app.include_router(forecast_router, prefix="/api")
app.include_router(decision_router, prefix="/api")
app.include_router(replay_router, prefix="/api")
app.include_router(backtest_router, prefix="/api")
app.include_router(methodology_router, prefix="/api")


@app.get("/")
def root():
    return {
        "app": "FreightIQ API",
        "description": "Forecast-Driven Chartering Decision Engine",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }
