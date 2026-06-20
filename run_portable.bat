@echo off
setlocal

set PORTABLE_DIR=%~dp0portable
set NODE_PATH=%PORTABLE_DIR%\node-v20.11.0-win-x64
set PG_PATH=%PORTABLE_DIR%\pgsql

echo ======================================================
echo NexaCore Sentinel AI: Booting System (Portable Mode)
echo ======================================================

:: 1. Ensure PostgreSQL is running
echo Checking database status...
"%PG_PATH%\bin\pg_ctl.exe" -D "%PG_PATH%\data" status >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting PostgreSQL Database...
    "%PG_PATH%\bin\pg_ctl.exe" -D "%PG_PATH%\data" -l "%PG_PATH%\postgres.log" start
    timeout /t 3 /nobreak >nul
) else (
    echo Database is already running.
)

:: Prepend portable Node.js to PATH for the child windows
set PATH=%NODE_PATH%;%PATH%

:: 2. Start ML Service
echo Starting ML Intelligence Engine (Port 8000)...
start "NexaCore ML Service" cmd /k "cd /d \"%~dp0ml-service\" && python main.py"

:: 3. Start Backend API
echo Starting Backend Orchestrator (Port 5000)...
start "NexaCore Backend API" cmd /k "set PATH=%NODE_PATH%;%%PATH%% && cd /d \"%~dp0backend\" && npm start"

:: 4. Start Frontend UI
echo Starting Frontend Dashboard (Port 5173)...
start "NexaCore Frontend" cmd /k "set PATH=%NODE_PATH%;%%PATH%% && cd /d \"%~dp0frontend\" && npm run dev"

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
