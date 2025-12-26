@echo off
cd /d "%~dp0"

echo Force pushing to GitHub...
echo.

REM Try to find git in common locations
set GIT_PATH=
if exist "C:\Program Files\Git\cmd\git.exe" set GIT_PATH=C:\Program Files\Git\cmd\git.exe
if exist "C:\Program Files (x86)\Git\cmd\git.exe" set GIT_PATH=C:\Program Files (x86)\Git\cmd\git.exe
if exist "%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" (
    for /f "delims=" %%i in ('dir /b /s "%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" 2^>nul') do set GIT_PATH=%%i
)

if "%GIT_PATH%"=="" (
    echo ERROR: Git not found!
    echo Please add Git to your PATH or run this from GitHub Desktop.
    echo.
    echo Alternative: In GitHub Desktop, go to Repository ^> Open in Command Prompt
    echo Then run: git push -u origin main --force
    pause
    exit /b 1
)

echo Using Git at: %GIT_PATH%
echo.

"%GIT_PATH%" remote set-url origin https://github.com/VittorioC13/Velowen.git
"%GIT_PATH%" add .
"%GIT_PATH%" commit -m "Add Image to 3D feature" --allow-empty
"%GIT_PATH%" branch -M main
"%GIT_PATH%" push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Pushed to GitHub!
    echo ========================================
    echo Vercel will auto-deploy to velowen.vercel.app
) else (
    echo.
    echo ERROR: Push failed!
    echo You may need to authenticate.
    echo Try: "%GIT_PATH%" push -u origin main --force
)

pause

