@echo off
cd /d %~dp0
echo Starting FreightIQ Backend API on port 8000...
python run_server.py
