@echo off
echo ========================================
echo GPT-SoVITS Setup Script
echo ========================================
echo.

cd /d "%~dp0\.."

if exist "GPT-SoVITS" (
    echo GPT-SoVITS already exists!
    cd GPT-SoVITS
    goto :install
)

echo Cloning GPT-SoVITS repository...
git clone https://github.com/RVC-Boss/GPT-SoVITS.git
if errorlevel 1 (
    echo Failed to clone GPT-SoVITS!
    pause
    exit /b 1
)

cd GPT-SoVITS

:install
echo.
echo Installing dependencies...
echo This may take a while...
pip install -r requirements.txt
if errorlevel 1 (
    echo Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: python webui.py
echo 2. Or use: go-webui.bat (if available)
echo.
pause

