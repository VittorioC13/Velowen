@echo off
echo ========================================
echo Installing GPT-SoVITS Requirements
echo ========================================
echo.

cd /d "%~dp0\..\..\GPT-SoVITS"

echo Installing compatible NumPy version...
pip install "numpy<2.0" --force-reinstall
if errorlevel 1 (
    echo WARNING: NumPy installation had issues, continuing...
)

echo.
echo Installing requirements (this will take 10-20 minutes)...
echo Some packages may fail - this is normal!
echo.

REM Install requirements but skip packages that need compilation
pip install -r requirements.txt --no-build-isolation 2>&1 | findstr /V "ERROR:"
if errorlevel 1 (
    echo.
    echo Some packages failed - trying to install core packages manually...
)

echo.
echo Installing core packages manually...
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install librosa soundfile scipy
pip install transformers accelerate
pip install gradio
pip install cn2an jieba pypinyin

echo.
echo ========================================
echo Installation attempt complete!
echo ========================================
echo.
echo Try running: python webui.py
echo If errors occur, GPT-SoVITS will install missing packages on first run.
echo.
pause

