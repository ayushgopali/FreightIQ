"""FastAPI ASGI entrypoint for Vercel Serverless and production deployment.
Exports the top-level FastAPI instance 'app' from backend.main.
"""
from backend.main import app

# Top-level ASGI FastAPI instance for Vercel and ASGI runners
__all__ = ["app"]
