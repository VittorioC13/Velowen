@echo off
echo ========================================
echo Yukino Voice Model Training Setup
echo ========================================
echo.

cd /d "%~dp0\..\.."

if not exist "GPT-SoVITS" (
    echo ERROR: GPT-SoVITS not found!
    echo Please clone it first:
    echo   cd C:\Users\rotciv\Desktop
    echo   git clone https://github.com/RVC-Boss/GPT-SoVITS.git
    pause
    exit /b 1
)

cd GPT-SoVITS

echo Checking dependencies...
python --version
if errorlevel 1 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

echo.
echo Installing GPT-SoVITS dependencies...
echo This will take 10-20 minutes...
echo.
pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo WARNING: Some dependencies may have failed to install.
    echo This is normal - GPT-SoVITS will install missing packages on first run.
    echo.
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start GPT-SoVITS WebUI:
echo    python webui.py
echo    OR
echo    go-webui.bat (if available)
echo.
echo 2. In the WebUI:
echo    - Upload: C:\Users\rotciv\Desktop\YUKINOSHITA - 1 hour.mp3
echo    - Slice audio into chunks
echo    - Run ASR (Japanese)
echo    - Proofread transcriptions
echo    - Train model (20-30 epochs)
echo.
echo 3. Export model files to: yukino_model/
echo.
pause

