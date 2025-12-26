@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Auto-pushing to GitHub...
echo ========================================
echo.

cd /d "%~dp0"

:: Try to find git
set GIT_PATH=
if exist "C:\Program Files\Git\bin\git.exe" set GIT_PATH=C:\Program Files\Git\bin\git.exe
if exist "C:\Program Files (x86)\Git\bin\git.exe" set GIT_PATH=C:\Program Files (x86)\Git\bin\git.exe
if exist "%LOCALAPPDATA%\Programs\Git\bin\git.exe" set GIT_PATH=%LOCALAPPDATA%\Programs\Git\bin\git.exe
if exist "%USERPROFILE%\AppData\Local\Programs\Git\bin\git.exe" set GIT_PATH=%USERPROFILE%\AppData\Local\Programs\Git\bin\git.exe

if "%GIT_PATH%"=="" (
    echo ERROR: Git not found!
    echo.
    echo Please run this from GitHub Desktop instead:
    echo 1. Click "Add an Existing Repository"
    echo 2. Select this folder: %CD%
    echo 3. Commit and Push
    echo.
    pause
    exit /b 1
)

echo Found Git at: %GIT_PATH%
echo.

:: Initialize if needed
if not exist .git (
    echo Initializing git repository...
    "%GIT_PATH%" init
)

:: Add all files
echo Adding all files...
"%GIT_PATH%" add .

:: Commit
echo Committing changes...
"%GIT_PATH%" commit -m "Add Image to 3D feature integration" 2>nul || "%GIT_PATH%" commit -m "Update: Add Image to 3D feature"

:: Set remote
echo Setting remote...
"%GIT_PATH%" remote remove origin 2>nul
"%GIT_PATH%" remote add origin https://github.com/VittorioC13/Velowen.git

:: Set branch
echo Setting branch to main...
"%GIT_PATH%" branch -M main 2>nul

:: Push
echo.
echo Pushing to GitHub...
echo (You may need to enter your GitHub credentials)
echo.
"%GIT_PATH%" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Pushed to GitHub!
    echo ========================================
    echo Vercel will auto-deploy to velowen.vercel.app
) else (
    echo.
    echo Push failed. You may need to authenticate.
    echo Use GitHub Desktop instead - it's easier!
)

echo.
pause

