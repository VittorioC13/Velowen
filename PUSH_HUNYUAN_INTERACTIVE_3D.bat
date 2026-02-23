@echo off
echo ========================================
echo Pushing Hunyuan Interactive 3D Upgrade
echo ========================================
echo.
echo Changes:
echo - Enhanced GLB mesh viewer with WASD controls
echo - Interactive camera movement and rotation
echo - Improved lighting for anime meshes
echo - Added control hints UI overlay
echo ========================================
echo.

cd /d "%~dp0"

echo Checking git...
git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed or not in PATH!
    pause
    exit /b 1
)

echo.
echo Adding changes...
git add .

echo.
echo Committing...
git commit -m "feat: Upgrade Hunyuan to interactive 3D object with WASD controls

- Enhanced GLB mesh viewer with full camera movement (WASD + Q/E + Space/Shift)
- Improved lighting system optimized for anime meshes (4-light setup)
- Added control hints overlay for better UX
- Extended distance range (0.1-50) for close inspection and wide views
- Material enhancements for softer anime aesthetic"

echo.
echo Pushing to GitHub...
git push origin main 2>nul || git push origin master 2>nul || (
    echo.
    echo Trying to set upstream...
    git push -u origin main 2>nul || git push -u origin master
)

echo.
echo ========================================
echo SUCCESS! Changes pushed to GitHub!
echo ========================================
echo.
echo Vercel will auto-deploy in ~2-3 minutes.
echo.
echo Check deployment at:
echo https://velowen.vercel.app/image-to-3d
echo https://velowen.art/image-to-3d
echo.
echo Select "Hunyuan (Anime)" model and test the new controls!
echo.
pause
