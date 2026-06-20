@echo off
echo ======================================================
echo NexaCore Sentinel AI: Project Setup
echo ======================================================

echo [1/3] Installing Backend dependencies...
cd backend
call npm install
cd ..

echo [2/3] Installing Frontend dependencies...
cd frontend
call npm install
cd ..

echo [3/3] Installing ML Service dependencies...
cd ml-service
pip install -r requirements.txt
echo NOTE: Ensure you have Python installed and on your PATH.
cd ..

echo ======================================================
echo Setup Complete! 
echo Run 'launch_sentinel.bat' to start the application.
echo ======================================================
pause
