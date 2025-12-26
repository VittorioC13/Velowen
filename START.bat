@echo off
echo ========================================
echo Starting Velowen.art Server
echo ========================================
echo.
echo Server will be available at: http://localhost:5000
echo Image to 3D page: http://localhost:5000/image-to-3d
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "%~dp0"
call npm run dev

