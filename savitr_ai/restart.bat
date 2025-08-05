@echo off
echo Starting Savitr AI API server...

REM Check if Python is installed
where python > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH. Please install Python 3.9 or higher.
    pause
    exit /b 1
)

REM Activate virtual environment if exists, or create one
if exist .venv (
    echo Activating virtual environment...
    call .venv\Scripts\activate
) else (
    echo Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate
    
    echo Installing required packages...
    pip install flask flask-cors pandas scikit-learn ortools numpy folium
)

REM Start the Flask server
echo Starting Flask API server...
python app.py

REM Keep the window open in case of errors
pause

echo Savitr AI API server started at http://localhost:5000
echo You can now access the API endpoints
echo - http://localhost:5000/ (Health check)
echo - http://localhost:5000/api/slot (Slot prediction) 