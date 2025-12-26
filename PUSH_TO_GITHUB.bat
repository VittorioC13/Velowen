@echo off
echo ========================================
echo Pushing to GitHub...
echo ========================================
echo.

cd /d "%~dp0"

echo Checking git...
git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed or not in PATH!
    echo Please install Git or add it to your PATH.
    pause
    exit /b 1
)

echo.
echo Initializing git repo (if needed)...
if not exist .git (
    git init
)

echo.
echo Adding all files...
git add .

echo.
echo Committing changes...
git commit -m "Add Image to 3D feature integration" 2>nul || git commit -m "Update: Add Image to 3D feature"

echo.
echo Setting remote (if needed)...
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    git remote add origin https://github.com/VittorioC13/Velowen.git
) else (
    git remote set-url origin https://github.com/VittorioC13/Velowen.git
)

echo.
echo Pushing to GitHub...
git push -u origin main 2>nul || git push -u origin master 2>nul || (
    echo.
    echo ERROR: Could not push automatically.
    echo You may need to:
    echo 1. Set your branch name: git branch -M main
    echo 2. Push manually: git push -u origin main
    echo 3. Or authenticate with GitHub
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Pushed to GitHub!
echo ========================================
echo.
echo Vercel should automatically deploy the changes.
echo Check: https://velowen.vercel.app
echo.
pause

