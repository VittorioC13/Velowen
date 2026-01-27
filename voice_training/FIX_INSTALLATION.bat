@echo off
echo ========================================
echo Fixing GPT-SoVITS Installation Issues
echo ========================================
echo.

cd /d "%~dp0\..\..\GPT-SoVITS"

echo Step 1: Installing NumPy (pre-built wheel)...
pip install numpy --only-binary :all:
if errorlevel 1 (
    echo Trying alternative: pip install numpy==1.26.4 --only-binary :all:
    pip install numpy==1.26.4 --only-binary :all:
)

echo.
echo Step 2: Installing ffmpeg-python...
pip install ffmpeg-python

echo.
echo Step 3: Installing other critical dependencies...
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install librosa soundfile scipy

echo.
echo Step 4: Installing remaining requirements (may have some failures)...
pip install -r requirements.txt --no-build-isolation

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Some packages may have failed - that's OK.
echo GPT-SoVITS will install missing packages on first run.
echo.
echo Try running: python webui.py
echo.
pause

