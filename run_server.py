"""Launch script for FreightIQ FastAPI server."""
import uvicorn

if __name__ == "__main__":
    print("Starting FreightIQ High-Performance Maritime Intelligence API on http://127.0.0.1:8000 ...")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True, workers=1)
