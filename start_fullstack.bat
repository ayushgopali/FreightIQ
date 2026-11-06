@echo off
echo =========================================================================
echo              FREIGHTIQ — MARITIME CHARTERING DECISION TERMINAL
echo               NOVEX Hackathon 2026 - Final Round Presentation
echo =========================================================================
echo.
echo [1/2] Starting High-Performance FastAPI Analytical Engine on port 8000...
start "FreightIQ Analytical Backend" cmd /k "cd /d %~dp0 && python run_server.py"

echo [2/2] Starting React + TypeScript Maritime Terminal on port 5173...
start "FreightIQ React Terminal" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul
echo.
echo Launching FreightIQ Decision Terminal in browser...
start http://localhost:5173

echo.
echo Both services are running:
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://127.0.0.1:8000
echo   - Swagger:  http://127.0.0.1:8000/docs
echo =========================================================================
