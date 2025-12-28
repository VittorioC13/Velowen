@echo off
echo ========================================
echo Deploy Yukino Model to Modal
echo ========================================
echo.

cd /d "%~dp0\.."

REM Check if model exists
if not exist "yukino_model" (
    echo ERROR: yukino_model directory not found!
    echo.
    echo Please train the model first using GPT-SoVITS.
    echo Then export model files to: yukino_model/
    echo.
    pause
    exit /b 1
)

echo Checking Modal installation...
pip show modal >nul 2>&1
if errorlevel 1 (
    echo Installing Modal...
    pip install modal
)

echo.
echo Authenticating with Modal...
modal token new
if errorlevel 1 (
    echo ERROR: Modal authentication failed!
    pause
    exit /b 1
)

echo.
echo Creating Modal volume...
modal volume create velowen-voice-models
if errorlevel 1 (
    echo Volume may already exist, continuing...
)

echo.
echo Uploading Yukino model...
echo This may take a few minutes...
modal volume put velowen-voice-models yukino/ yukino_model/
if errorlevel 1 (
    echo ERROR: Upload failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Upload Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update modal_tts/app.py with actual GPT-SoVITS inference code
echo 2. Deploy Modal function:
echo    cd modal_tts
echo    modal deploy app.py
echo 3. Get endpoint URL and add to Vercel environment variables
echo.
pause

