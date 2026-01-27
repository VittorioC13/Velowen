@echo off
echo ========================================
echo Fixing GPT-SoVITS Installation Issues
echo ========================================
echo.

cd /d "%~dp0\..\..\GPT-SoVITS"

echo Step 1: Installing NumPy (pre-built wheel)...
pip install numpy --only-binary :all:
if errorlevel 1 (
    echo ERROR: NumPy installation failed!
    echo.
    echo Solution: Install Visual Studio Build Tools
    echo Download from: https://visualstudio.microsoft.com/downloads/
    echo Install "Desktop development with C++" workload
    pause
    exit /b 1
)

echo.
echo Step 2: Installing ffmpeg-python...
pip install ffmpeg-python
if errorlevel 1 (
    echo WARNING: ffmpeg-python installation failed
    echo This may be OK if ffmpeg system binary is installed
)

echo.
echo Step 3: Installing other dependencies...
echo This may take 10-20 minutes...
pip install -r requirements.txt --no-build-isolation
if errorlevel 1 (
    echo.
    echo WARNING: Some packages failed to install
    echo This is normal - GPT-SoVITS will install missing packages on first run
    echo.
)

echo.
echo ========================================
echo Installation Fix Complete!
echo ========================================
echo.
echo Try running: python webui.py
echo.
pause
