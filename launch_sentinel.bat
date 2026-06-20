@echo off
echo ======================================================
echo NexaCore Sentinel AI: Booting System...
echo ======================================================

:: 1. Start ML Service
echo Starting ML Intelligence Engine (Port 8000)...
start "NexaCore ML Service" cmd /k "cd ml-service && python main.py"

:: 2. Start Backend API
echo Starting Backend Orchestrator (Port 5000)...
start "NexaCore Backend API" cmd /k "cd backend && npm start"

:: 3. Start Frontend UI
echo Starting Frontend Dashboard (Port 5173)...
start "NexaCore Frontend" cmd /k "cd frontend && npm run dev"

echo ======================================================
echo System Launched!
echo.
echo Dashboard: http://localhost:5173
echo API:       http://localhost:5000/api
echo ML Docs:   http://localhost:8000/docs
echo ======================================================
echo.
echo Keep this window open or close it (the others will stay running).
pause
